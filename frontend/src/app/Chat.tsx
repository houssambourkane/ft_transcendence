import { Avatar, Card, LoadingOverlay, ScrollArea } from "@mantine/core";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, Outlet } from "react-router-dom";
import NewRoom from "../components/Chat/New";
import { types } from "../shared";
import { api, SocketContext } from "../utils";

function Chat() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const socket = useContext(SocketContext);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("rooms")
      .json<Room[]>()
      .then((res) => {
        setRooms(res);
      })
      .catch((err) => {
        toast.error("Failed to load rooms");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
    socket?.on("room:updated", load);
    return () => {
      socket?.off("room:updated", load);
    };
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="m-0">Chat</h1>
        <NewRoom />
      </div>
      <Card
        className="flex-grow flex flex-col"
        withBorder
        shadow="sm"
        radius="md"
        p={0}
      >
        <div className="flex flex-grow max-h-[calc(100vh-100px)]">
          <div
            className="min-w-[300px]"
            style={{
              borderRight: "1px solid #dee2e6",
            }}
          >
            <ScrollArea h="100%">
              <LoadingOverlay visible={loading} overlayBlur={2} />
              {rooms.map((room) => (
                <Link to={`/chat/${room.id}`} key={room.id}>
                  <div
                    className="p-3 border-b"
                    style={{
                      borderBottom: "1px solid #dee2e6",
                    }}
                  >
                    <div className="font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <span>{room.name}</span>
                      {types[room.type].icon}
                    </div>
                    <Avatar.Group spacing="xs">
                      {room.RoomUser.slice(0, 5).map((user) => (
                        <Avatar
                          key={user.user.avatar}
                          src={user.user.avatar}
                          size="sm"
                          radius="xl"
                        />
                      ))}
                      {room.RoomUser.length > 5 && (
                        <Avatar radius="xl" size="sm">
                          +{room.RoomUser.length - 5}
                        </Avatar>
                      )}
                    </Avatar.Group>
                  </div>
                </Link>
              ))}
            </ScrollArea>
          </div>
          <Outlet />
        </div>
      </Card>
    </>
  );
}

export default Chat;
