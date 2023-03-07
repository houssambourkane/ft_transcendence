import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { api, useQuery } from "../utils";
import { Paper, Text, Button } from "@mantine/core";
import { Loading } from "../components/Loading";
import { useAuth } from "../stores";

const FTIcon = () => (
  <svg
    height="1em"
    version="1.1"
    id="Calque_1"
    xmlns="http://www.w3.org/2000/svg"
    x="0px"
    y="0px"
    viewBox="0 -200 960 960"
    enableBackground="new 0 -200 960 960"
    fill="currentColor"
  >
    <polygon
      id="polygon5"
      points="32,412.6 362.1,412.6 362.1,578 526.8,578 526.8,279.1 197.3,279.1 526.8,-51.1 362.1,-51.1 
32,279.1 "
    />
    <polygon id="polygon7" points="597.9,114.2 762.7,-51.1 597.9,-51.1 " />
    <polygon
      id="polygon9"
      points="762.7,114.2 597.9,279.1 597.9,443.9 762.7,443.9 762.7,279.1 928,114.2 928,-51.1 762.7,-51.1 "
    />
    <polygon id="polygon11" points="928,279.1 762.7,443.9 928,443.9 " />
  </svg>
);

function Login() {
  const params = useQuery();
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("code")) {
      setLoading(true);
      const code = params.get("code");
      toast.promise(
        api
          .get(`auth?code=${code}`)
          .json<any>()
          .then((data) => {
            auth.login(data.access_token);
            navigate("/tfa");
          })
          .catch((e) => {
            setLoading(false);
            throw e;
          }),
        {
          loading: "Logging in...",
          success: <b>Logged in successfully!</b>,
          error: <b>Login failed</b>,
        }
      );
    }
  }, []);

  if (auth.token) return <Navigate to="/" />;

  if (loading) return <Loading className="h-screen" />;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text size="lg" weight={500}>
            Welcome to Trandandan
          </Text>
          <Text size="sm" weight={500} color="dimmed" mt={5}>
            login with your 42 account to continue
          </Text>{" "}
          <a href={`${import.meta.env.VITE_BACKEND_URL}/auth/redirect`}>
            <Button
              color="dark"
              leftIcon={<FTIcon />}
              fullWidth
              mt="xl"
              size="md"
            >
              Sign in with 42
            </Button>
          </a>
        </Paper>
      </div>
    </div>
  );
}

export default Login;
