import { List, ThemeIcon } from "@mantine/core";
import { IconPingPong, IconTrophy, IconTrophyOff } from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Game from "../components/Game";
import { Loading } from "../components/Loading";
import { UserAvatar } from "../components/UserAvatar";
import { api, SocketContext } from "../utils";

export default function User() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<
    User & {
      games: Game[];
      wins: number;
      losses: number;
      achivement: string;
    }
  >();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const loadUser = useCallback(() => {
    setLoading(true);
    api
      .get(`user/${id}`)
      .json<typeof user>()
      .then((res) => setUser(res))
      .catch(() => {
        toast.error("Failed to load user");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    setUser(undefined);
    loadUser();
    socket.on("games:updated", loadUser);
    return () => {
      socket.off("games:updated");
    };
  }, [id]);

  if ((loading && !user) || !user)
    return <Loading className="w-full h-screen" />;

  return (
    <>
      <div className="bg-no-repeat bg-center bg-cover shadow-2xl rounded-xl p-4 flex items-center gap-4 bg-white mb-4">
        <div className="flex flex- items-center gap-4 flex-grow">
          <UserAvatar user={user} size="xl" />
          <div className="font-bold text-lg">{user.name}</div>
        </div>
        <List className="font-medium">
          <List.Item
            icon={
              <ThemeIcon color="blue" size={24} radius="xl">
                <IconPingPong size={16} />
              </ThemeIcon>
            }
          >
            Games: {user.games.length}
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="green" size={24} radius="xl">
                <IconTrophy size={16} />
              </ThemeIcon>
            }
          >
            Wins: {user.wins}
          </List.Item>
          <List.Item
            icon={
              <ThemeIcon color="red" size={24} radius="xl">
                <IconTrophyOff size={16} />
              </ThemeIcon>
            }
          >
            Losses: {user.losses}
          </List.Item>
        </List>
        <div>
          <img width={100} src={user.achivement} alt="achivement" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {user.games.map((game) => (
          <Game game={game} />
        ))}
      </div>
    </>
  );
}
