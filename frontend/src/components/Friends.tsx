import { Divider, Box, ActionIcon, Badge } from "@mantine/core";
import {
  IconHourglass,
  IconCheck,
  IconX,
  IconHeartHandshake,
} from "@tabler/icons-react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUsers } from "../stores";
import { api } from "../utils";
import { UserAvatar } from "./UserAvatar";

const Friends = () => {
  const [friends, pending, online] = useUsers((state) => [
    state.friends,
    state.pending,
    state.online,
  ]);

  useEffect(() => {}, []);

  const remove = (id: string) => {
    toast.promise(api.delete(`friends/${id}`), {
      loading: "Removing friend",
      success: "Friend removed",
      error: "Failed to remove friend",
    });
  };

  const accept = (id: string) => {
    toast.promise(api.post(`friends/accept/${id}`), {
      loading: "Accepting friend request",
      success: "Friend request accepted",
      error: "Failed to accept friend request",
    });
  };

  return (
    <>
      <Divider
        my="xs"
        variant="dotted"
        labelPosition="center"
        label={
          <>
            <IconHourglass size={12} />
            <Box ml={5}>Pending requests</Box>
          </>
        }
      />
      {pending.length ? (
        pending.map((user) => (
          <div
            className="hover:bg-[#f8f9fa] p-2.5 rounded-[4px] select-none"
            key={user.id}
          >
            <div className="flex gap-4 items-center">
              <UserAvatar user={user} />
              <div className="flex-grow truncate font-medium text-sm">
                {user.name}
              </div>
              <div className="flex gap-2">
                <ActionIcon
                  onClick={() => accept(user.id)}
                  variant="light"
                  color="green"
                >
                  <IconCheck size={18} />
                </ActionIcon>
                <ActionIcon
                  onClick={() => remove(user.id)}
                  variant="light"
                  color="red"
                >
                  <IconX size={18} />
                </ActionIcon>
              </div>
            </div>
          </div>
        ))
      ) : (
        <small className="text-center my-6">No pending requests</small>
      )}
      <Divider
        my="xs"
        variant="dotted"
        labelPosition="center"
        label={
          <>
            <IconHeartHandshake size={12} />
            <Box ml={5}>Your friends</Box>
          </>
        }
      />
      {friends.length ? (
        friends.map((user) => (
          <div
            className="hover:bg-[#f8f9fa] p-2.5 rounded-[4px] select-none"
            key={user.id}
          >
            <div className="flex gap-4 items-center">
              <UserAvatar user={user} />
              <div className="flex-grow truncate font-medium text-sm">
                {user.name}
              </div>
              <div className="flex gap-2">
                {online.includes(user.id) ? (
                  <Badge color="teal" variant="dot">
                    Online
                  </Badge>
                ) : (
                  <Badge color="gray" variant="dot">
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <small className="text-center my-6">No friends yet :(</small>
      )}
    </>
  );
};

export default Friends;
