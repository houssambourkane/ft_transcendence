import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Loading } from "../components/Loading";
import Table from "../components/Table/Table";
import { UserAvatar } from "../components/UserAvatar";
import { useAuth } from "../stores";
import { api, SocketContext } from "../utils";

function Game() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [game, setGame] = useState<Game>();
  const [role, setRole] = useState<"player1" | "player2" | "watcher" | null>(
    null
  );
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const navigate = useNavigate();

  const loadGame = useCallback(() => {
    setLoading(true);
    api
      .get(`games/${id}`)
      .json<Game>()
      .then((res) => setGame(res))
      .catch(() => {
        toast.error("Failed to load game");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setGame(undefined);
    setRole(null);
    loadGame();
    socket?.on("game:finished", loadGame);
    return () => {
      socket?.off("game:finished");
    };
  }, [id]);

  useEffect(() => {
    if (!socket || !game || game.state === "finished") return;
    socket.emitWithAck("game:join", game.id).then((role) => setRole(role));
    return () => {
      setRole(null);
      socket.emit("game:leave", game.id);
    };
  }, [game]);

  if (loading || !game || (game.state === "live" && !role))
    return <Loading className="w-full h-screen" />;

  const loss =
    (game.player1_score < game.player2_score
      ? game.player1.id
      : game.player2.id) == auth.id;

  return (
    <>
      <div className="flex items-center gap-10 mb-4">
        <div className="flex flex-col items-end flex-grow">
          <UserAvatar user={game.player1} size="lg" />
          <div className="flex-grow truncate font-medium text-lg mt-2">
            {game.player1.name}
          </div>
        </div>
        <div className="font-bold text-xl">VS</div>
        <div className="flex flex-col flex-grow">
          <UserAvatar user={game.player2} size="lg" />
          <div className="flex-grow truncate font-medium text-lg mt-2">
            {game.player2.name}
          </div>
        </div>
      </div>
      {!role ? (
        <div
          className="aspect-[1.75] bg-no-repeat bg-center bg-cover shadow-2xl rounded-xl p-3 flex flex-col items-center justify-center text-4xl font-bold text-white w-full text-center"
          style={{
            backgroundImage: `url(${
              loss ? "/backgrounds/loss.gif" : game.background
            })`,
          }}
        >
          <h3>Game finished</h3>
          <h1 className="my-0">
            {game.player1_score} - {game.player2_score}
          </h1>
          <h3>
            {game.player1_score > game.player2_score
              ? game.player1.name
              : game.player2.name}{" "}
            won
          </h3>
        </div>
      ) : (
        <Table game={game} role={role} />
      )}
      <div className="flex justify-between items-center mb-4"></div>
    </>
  );
}

export default Game;
