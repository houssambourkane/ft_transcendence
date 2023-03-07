import { Card, Group, Text, Button, SimpleGrid } from "@mantine/core";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loading } from "../components/Loading";
import EditProfile from "../components/Profile/EditProfile";
import EnableTfa from "../components/Profile/EnableTfa";
import { api } from "../utils";

function Profile() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>();

  const load = () => {
    setLoading(true);
    api
      .get("user/profile")
      .json<any>()
      .then((data) => {
        setUser(data);
        setLoading(false);
      });
  };

  const disable2FA = () => {
    toast.promise(
      api.delete("auth/2fa/turn-off").then(() => {
        load();
      }),
      {
        loading: "Disabling...",
        success: <b>Disabled successfully!</b>,
        error: <b>Disabling failed</b>,
      }
    );
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading className="h-screen" />;

  return (
    <div>
      <h1 className="mt-0">Profile</h1>
      <SimpleGrid
        cols={2}
        spacing="lg"
        breakpoints={[{ maxWidth: 980, cols: 1, spacing: "md" }]}
      >
        <Card withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Text weight={500}>Two Factor Authentication</Text>
            </Group>
          </Card.Section>
          <Card.Section py="md" inheritPadding>
            {user.tfa ? (
              <div>
                <div className="mb-2">
                  Two factor auth is enabled. You can disable it below.
                </div>
                <Button color="red" onClick={disable2FA}>
                  Disable 2FA
                </Button>
              </div>
            ) : (
              <EnableTfa reload={load} />
            )}
          </Card.Section>
        </Card>
        <Card withBorder shadow="sm" radius="md">
          <Card.Section withBorder inheritPadding py="xs">
            <Group position="apart">
              <Text weight={500}>User Details</Text>
            </Group>
          </Card.Section>
          <Card.Section py="md" inheritPadding>
            <EditProfile user={user} />
          </Card.Section>
        </Card>
      </SimpleGrid>
    </div>
  );
}

export default Profile;
