import { ScrollArea, TextInput, ActionIcon, Loader } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconSend } from "@tabler/icons-react";
import { format } from "date-fns";
import { useState, useContext, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { SocketContext, api } from "../../utils";
import { Loading } from "../Loading";
import Message from "./Message";

export default function Messages({
  id,
  currentUser,
}: {
  id: string;
  currentUser: Room["RoomUser"][0];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const form = useForm({
    initialValues: {
      message: "",
    },
  });
  const socket = useContext(SocketContext);
  const viewport = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const onNewMessage = useCallback((payload: Message) => {
    setMessages((messages) => [...messages, payload]);
  }, []);

  useEffect(() => {
    socket?.emit("room:join", id);
    socket?.on("room:message:new", onNewMessage);
    setLoading(true);
    api
      .get(`messages/${id}`)
      .json<Message[]>()
      .then((res) => {
        setMessages(res);
      })
      .catch((err) => {
        toast.error("Failed to load messages");
      })
      .finally(() => {
        setLoading(false);
      });
    return () => {
      socket?.off("room:message:new", onNewMessage);
      socket?.emit("room:leave", id);
    };
  }, [id]);

  const onSubmit = (values: typeof form.values) => {
    if (!values.message) return;
    setSending(true);
    socket?.emit(
      "room:message:send",
      {
        content: values.message,
        room_id: id,
      },
      () => {
        setSending(false);
        form.reset();
      }
    );
  };

  const onRefChange = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.scrollTo({
        top: node.scrollHeight,
      });
    }
    viewport.current = node;
  }, []);

  if (loading) return <Loading className="flex-grow" />;

  const mutedUntil = currentUser.mute
    ? new Date(currentUser.mute) > new Date()
      ? new Date(currentUser.mute)
      : null
    : null;

  return (
    <>
      <ScrollArea
        viewportRef={onRefChange}
        style={{
          borderBottom: "1px solid #dee2e6",
          borderTop: "1px solid #dee2e6",
        }}
        className="flex-grow"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </ScrollArea>
      {mutedUntil ? (
        <div className="p-3">
          You have been muted by an admin. You can't send messages until{" "}
          {format(new Date(mutedUntil), "Pp")}
        </div>
      ) : (
        <div className="p-3">
          <form onSubmit={form.onSubmit(onSubmit)}>
            <TextInput
              {...form.getInputProps("message")}
              placeholder="Type your message..."
              rightSection={
                !sending ? (
                  <ActionIcon type="submit">
                    <IconSend size={18} />
                  </ActionIcon>
                ) : (
                  <Loader size="xs" />
                )
              }
            />
          </form>
        </div>
      )}
    </>
  );
}
