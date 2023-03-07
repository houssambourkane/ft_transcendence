import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { GameState } from '@prisma/client';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { verify } from 'jsonwebtoken';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

class CreateGameDto {
  @IsNotEmpty()
  @IsString()
  background: string;

  @IsOptional()
  @IsString()
  opponentId?: string;
}

const isMuted = (mute: Date | null) =>
  mute ? (new Date(mute) > new Date() ? new Date(mute) : null) : null;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly idUserToSocketIdMap: Map<string, Set<string>> = new Map();
  private readonly games: Map<
    string,
    {
      options: {
        background: string;
      };
      opponentId?: string;
      requester: {
        name: string;
        avatar: string;
      };
    }
  > = new Map();

  @WebSocketServer() server: Server;
  constructor(private prisma: PrismaService) {}

  emitOnlineUsers() {
    this.server.emit('users:online', [...this.idUserToSocketIdMap.keys()]);
  }

  emitGameQueue(socket_id?: string) {
    (socket_id ? this.server.to(socket_id) : this.server).emit(
      'game:queue',
      Object.fromEntries(this.games),
    );
  }

  fetchUser(idClient: string) {
    return [...this.idUserToSocketIdMap.keys()].find((id) =>
      this.idUserToSocketIdMap.get(id).has(idClient),
    );
  }

  handleConnection(client: Socket) {
    try {
      const { id, tfa_required } = verify(
        client.handshake.auth.token,
        process.env.JWT_SECRET,
      ) as {
        id: string;
        tfa_required: boolean;
      };
      if (tfa_required) throw new Error('TFA required');
      const socket_ids = new Set<string>(
        this.idUserToSocketIdMap.get(id) || [],
      );
      socket_ids.add(client.id);
      this.idUserToSocketIdMap.set(id, socket_ids);
      this.emitOnlineUsers();
      this.emitGameQueue(client.id);
    } catch (err) {
      console.error('Invalid token', err);
      return client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      if (this.games.has(client.id)) this.games.delete(client.id);

      const idUser = this.fetchUser(client.id);
      if (!idUser) return;

      this.idUserToSocketIdMap.get(idUser).delete(client.id);
      if (this.idUserToSocketIdMap.get(idUser).size === 0)
        this.idUserToSocketIdMap.delete(idUser);
      this.emitOnlineUsers();
      await this.verifyGames();
    } catch (err) {
      console.error('Disconnection error', err);
      return client.disconnect();
    }
  }

  @SubscribeMessage('room:join')
  async joinRoom(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    const idUser = this.fetchUser(client.id);
    const roomUser = await this.prisma.roomUser.findUnique({
      where: {
        user_id_room_id: {
          room_id: payload,
          user_id: idUser,
        },
      },
    });
    if (roomUser.ban) throw new WsException("User can't join");
    client.join(payload);
  }

  @SubscribeMessage('room:message:send')
  async handleEvent(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    if (!payload.content) return { done: false };
    const idUser = this.fetchUser(client.id);
    if (!idUser) return { done: false };
    const roomUser = await this.prisma.roomUser.findUnique({
      where: {
        user_id_room_id: {
          room_id: payload.room_id,
          user_id: idUser,
        },
      },
    });
    if (roomUser.ban || isMuted(roomUser.mute))
      throw new WsException("User can't send");
    const message = await this.prisma.message.create({
      data: {
        content: payload.content,
        from_id: idUser,
        room_id: payload.room_id,
      },
      include: {
        user: {
          select: {
            avatar: true,
            name: true,
            id: true,
          },
        },
      },
    });
    this.server.to(message.room_id).emit('room:message:new', message);
    return {
      done: true,
    };
  }

  @SubscribeMessage('room:leave')
  async leaveRoom(
    @MessageBody() payload: any,
    @ConnectedSocket() client: Socket,
  ) {
    const idUser = this.fetchUser(client.id);
    if (!idUser) return;
    client.leave(payload);
  }

  @SubscribeMessage('game:create')
  async createGame(
    @MessageBody() payload: CreateGameDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (payload.opponentId) {
      if (this.fetchUser(client.id) === payload.opponentId)
        return { done: false };
      if (
        this.isPlaying(payload.opponentId) ||
        this.isPlaying(this.fetchUser(client.id))
      )
        return { done: false };
    }
    this.games.set(client.id, {
      options: {
        background: payload.background,
      },
      opponentId: payload.opponentId,
      requester: await this.prisma.user.findUnique({
        where: {
          id: this.fetchUser(client.id),
        },
        select: {
          name: true,
          avatar: true,
        },
      }),
    });
    this.emitGameQueue();
    return { done: true };
  }

  @SubscribeMessage('game:queue')
  async joinLobby(@ConnectedSocket() client: Socket) {
    if (this.games.size === 0) return { done: false };
    for (const [id, game] of this.games.entries()) {
      if (game.opponentId) continue;
      const player1_id = this.fetchUser(id);
      const player2_id = this.fetchUser(client.id);
      if (player1_id === player2_id) continue;
      for (const id of this.games.keys()) {
        if (this.fetchUser(id) === player1_id) this.games.delete(id);
        if (this.fetchUser(id) === player2_id) this.games.delete(id);
      }
      this.emitGameQueue();
      const created = await this.prisma.game.create({
        data: {
          background: game.options.background,
          player1_id,
          player2_id,
        },
      });
      this.server.to(id).emit('game:matched', created.id);
      client.emit('game:matched', created.id);
      this.server.emit('games:updated');
      return { done: true };
    }
    return { done: false };
  }

  @SubscribeMessage('game:accept')
  async acceptInvite(@ConnectedSocket() client: Socket) {
    const invite = Array.from(this.games).find(([, q]) => {
      return q.opponentId === this.fetchUser(client.id);
    });
    if (!invite) return { done: false };
    const id = invite[0];
    const game = invite[1];
    const player1_id = this.fetchUser(id);
    const player2_id = this.fetchUser(client.id);
    for (const id of this.games.keys()) {
      if (this.fetchUser(id) === player1_id) this.games.delete(id);
      if (this.fetchUser(id) === player2_id) this.games.delete(id);
    }
    this.emitGameQueue();
    const created = await this.prisma.game.create({
      data: {
        background: game.options.background,
        player1_id,
        player2_id,
      },
    });
    this.server.to(id).emit('game:matched', created.id);
    client.emit('game:matched', created.id);
    this.server.emit('games:updated');
    return { done: true };
  }

  @SubscribeMessage('game:decline')
  async declineInvite(@ConnectedSocket() client: Socket) {
    const invite = Array.from(this.games).find(
      ([, q]) => q.opponentId === this.fetchUser(client.id),
    );
    if (!invite) return { done: false };
    const id = invite[0];
    this.games.delete(id);
    this.emitGameQueue();
    return { done: true };
  }

  @SubscribeMessage('game:cancel')
  async cancelGame(@ConnectedSocket() client: Socket) {
    if (this.games.has(client.id)) {
      this.games.delete(client.id);
      this.emitGameQueue();
    }
    return { done: true };
  }

  @SubscribeMessage('game:move')
  async move(
    @MessageBody() payload: { y: number; game: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (
      !client.rooms.has(payload.game) ||
      !(client.data.role == 'player1' || client.data.role == 'player2')
    )
      return;
    client
      .to(payload.game)
      .emit('game:move', { player: client.data.role, y: payload.y });
  }

  @SubscribeMessage('game:ball')
  async ball(
    @MessageBody() payload: { x: number; y: number; game: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(payload.game) || client.data.role !== 'player1')
      return;
    client.to(payload.game).emit('game:ball', { x: payload.x, y: payload.y });
  }

  async endGame(game_id: string) {
    await this.prisma.game.update({
      where: {
        id: game_id,
      },
      data: {
        state: GameState.finished,
      },
    });
    this.server.to(game_id).emit('game:finished');
    const clients = await this.server.in(game_id).fetchSockets();
    clients.forEach((client) => {
      client.data.role = undefined;
      client.data.game = undefined;
      client.leave(game_id);
    });
  }

  @SubscribeMessage('game:score')
  async score(
    @MessageBody()
    payload: {
      game: string;
      player1: number;
      player2: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.rooms.has(payload.game) || client.data.role !== 'player1')
      return;
    client.to(payload.game).emit('game:score', {
      player1: payload.player1,
      player2: payload.player2,
    });
    await this.prisma.game.update({
      where: { id: payload.game },
      data: {
        player1_score: payload.player1,
        player2_score: payload.player2,
      },
    });
    if (payload.player1 >= 5 || payload.player2 >= 5) {
      await this.endGame(payload.game);
    }
    this.server.emit('games:updated');
  }

  @SubscribeMessage('game:join')
  async joinGame(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.fetchUser(client.id);
    const game = await this.prisma.game.findUniqueOrThrow({
      where: { id: payload },
    });
    if (game.state === GameState.finished) return 'watcher';
    if (game.player1_id === user || game.player2_id === user) {
      let role = game.player1_id === user ? 'player1' : 'player2';
      const clients = await this.server.in(payload).fetchSockets();
      if (clients.find((c) => c.data.role === role)) role = 'watcher';
      client.data.role = role;
    } else {
      client.data.role = 'watcher';
    }
    client.data.game = payload;
    client.join(payload);
    return client.data.role;
  }

  @SubscribeMessage('game:leave')
  async leaveGame(
    @MessageBody() payload: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.data.role = undefined;
    client.data.game = undefined;
    await this.verifyGames();
    client.leave(payload);
  }

  async verifyGames() {
    const liveGames = await this.prisma.game.findMany({
      where: {
        state: GameState.live,
      },
    });
    for (const game of liveGames) {
      const player1_playing = this.isPlaying(game.player1_id, game.id);
      const player2_playing = this.isPlaying(game.player2_id, game.id);
      if (!player1_playing || !player2_playing) {
        if (player1_playing && !player2_playing) {
          await this.prisma.game.update({
            where: {
              id: game.id,
            },
            data: {
              player1_score: 5,
              player2_score: 0,
            },
          });
        }
        if (player2_playing && !player1_playing) {
          await this.prisma.game.update({
            where: {
              id: game.id,
            },
            data: {
              player1_score: 0,
              player2_score: 5,
            },
          });
        }
        await this.endGame(game.id);
        this.server.emit('games:updated');
      }
    }
  }

  isPlaying(user_id: string, game_id?: string) {
    if (!this.idUserToSocketIdMap.has(user_id)) return false;
    for (const socketId of this.idUserToSocketIdMap.get(user_id)) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (
        ['player1', 'player2'].includes(socket.data.role) &&
        (!game_id || socket.data.game === game_id)
      )
        return true;
    }
    return false;
  }
}
