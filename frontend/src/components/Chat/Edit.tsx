import {
  Modal,
  TextInput,
  PasswordInput,
  SegmentedControl,
  Center,
  Box,
  Group,
  Button,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEyeOff, IconEyeCheck, IconSettings } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { types } from "../../shared";
import { api } from "../../utils";

export default function EditRoom({ room }: { room: Room }) {
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      name: room.name,
      type: room.type,
      password: "",
    },
    validate: {
      name: (value) => (!value ? "Room name is required" : null),
      password: (value, v) =>
        v.type == "protected" && (!value || value.length < 8)
          ? "Password must be at least 8 characters"
          : null,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      api
        .put(`rooms/${room.id}`, {
          json: values,
        })
        .then(() => {
          setOpened(false);
        }),
      {
        loading: "Updating...",
        success: <b>Updated successfully!</b>,
        error: <b>Updating failed</b>,
      }
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Update room"
        centered
        overlayBlur={3}
      >
        <form onSubmit={form.onSubmit(onSubmit)}>
          <TextInput
            withAsterisk
            label="Room name"
            placeholder="Enter a name"
            {...form.getInputProps("name")}
          />
          {form.values["type"] === "protected" && (
            <PasswordInput
              {...form.getInputProps("password")}
              mt="md"
              withAsterisk
              label="Room password"
              placeholder="Protect your room with a password"
              visibilityToggleIcon={({ reveal, size }) =>
                reveal ? (
                  <IconEyeOff size={size} />
                ) : (
                  <IconEyeCheck size={size} />
                )
              }
            />
          )}
          <SegmentedControl
            mt="md"
            {...form.getInputProps("type")}
            data={Object.entries(types)
              .filter((v) => v[1].label)
              .map(([value, { label, icon }]) => ({
                value,
                label: (
                  <Center>
                    {icon}
                    <Box ml={10}>{label}</Box>
                  </Center>
                ),
              }))}
          />
          <Group mt="md">
            <Button type="submit">Update room</Button>
          </Group>
        </form>
      </Modal>

      <ActionIcon onClick={() => setOpened(true)} variant="light">
        <IconSettings size={18} />
      </ActionIcon>
    </>
  );
}
