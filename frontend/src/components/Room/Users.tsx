import {
  useMantineTheme,
  Drawer,
  Box,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Text,
} from "@mantine/core";
import {
  IconCrownOff,
  IconCrown,
  IconVolume,
  IconVolumeOff,
  IconUserOff,
  IconCheck,
  IconBan,
  IconListDetails,
} from "@tabler/icons-react";
import { addMinutes } from "date-fns";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils";
import { UserAvatar } from "../UserAvatar";

export default function RoomUsers({
  room,
  currentUser,
}: {
  room: Room;
  currentUser: Room["RoomUser"][0];
}) {
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();

  const kick = (id: string) => {
    toast.promise(
      api.delete(`rooms/${room.id}/users/${id}`, { json: { user_id: id } }),
      {
        loading: "Kicking user...",
        success: "User kicked",
        error: "Failed to kick user",
      }
    );
  };

  const mute = (id: string, minutes: number = 0) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          mute: minutes ? addMinutes(new Date(), minutes).toISOString() : null,
        },
      }),
      {
        loading: "Muting user...",
        success: minutes ? "User muted" : "User unmuted",
        error: "Failed to mute user",
      }
    );
  };

  const toggleAdmin = (id: string, admin: boolean) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          admin: !admin,
        },
      }),
      {
        loading: "Updating user...",
        success: "User updated",
        error: "Failed to update user",
      }
    );
  };

  const toggleBan = (id: string, banned: boolean) => {
    toast.promise(
      api.patch(`rooms/${room.id}/users/${id}`, {
        json: {
          ban: !banned,
        },
      }),
      {
        loading: "Updating user...",
        success: "User updated",
        error: "Failed to update user",
      }
    );
  };

  return (
    <>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        overlayBlur={3}
        title="Room members"
        padding="xl"
        size="xl"
        position="right"
        zIndex={400}
      >
        {room.RoomUser.map(({ user, mute: m, admin, owner, ban }) => (
          <Box
            key={user.id}
            sx={{
              display: "block",
              width: "100%",
              padding: theme.spacing.xs,
              borderRadius: theme.radius.sm,
              color:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[0]
                  : theme.black,

              "&:hover": {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
              },
            }}
          >
            <Group>
              <UserAvatar user={user} />
              <Box sx={{ flex: 1 }}>
                <Text size="sm" weight={500}>
                  {user.name}{" "}
                  {ban ? (
                    <Badge color="red">Banned</Badge>
                  ) : owner ? (
                    <Badge color="teal">Owner</Badge>
                  ) : admin ? (
                    <Badge color="yellow">Admin</Badge>
                  ) : null}
                </Text>
              </Box>
              {currentUser.admin &&
                currentUser.user.id != user.id &&
                !owner && (
                  <div className="flex gap-2">
                    {currentUser.owner && (
                      <ActionIcon
                        variant="light"
                        onClick={() => toggleAdmin(user.id, admin)}
                      >
                        {admin ? (
                          <IconCrownOff size={18} />
                        ) : (
                          <IconCrown size={18} />
                        )}
                      </ActionIcon>
                    )}
                    {m ? (
                      <ActionIcon
                        onClick={() => mute(user.id, 0)}
                        variant="light"
                      >
                        <IconVolume size={18} />
                      </ActionIcon>
                    ) : (
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light">
                            <IconVolumeOff size={18} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item onClick={() => mute(user.id, 15)}>
                            15 Minutes
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 30)}>
                            30 Minutes
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60)}>
                            1 Hour
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60 * 24)}>
                            1 Day
                          </Menu.Item>
                          <Menu.Item onClick={() => mute(user.id, 60 * 24 * 7)}>
                            1 Week
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    )}
                    <ActionIcon onClick={() => kick(user.id)} variant="light">
                      <IconUserOff size={18} />
                    </ActionIcon>
                    <ActionIcon
                      onClick={() => toggleBan(user.id, ban)}
                      variant="light"
                      color={ban ? "green" : "red"}
                    >
                      {ban ? <IconCheck size={18} /> : <IconBan size={18} />}
                    </ActionIcon>
                  </div>
                )}
            </Group>
          </Box>
        ))}
      </Drawer>

      <ActionIcon onClick={() => setOpened(true)} variant="light">
        <IconListDetails size={18} />
      </ActionIcon>
    </>
  );
}
