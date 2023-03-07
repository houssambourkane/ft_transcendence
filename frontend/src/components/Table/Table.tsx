import { useCallback, useContext, useEffect, useState } from "react";
import { SocketContext } from "../../utils";
import { Ball, createBall } from "./Ball";
import { Player } from "./Player";
import Prepare from "./Prepare";
import { collision, lerp } from "./Update";
import { backgrounds } from "../../shared";

const FPS = 30;

function throttle(cb: Function, delay = 1000) {
  let shouldWait = false;
  let waitingArgs: any[] | null = null;
  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false;
    } else {
      cb(...waitingArgs);
      waitingArgs = null;
      setTimeout(timeoutFunc, delay);
    }
  };

  return (...args: any[]) => {
    if (shouldWait) {
      waitingArgs = args;
      return;
    }

    cb(...args);
    shouldWait = true;
    setTimeout(timeoutFunc, delay);
  };
}

function getReverse(color: string): string {
  var reverseColor: string;
  color = color.substring(1);
  reverseColor = (Number(`0x1${color}`) ^ 0xffffff)
    .toString(16)
    .substr(1)
    .toUpperCase();
  return "#" + reverseColor;
}

export default function Table({
  game,
  role = "player1",
  personColor = "#FFFFFF",
  aiColor = "#FFFFFF",
  ballColor = "#FFFFFF",
  level = 0,
}: {
  game?: Game;
  role: "player1" | "player2" | "watcher";
  personColor?: string;
  aiColor?: string;
  ballColor?: string;
  level?: number;
}) {
  const socket = useContext(SocketContext);
  const [state, setState] = useState<{
    player1: Player;
    player2: Player;
    ball: Ball;
    ctx: CanvasRenderingContext2D;
  }>();

  const move = throttle((y: number) => {
    if (game) socket?.emit("game:move", { game: game.id, y });
  }, 1000 / FPS);

  const moveRacket = (player: "player1" | "player2", y: number) => {
    if (!state) return;
    state[player].y = y - state[player].height / 2;
    if (state[player].y < 0) state[player].y = 2;
    else if (state[player].y > state.ctx.canvas.height - state[player].height)
      state[player].y = state.ctx.canvas.height - state[player].height - 2;
  };

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!state || role === "watcher") return;
      let y =
        ((event.clientY - state.ctx.canvas.offsetTop) /
          state.ctx.canvas.offsetHeight) *
        100;
      y = (y * state.ctx.canvas.height) / 100;
      move(y);
      moveRacket(role, y);
    },
    [state]
  );

  function Update(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    ball: Ball,
    player1: Player,
    player2: Player
  ) {
    if (ball.stop === false) {
      ball.x += ball.velocityX;
      ball.y += ball.velocityY;
    }
    // Enable disable AI
    player2.y = lerp(player2.y, ball.y - player2.height / 2, player2.ai);
    if (player2.y < 0) player2.y = 2;
    else if (player2.y > canvas.height - player2.height)
      player2.y = canvas.height - player2.height - 2;
    // player1.y = ball.y - (player1.height / 2);
    if (ball.x >= player2.x || ball.x <= player1.x + player1.width) {
      if (ball.x <= player1.x + player1.width) player2.score++;
      else {
        player1.score++;
        player2.ai *= player2.aiStep;
        if (player2.ai > 20) player2.ai = 20;
      }
      if (game)
        socket?.emit("game:score", {
          game: game.id,
          player1: player1.score,
          player2: player2.score,
        });
      const temp: Ball = createBall(canvas, ball.color, ball.reverseColor);
      ball.x = temp.x;
      ball.y = temp.y;
      ball.speedX = temp.speedX;
      ball.speedY = temp.speedY;
      ball.velocityX = temp.velocityX;
      ball.velocityY = temp.velocityY;
      ball.stop = true;
      setTimeout(() => {
        ball.stop = false;
      }, 1500);
    } else if (
      collision(ball, player1, true) ||
      collision(ball, player2, false)
    ) {
      ball.velocityX *= -(1 + ball.speedX / 100);
      ball.velocityY *= 1 + ball.speedY / 100;
    }
    if (ball.y >= canvas.height || ball.y <= 0) ball.velocityY *= -1;
    if (ball.velocityX >= ball.maxX) ball.velocityX = Math.random() * ball.maxX;
    else if (ball.velocityX <= -ball.maxX)
      ball.velocityX = -1 * Math.random() * ball.maxX;
    if (ball.velocityY >= ball.maxY) ball.velocityY = ball.maxY;
    else if (ball.velocityY <= -ball.maxY) ball.velocityY = -ball.maxY;
    if (game)
      socket?.emit("game:ball", { game: game.id, x: ball.x, y: ball.y });
  }

  const onVisibilityChange = useCallback(() => {
    if (game && document.hidden && (role === "player1" || role === "player2"))
      socket?.emit("game:leave", game.id);
  }, [game]);

  useEffect(() => {
    if (!state || !socket) return;
    state.ctx.canvas.addEventListener("mousemove", onMouseMove);
    socket.on(
      "game:move",
      (data: { y: number; player: "player1" | "player2" }) => {
        moveRacket(data.player, data.y);
      }
    );
    socket.on("game:ball", (data: { x: number; y: number }) => {
      state.ball.x = data.x;
      state.ball.y = data.y;
    });
    socket.on("game:score", (data: { player1: number; player2: number }) => {
      state.player1.score = data.player1;
      state.player2.score = data.player2;
    });
    const image = new Image();
    image.src =
      game?.background ||
      backgrounds[Math.floor(Math.random() * backgrounds.length)];
    const render = setInterval(
      () =>
        Prepare(
          state?.ctx.canvas,
          state.ctx,
          state.ball,
          state.player1,
          state.player2,
          image
        ),
      1000 / FPS
    );
    let update: ReturnType<typeof setInterval>;
    if (role === "player1")
      update = setInterval(
        () =>
          Update(
            state?.ctx.canvas,
            state.ctx,
            state.ball,
            state.player1,
            state.player2
          ),
        6
      );
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      state.ctx.canvas.removeEventListener("mousemove", onMouseMove);
      socket.off("game:move");
      socket.off("game:ball");
      socket.off("game:score");
      clearInterval(render);
      if (update) clearInterval(update);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [state]);

  const ref = useCallback((canvas: HTMLCanvasElement) => {
    if (!canvas) return;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const ball: Ball = createBall(canvas, ballColor, getReverse(ballColor));
    setTimeout(() => {
      ball.stop = false;
    }, 1500);
    const player1: Player = {
      width: canvas.width - (99 * canvas.width) / 100,
      height: canvas.height - (80 * canvas.height) / 100,
      x: 2,
      y: canvas.height - (60 * canvas.height) / 100,
      color: personColor,
      reverseColor: getReverse(personColor),
      score: game?.player1_score || 0,
      ai: 0,
      aiStep: 0,
    };
    const player2: Player = {
      width: canvas.width - (99 * canvas.width) / 100,
      height: canvas.height - (80 * canvas.height) / 100,
      x: canvas.width - (1 * canvas.width) / 100 - 2,
      y: canvas.height - (60 * canvas.height) / 100,
      color: aiColor,
      reverseColor: getReverse(aiColor),
      score: game?.player2_score || 0,
      ai: game ? 0 : level, //ai level from 1 to 20
      aiStep: 1.5,
    };
    setState({ ctx, ball, player1, player2 });
  }, []);

  return (
    <div className="shadow-2xl mx-auto">
      <canvas
        ref={ref}
        className="w-full h-full border-2 border-white border-solid"
        width="1920"
        height="1080"
      ></canvas>
    </div>
  );
}
