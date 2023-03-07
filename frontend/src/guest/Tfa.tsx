import { Paper, Text } from "@mantine/core";
import toast from "react-hot-toast";
import PinField from "react-pin-field";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../stores";
import { api } from "../utils";

function Tfa() {
  const auth = useAuth();
  const navigate = useNavigate();

  if (!auth.token) return <Navigate to="/login" />;
  if (!auth.tfa_required) return <Navigate to="/" />;

  const validate = (code: string) => {
    toast.promise(
      api
        .post("auth/2fa/authenticate", {
          json: {
            twoFactorAuthenticationCode: code,
          },
        })
        .json<any>()
        .then((data) => {
          auth.login(data.access_token);
          navigate("/");
        }),
      {
        loading: "Verifying...",
        success: <b>Verified successfully!</b>,
        error: <b>Verification failed</b>,
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-sm mx-auto">
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Text size="lg" weight={500}>
            2FA Authentication
          </Text>
          <Text size="sm" weight={500} color="dimmed" mt={5} mb="md">
            Please enter the 6-digit code from your authenticator app
          </Text>
          <PinField
            className="pin-field"
            validate="0123456789"
            inputMode="numeric"
            length={6}
            onComplete={validate}
          />
        </Paper>
      </div>
    </div>
  );
}

export default Tfa;
