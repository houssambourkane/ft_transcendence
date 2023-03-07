import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Ai from "./app/Ai";
import Chat from "./app/Chat";
import Game from "./app/Game";
import Games from "./app/Games";
import Profile from "./app/Profile";
import Room, { Welcome } from "./app/Room";
import User from "./app/User";
import Error from "./Error";
import Login from "./guest/Login";
import Tfa from "./guest/Tfa";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: <Games />,
      },
      {
        path: "/game/ai",
        element: <Ai />,
      },
      {
        path: "/game/:id",
        element: <Game />,
      },
      {
        path: "/user/:id",
        element: <User />,
      },
      {
        path: "/chat",
        element: <Chat />,
        children: [
          {
            index: true,
            element: <Welcome />,
          },
          {
            path: ":id",
            element: <Room />,
          },
        ],
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/tfa",
    element: <Tfa />,
  },
]);
