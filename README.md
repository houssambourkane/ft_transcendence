### FT_TRANSCENDENCE

This is a RESTful Web chat application that includes a pong game developed with the following stack:
- Typescript
- ReactJs
- NestJs
- Postgresql with prisma database ORM
- Docker for containerazing the application features
- Websockets API

> The application is designed to authenticate users using 42 authentication, we included JWT for the identification of each user and for generating tokens that will remember each user settings.
Users can add each other as friends, chat with them as well as inviting them to a multiplayer pong game.
There are set of roles on each room : owner, administrator and other users each one of those roles has its specific privileges and permissions over the room.
A user can set his profile and update it with a new name and picture.
The games are live and can be watched.


If you want to try the application you must have a 42 valid account and install the following tools:
- npm package manager
- docker engine


