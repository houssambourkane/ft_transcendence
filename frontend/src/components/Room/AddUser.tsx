import {
  Group,
  Avatar,
  Modal,
  Select,
  Button,
  ActionIcon,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconLoader, IconUserPlus } from "@tabler/icons-react";
import { forwardRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "../../utils";

interface UserItem {
  value: string;
  label: string;
  avatar: string;
}

interface ItemProps extends React.ComponentPropsWithoutRef<"div">, UserItem {}

const SelectUser = forwardRef<HTMLDivElement, ItemProps>(
  ({ avatar, label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <Avatar src={avatar} />
        <Text size="sm">{label}</Text>
      </Group>
    </div>
  )
);

export default function AddUser({ room }: { room: Room }) {
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      user_id: null,
    },
    validate: {
      user_id: (value) => (!value ? "Please select a user" : null),
    },
  });
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      api
        .post(`rooms/${room.id}/users/${values.user_id}`, {
          json: values,
        })
        .then(() => {
          setOpened(false);
        })
        .catch(async (e) => {
          form.setErrors({ user_id: (await e.response.json()).message });
          throw e;
        }),
      {
        loading: "Adding...",
        success: <b>Added successfully!</b>,
        error: <b>Adding failed</b>,
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    api
      .get("user", {
        searchParams: {
          search,
        },
      })
      .json<User[]>()
      .then((data) => {
        setUsers(
          data.map((v) => ({ avatar: v.avatar, value: v.id, label: v.name }))
        );
      })
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add member to room"
        centered
        overlayBlur={3}
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <Select
            label="Select a user"
            placeholder="Pick one"
            searchable
            onSearchChange={setSearch}
            searchValue={search}
            itemComponent={SelectUser}
            nothingFound="No users found"
            data={users}
            rightSection={
              loading ? (
                <IconLoader className="animate-spin" size={14} />
              ) : undefined
            }
            {...form.getInputProps("user_id")}
          />
          <Group mt="md">
            <Button type="submit">Add member</Button>
          </Group>
        </form>
      </Modal>

      <ActionIcon onClick={() => setOpened(true)} variant="light">
        <IconUserPlus size={18} />
      </ActionIcon>
    </>
  );
}
