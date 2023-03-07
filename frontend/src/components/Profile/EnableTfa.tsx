import { CopyButton, Input } from "@mantine/core";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import PinField from "react-pin-field";
import { api } from "../../utils";
import { Loading } from "../Loading";

function EnableTfa({ reload }: { reload: () => void }) {
  const [qr, setQr] = useState<string>();
  const [secret, setSecret] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("auth/qrcode")
      .json<any>()
      .then((data) => {
        setQr(data.qr);
        setSecret(data.secret);
        setLoading(false);
      });
  }, []);

  const validate = (code: string) => {
    toast.promise(
      api
        .post("auth/2fa/turn-on", {
          json: {
            twoFactorAuthenticationCode: code,
            secret,
          },
        })
        .then(() => {
          reload();
        }),
      {
        loading: "Enabling...",
        success: <b>Enabled successfully!</b>,
        error: <b>Enabling failed</b>,
      }
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="flex flex-col items-center text-center">
      <div>
        To enable 2FA, you will have to install an authenticator app on your
        phone. You can use Google Authenticator, Authy, or any other app that is
        compatible with the TOTP standard.
      </div>
      <div className="pt-2">
        Scan the QR code below with your authenticator app:
      </div>
      <img src={qr} />
      <div className="py-2">Or enter the secret manually:</div>
      <CopyButton value={secret as string}>
        {({ copied, copy }) => (
          <Input onClick={copy} component="button">
            {copied ? "Copied!" : secret}
          </Input>
        )}
      </CopyButton>
      <div className="pt-4 pb-2">
        Enter the code from your authenticator app:
      </div>
      <div>
        <PinField
          className="pin-field"
          validate="0123456789"
          inputMode="numeric"
          length={6}
          onComplete={validate}
        />
      </div>
    </div>
  );
}

export default EnableTfa;
