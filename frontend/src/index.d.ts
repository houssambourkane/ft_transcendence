interface Message {
  id: number;
  content: string;
  created_at: string;
  room_id: string;
  from_id: string;
  user: {
    avatar: string;
    name: string;
    id: string;
  };
}

interface User {
  avatar: string;
  name: string;
  id: string;
}

interface Room {
  RoomUser: [
    {
      user: User;
      owner: boolean;
      admin: boolean;
      ban: boolean;
      mute: string | null;
    }
  ];
  id: string;
  name: string;
  password: string | null;
  id_user_owner: string;
  type: "public" | "private" | "protected" | "dm";
}

interface Game {
  id: string;
  background: string;
  player1: User;
  player2: User;
  player1_score: number;
  player2_score: number;
  state: "live" | "finished";
}
