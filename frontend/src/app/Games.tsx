import { Button } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import { IconPingPong } from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Game from "../components/Game";
import { Loading } from "../components/Loading";
import { api, SocketContext } from "../utils";

function Games() {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const [games, setGames] = useState<Game[]>([]);

  const createGame = () =>
    openContextModal({
      modal: "NewGame",
      title: "Start a New Game",
      centered: true,
      transitionDuration: 200,
      overlayBlur: 3,
      innerProps: {},
    });

  const join = async () => {
    if (!socket) return;
    setLoading(true);
    try {
      await socket
        .timeout(10000)
        .emitWithAck("game:queue")
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        });
    } catch {
      createGame();
    }
    setLoading(false);
  };

  const loadGames = useCallback(() => {
    setLoading(true);
    api
      .get("games")
      .json<Game[]>()
      .then((res) => setGames(res))
      .catch(() => toast.error("Failed to load games"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    loadGames();
    socket.on("games:updated", loadGames);
    return () => {
      socket.off("games:updated");
    };
  }, [socket]);

  if (loading && !games.length) return <Loading className="w-full h-screen" />;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0">Live Games</h1>
        <div className="flex gap-2">
          <Button
            loading={loading}
            leftIcon={<IconPingPong size={14} />}
            onClick={join}
          >
            New Game
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link to="/game/ai">
          <div
            className="bg-no-repeat bg-center bg-cover shadow-2xl rounded-xl flex items-end gap-4 bg-white mb-4 aspect-[1.5]"
            style={{
              backgroundImage: "url('/ai.png')",
            }}
          >
            <div
              className="text-white font-bold px-8 pt-4 pb-5 bg-white/25 w-full rounded-b-xl"
              style={{
                backdropFilter: "blur(3px)",
              }}
            >
              <div className="text-xl">Play with AI</div>
              <div className="text-sm text-slate-300">
                Play against a computer
              </div>
            </div>
          </div>
        </Link>
        <div
          className="bg-no-repeat bg-center bg-cover shadow-2xl rounded-xl flex items-end gap-4 bg-white mb-4 aspect-[1.5] cursor-pointer"
          style={{
            backgroundImage: "url('/multiplayer.png')",
          }}
          onClick={join}
        >
          <div
            className="text-white font-bold px-8 pt-4 pb-5 bg-white/25 w-full rounded-b-xl"
            style={{
              backdropFilter: "blur(3px)",
            }}
          >
            <div className="text-xl">Play with Friends</div>
            <div className="text-sm text-slate-300">
              Create or join a multiplayer game
            </div>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {games.map((game) => (
          <Game game={game} />
        ))}
      </div>
    </>
  );
}

export default Games;
