import { Avatar, MantineNumberSize, Menu } from "@mantine/core";
import { openContextModal } from "@mantine/modals";
import {
  IconUserCircle,
  IconFriendsOff,
  IconFriends,
  IconMessagePlus,
  IconDeviceGamepad2,
  IconHandOff,
  IconHandStop,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUsers } from "../stores";
import { api } from "../utils";

export function UserAvatar({
  user,
  size,
}: {
  user: Room["RoomUser"][0]["user"];
  size?: MantineNumberSize;
}) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [friends, blocklist] = useUsers((state) => [
    state.friends,
    state.blocklist,
  ]);

  const dm = () => {
    toast.promise(
      api
        .post(`rooms/dm/${user.id}`)
        .json<{ id: string }>()
        .then(({ id }) => {
          navigate(`/chat/${id}`);
        }),
      {
        loading: "Retrieving direct messages...",
        success: "Direct messages retrieved",
        error: "Failed to retrieve direct messages",
      }
    );
  };

  const addFriend = () => {
    toast.promise(
      api.post(`friends/${user.id}`).catch(async (e) => {
        throw (await e.response.json()).message;
      }),
      {
        loading: "Adding friend...",
        success: "Friend request sent",
        error: (e) => e,
      }
    );
  };

  const removeFriend = () => {
    toast.promise(api.delete(`friends/${user.id}`), {
      loading: "Removing friend",
      success: "Friend removed",
      error: "Failed to remove friend",
    });
  };

  const block = () => {
    toast.promise(api.post(`blocklist/${user.id}`), {
      loading: "Blocking user...",
      success: "User blocked",
      error: "Failed to block user",
    });
  };

  const unblock = () => {
    toast.promise(api.delete(`blocklist/${user.id}`), {
      loading: "Unblocking user...",
      success: "User unblocked",
      error: "Failed to unblock user",
    });
  };

  const invite = () => {
    openContextModal({
      modal: "NewGame",
      title: "Invite " + user.name + " to a game",
      centered: true,
      transitionDuration: 200,
      overlayBlur: 3,
      innerProps: {
        opponentId: user.id,
      },
    });
  };

  return (
    <Menu shadow="md" withArrow>
      <Menu.Target>
        <Avatar
          sx={{
            cursor: "pointer",
          }}
          src={user.avatar}
          radius={10000}
          size={size || "sm"}
        />
      </Menu.Target>

      <Menu.Dropdown>
        <Link to={`/user/${user.id}`}>
          <Menu.Item icon={<IconUserCircle size={14} />}>Profile</Menu.Item>
        </Link>
        {user.id !== auth.id && (
          <>
            {friends.find((f) => f.id === user.id) ? (
              <Menu.Item
                onClick={removeFriend}
                icon={<IconFriendsOff size={14} />}
              >
                Remove friend
              </Menu.Item>
            ) : (
              <Menu.Item onClick={addFriend} icon={<IconFriends size={14} />}>
                Add friend
              </Menu.Item>
            )}
            <Menu.Item onClick={dm} icon={<IconMessagePlus size={14} />}>
              Private message
            </Menu.Item>
            <Menu.Item onClick={invite} icon={<IconDeviceGamepad2 size={14} />}>
              Invite to game
            </Menu.Item>
            {blocklist.includes(user.id) ? (
              <Menu.Item onClick={unblock} icon={<IconHandOff size={14} />}>
                Unblock user
              </Menu.Item>
            ) : (
              <Menu.Item onClick={block} icon={<IconHandStop size={14} />}>
                Block user
              </Menu.Item>
            )}
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
