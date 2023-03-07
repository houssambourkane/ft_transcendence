import jwtDecode from "jwt-decode";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "./utils";

interface AuthState {
  user: User | null;
  id: string | null;
  token: string | null;
  tfa_required: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      id: null,
      token: null,
      tfa_required: false,
      login: (token: string) => {
        const payload = jwtDecode(token) as any;
        set({ token, tfa_required: payload.tfa_required, id: payload.id });
      },
      logout: () => {
        set({ token: null, tfa_required: false, id: null, user: null });
      },
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useUsers = create<{
  friends: User[];
  pending: User[];
  online: string[];
  blocklist: string[];
  fetchFriends: () => Promise<void>;
  fetchBlocklist: () => Promise<void>;
  setFriends: (friends: User[]) => void;
  setOnline: (online: string[]) => void;
  setBlocklist: (blocklist: string[]) => void;
}>((set) => ({
  friends: [],
  pending: [],
  online: [],
  blocklist: [],
  fetchFriends: async () => {
    const response = await api.get("friends");
    const { friends, pending } = await response.json<{
      friends: User[];
      pending: User[];
    }>();
    set({ friends, pending });
  },
  fetchBlocklist: async () => {
    const response = await api.get("blocklist");
    const blocklist = await response.json<string[]>();
    set({ blocklist });
  },
  setFriends: (friends: User[]) =>
    set({
      friends,
    }),
  setOnline: (online: string[]) =>
    set({
      online,
    }),
  setBlocklist: (blocklist: string[]) =>
    set({
      blocklist,
    }),
}));

export type Queue = {
  [client: string]: {
    opponentId?: string;
    requester: {
      name: string;
      avatar: string;
    };
  };
};

export const useQueue = create<{
  queue: Queue;
  setQueue: (queue: Queue) => void;
}>((set) => ({
  queue: {},
  setQueue: (queue: Queue) => set({ queue }),
}));
