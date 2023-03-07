import React, { createContext } from "react";
import { useLocation } from "react-router-dom";
import ky from "ky";
import { Socket } from "socket.io-client";
import { useAuth } from "./stores";

export function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const api = ky.extend({
  prefixUrl: import.meta.env.VITE_BACKEND_URL,
  hooks: {
    beforeRequest: [
      (options) => {
        const token = useAuth.getState().token;

        if (token) {
          options.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          useAuth.getState().logout();
          return response;
        }
      },
    ],
  },
});

export const SocketContext = createContext<Socket | undefined>(undefined);
