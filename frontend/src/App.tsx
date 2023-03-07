import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import logo from "./assets/logo.png";
import { api, SocketContext } from "./utils";
import { useContext, useEffect, useState } from "react";
import {
  AppShell,
  Aside,
  Avatar,
  Box,
  Center,
  createStyles,
  Group,
  Navbar,
  Stack,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
  Text,
  Modal,
  Loader,
  Button,
  Dialog,
  Indicator,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconHome2,
  IconLogout,
  IconMessages,
  IconRobot,
  IconSettings,
  IconUserCircle,
} from "@tabler/icons-react";
import { io, Socket } from "socket.io-client";
import { Loading } from "./components/Loading";
import { toast } from "react-hot-toast";
import { useUsers, useAuth, useQueue, Queue } from "./stores";
import { ModalsProvider } from "@mantine/modals";
import { NewGame } from "./components/Games/New";
import Friends from "./components/Friends";
import EditProfile from "./components/Profile/EditProfile";

const routes = [
  { icon: IconHome2, label: "Home", to: "/" },
  { icon: IconRobot, label: "Play with AI", to: "/game/ai" },
  { icon: IconMessages, label: "Chat", to: "/chat" },
];

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface NavbarLinkProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?(): void;
  to?: string;
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
  to,
}: NavbarLinkProps) {
  const { classes, cx } = useStyles();

  return (
    <Tooltip label={label} position="right" transitionDuration={100}>
      {to ? (
        <Link to={to}>
          <UnstyledButton
            onClick={onClick}
            className={cx(classes.link, { [classes.active]: active }, "mt-1")}
          >
            <Icon stroke={1.5} />
          </UnstyledButton>
        </Link>
      ) : (
        <UnstyledButton
          onClick={onClick}
          className={cx(classes.link, { [classes.active]: active }, "mt-1")}
        >
          <Icon stroke={1.5} />
        </UnstyledButton>
      )}
    </Tooltip>
  );
}

function Layout({ user }: { user: any }) {
  const theme = useMantineTheme();
  const { pathname } = useLocation();
  const { logout, id } = useAuth();
  const socket = useContext(SocketContext);
  const [fetchFriends, fetchBlocklist] = useUsers((state) => [
    state.fetchFriends,
    state.fetchBlocklist,
  ]);
  const queue = useQueue((state) => state.queue);
  const navigate = useNavigate();

  const currentRoute = "/" + (pathname + "/").split("/")[1];

  useEffect(() => {
    fetchFriends();
    fetchBlocklist();
    if (!socket) return;
    const old = socket
      .on("users:friends", () => fetchFriends())
      .on("users:blocklist", () => fetchBlocklist())
      .on("game:matched", (id) => {
        navigate(`/game/${id}`);
      });
    return () => {
      old.off("users:friends").off("users:blocklist");
    };
  }, [socket]);

  const cancel = () => {
    if (!socket) return;
    socket.emit("game:cancel");
  };

  const accept = async () => {
    if (!socket) return;
    await toast.promise(
      socket
        ?.timeout(10000)
        .emitWithAck("game:accept")
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        }),
      {
        loading: "Accepting invite...",
        success: "Accepted invite successfully!",
        error: "Accepting failed",
      }
    );
  };

  const decline = async () => {
    if (!socket) return;
    await toast.promise(
      socket
        ?.timeout(10000)
        .emitWithAck("game:decline")
        .then((data) => {
          if (!data.done) throw new Error("Could not find a game");
          return data;
        }),
      {
        loading: "Declining invite...",
        success: "Declined invite successfully!",
        error: "Declining failed",
      }
    );
  };

  const matchmaking = Object.keys(queue).includes(socket?.id || "");
  const invite = Object.values(queue).find((q) => q.opponentId === id);

  return (
    <AppShell
      styles={{
        main: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar width={{ base: 80 }} p="md">
          <Center>
            <img src={logo} className="h-8" alt="Logo" />
          </Center>
          <Navbar.Section grow mt={12}>
            <Stack justify="center" spacing={0}>
              {routes.map((link) => (
                <NavbarLink
                  {...link}
                  key={link.label}
                  active={link.to === currentRoute}
                  to={link.to}
                />
              ))}
            </Stack>
          </Navbar.Section>
          <Navbar.Section>
            <Stack justify="center" spacing={0}>
              <NavbarLink
                active={pathname === "/user/" + id}
                to={"/user/" + id}
                icon={IconUserCircle}
                label="Profile"
              />
              <NavbarLink
                active={currentRoute === "/profile"}
                to="/profile"
                icon={IconSettings}
                label="Edit Profile"
              />
              <NavbarLink onClick={logout} icon={IconLogout} label="Logout" />
            </Stack>
          </Navbar.Section>
        </Navbar>
      }
      aside={
        <div className="hidden lg:block">
          <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
            {user && (
              <Link to={`/user/${user.id}`}>
                <UnstyledButton
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
                    <Avatar src={user.avatar} radius="xl" size="sm" />
                    <Box sx={{ flex: 1 }}>
                      <Text size="sm" weight={500}>
                        {user.name}
                      </Text>
                    </Box>

                    {theme.dir === "ltr" ? (
                      <IconChevronRight size={18} />
                    ) : (
                      <IconChevronLeft size={18} />
                    )}
                  </Group>
                </UnstyledButton>
              </Link>
            )}

            <Friends />
          </Aside>
        </div>
      }
    >
      <div className="container mx-auto min-h-full flex flex-col">
        <Outlet />
      </div>
      <Modal
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={false}
        opened={matchmaking}
        overlayBlur={3}
        onClose={() => {}}
      >
        <div className="flex flex-col items-center justify-center text-center py-5">
          <Loader mt="sm" variant="bars" />
          <h3>Matchmaking in progress</h3>
          <p className="m-0">
            We are searching for another player. You will be redirected to the
            game once a match is found.
          </p>
          <Button mt="lg" color="red" variant="light" onClick={cancel}>
            Cancel search
          </Button>
        </div>
      </Modal>
      {invite && (
        <Dialog opened={true} size="lg" radius="md">
          <Group noWrap align="center" mb="xs" spacing="sm">
            <Indicator offset={3} processing size={6} color="teal">
              <Avatar size="sm" src={invite.requester.avatar} radius="xl" />
            </Indicator>
            <Text size="sm" weight={500}>
              {invite.requester.name} is inviting you to join a game
            </Text>
          </Group>

          <Group align="flex-end" spacing="xs" position="apart">
            <Button onClick={accept} color="teal" size="xs">
              Accept invite
            </Button>
            <Button onClick={decline} color="red" size="xs">
              Decline invite
            </Button>
          </Group>
        </Dialog>
      )}
    </AppShell>
  );
}

export default function App() {
  const { token, tfa_required } = useAuth();
  const [socket, setSocket] = useState<Socket>();
  const [user, setUser] = useState<any>();
  const setOnline = useUsers((state) => state.setOnline);
  const setQueue = useQueue((state) => state.setQueue);

  useEffect(() => {
    if (!token || tfa_required) return;
    api
      .get("user/profile")
      .json<any>()
      .then((data) => {
        setUser(data);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    const s = io(import.meta.env.VITE_BACKEND_URL, {
      auth: { token },
    });
    s.on("connect", () => {
      toast.success("Connected to server");
    })
      .on("disconnect", () => {
        toast.error("Disconnected from server, please refresh the page");
      })
      .on("users:online", (data: string[]) => setOnline(data))
      .on("game:queue", (data: Queue) => setQueue(data));
    setSocket(s);
    return () => {
      s.disconnect();
      s.removeAllListeners();
    };
  }, [user]);

  if (!token) return <Navigate to="/login" />;
  if (tfa_required) return <Navigate to="/tfa" />;
  if (!user || !socket) return <Loading className="h-screen" />;

  return (
    <SocketContext.Provider value={socket}>
      <ModalsProvider modals={{ NewGame }}>
        <Layout user={user} />
        <Modal
          opened={user.created_at === user.updated_at}
          centered
          overlayBlur={3}
          withCloseButton={false}
          closeOnClickOutside={false}
          closeOnEscape={false}
          onClose={() => {}}
          title="Choose a nickname"
        >
          <EditProfile user={user} />
        </Modal>
      </ModalsProvider>
    </SocketContext.Provider>
  );
}
