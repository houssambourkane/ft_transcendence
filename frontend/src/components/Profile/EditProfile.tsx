import { FileInput, TextInput, Group, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconUpload } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { api } from "../../utils";

function EditProfile({ user }: { user: any }) {
  const form = useForm({
    initialValues: {
      avatar: undefined,
      name: user.name,
    },
    validate: {
      name: (value) =>
        !value || value.length < 3
          ? "Name must be at least 3 characters"
          : null,
    },
  });

  const onSubmit = (values: typeof form.values) => {
    toast.promise(
      (values.avatar
        ? api
            .post("user/upload", {
              body: (() => {
                const f = new FormData();
                f.append("image", values.avatar);
                return f;
              })(),
            })
            .json<{ url: string }>()
            .then((d) => ({
              ...values,
              avatar: d.url,
            }))
        : Promise.resolve(values)
      ).then((values) =>
        api
          .patch("user/profile", {
            json: values,
          })
          .then(() => {
            window.location.reload();
          })
      ),
      {
        loading: "Saving...",
        success: <b>Saved successfully!</b>,
        error: <b>Saving failed</b>,
      }
    );
  };

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <FileInput
        label="Your avatar"
        placeholder="Select an image"
        accept="image/png,image/jpeg"
        icon={<IconUpload size={14} />}
        {...form.getInputProps("avatar")}
      />
      <TextInput
        mt="md"
        withAsterisk
        label="Display name"
        placeholder="Enter a name"
        {...form.getInputProps("name")}
      />
      <Group position="right" mt="md">
        <Button type="submit">Save</Button>
      </Group>
    </form>
  );
}

export default EditProfile;
