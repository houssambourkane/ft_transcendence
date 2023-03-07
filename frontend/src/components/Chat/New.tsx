import {
  Modal,
  TextInput,
  PasswordInput,
  SegmentedControl,
  Center,
  Box,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEyeOff, IconEyeCheck, IconMessagePlus } from "@tabler/icons-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { types } from "../../shared";
import { api } from "../../utils";

export default function NewRoom() {
  const [opened, setOpened] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      type: "public",
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
        .post("rooms", {
          json: values,
        })
        .then(() => {
          form.reset();
          setOpened(false);
        }),
      {
        loading: "Creating...",
        success: <b>Created successfully!</b>,
        error: <b>Creating failed</b>,
      }
    );
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Create new room"
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
            <Button type="submit">Create room</Button>
          </Group>
        </form>
      </Modal>
      <Button
        leftIcon={<IconMessagePlus size={14} />}
        onClick={() => setOpened(true)}
      >
        New room
      </Button>
    </>
  );
}
