import { ActionIcon, Button, PasswordInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import {
  IconDoorExit,
  IconEyeCheck,
  IconEyeOff,
  IconUserPlus,
} from "@tabler/icons-react";
import { useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import EditRoom from "../components/Chat/Edit";
import { Loading } from "../components/Loading";
import AddUser from "../components/Room/AddUser";
import Messages from "../components/Room/Messages";
import RoomUsers from "../components/Room/Users";
import { useAuth } from "../stores";
import { api, SocketContext } from "../utils";

export function Welcome() {
  return (
    <div className="w-full flex flex-col text-center justify-center items-center">
      <h2 className="mt-0">Welcome to chat</h2>
      <div className="text-gray-500">Select a room to start chatting</div>
    </div>
  );
}

function Room() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room>();
  const [passwordRequired, setPasswordRequired] = useState(false);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { id: user_id } = useAuth();
  const form = useForm({
    initialValues: {
      password: "",
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      api
        .post(`rooms/${id}/users`, {
          json: values,
        })
        .then(() => loadRoom())
        .catch(async (e) => {
          throw (await e.response.json()).message;
        }),
      {
        loading: "Joining...",
        success: <b>Joined successfully!</b>,
        error: (e) => <b>{e}</b>,
      }
    );
  };

  const loadRoom = useCallback(() => {
    setLoading(true);
    api
      .get(`rooms/${id}`)
      .json<Room>()
      .then((res) => {
        setRoom(res);
      })
      .catch(async (err) => {
        if (err.response.status === 403) {
          setRoom(undefined);
          setPasswordRequired((await err.response.json()).password);
        } else {
          toast.error("Failed to load room");
          navigate("/chat");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const leave = () => {
    toast.promise(
      api
        .delete(`rooms/${id}/users`)
        .then(() => {
          navigate("/chat");
        })
        .catch(async (e) => {
          throw (await e.response.json()).message;
        }),
      {
        loading: "Leaving...",
        success: <b>Left successfully!</b>,
        error: (e) => <b>{e}</b>,
      }
    );
  };

  useEffect(() => {
    setRoom(undefined);
    loadRoom();
    socket?.on("room:updated", loadRoom);
    return () => {
      socket?.off("room:updated", loadRoom);
    };
  }, [id]);

  if (loading && !room) return <Loading className="w-full !h-auto" />;

  if (!room)
    return (
      <div className="w-full flex flex-col text-center justify-center items-center">
        <div>
          <h2 className="mt-0">You are not a member</h2>
          <div className="text-gray-500">
            Join to start chatting in this room
          </div>
          <form onSubmit={form.onSubmit(onSubmit)}>
            {passwordRequired && (
              <PasswordInput
                {...form.getInputProps("password")}
                mt="md"
                placeholder="Enter the room password"
                visibilityToggleIcon={({ reveal, size }) =>
                  reveal ? (
                    <IconEyeOff size={size} />
                  ) : (
                    <IconEyeCheck size={size} />
                  )
                }
              />
            )}
            <Button type="submit" mt="md" leftIcon={<IconUserPlus size={14} />}>
              Join room
            </Button>
          </form>
        </div>
      </div>
    );

  const currentUser = room.RoomUser.find((u) => u.user.id === user_id)!;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full p-3 flex justify-between">
        <span className="font-bold text-lg">{room.name}</span>
        <div className="flex gap-3">
          {currentUser?.owner && <EditRoom room={room} />}
          {currentUser?.admin && <AddUser room={room} />}
          <RoomUsers room={room} currentUser={currentUser} />
          {room.type !== "dm" && (
            <ActionIcon onClick={leave} variant="light" color="red">
              <IconDoorExit size={18} />
            </ActionIcon>
          )}
        </div>
      </div>
      <Messages id={room.id} currentUser={currentUser} />
    </div>
  );
}

export default Room;
