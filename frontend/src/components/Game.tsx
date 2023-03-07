import { Avatar } from "@mantine/core";
import { Link } from "react-router-dom";

export default function Game({ game }: { game: Game }) {
  return (
    <Link to={`/game/${game.id}`}>
      <div
        className="aspect-[1.75] bg-no-repeat bg-center bg-cover shadow-2xl rounded-xl p-3 flex flex-col"
        style={{
          backgroundImage: `url(${game.background})`,
        }}
      >
        <span
          className="bg-white/30 text-white text-sm flex items-center gap-1.5 self-center py-0.5 px-3 rounded-full"
          style={{
            backdropFilter: "blur(10px)",
          }}
        >
          {game.state === "live" ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live
            </>
          ) : (
            "Finished"
          )}
        </span>
        <div className="flex justify-between items-center mt-auto">
          <Avatar src={game.player1.avatar} radius="xl" size="lg" />
          <div className="text-white text-3xl font-bold">
            {game.player1_score}:{game.player2_score}
          </div>
          <Avatar src={game.player2.avatar} radius="xl" size="lg" />
        </div>
      </div>
    </Link>
  );
}
