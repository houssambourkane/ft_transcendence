import { format } from "date-fns";
import { useUsers } from "../../stores";
import { UserAvatar } from "../UserAvatar";

export default function Message({ message }: { message: Message }) {
  const [blocklist] = useUsers((state) => [state.blocklist]);

  if (blocklist.includes(message.user.id)) return null;

  return (
    <div
      key={message.id}
      className="p-3 flex gap-3 hover:bg-slate-50 transition-colors"
    >
      <UserAvatar user={message.user} size="md" />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold">{message.user.name}</span>{" "}
          <small>{format(new Date(message.created_at), "Pp")}</small>
        </div>
        <div>{message.content}</div>
      </div>
    </div>
  );
}
