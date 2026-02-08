# About MythWar
MythWar Online was an online game developed by Unigium. MythWar I was released in 2005 and shut down in 2009. MythWar II was released in 2008 and shut down in 2015. This repository is focussed on the first game.

__Note:__ When you search online for MythWar, you may run into TDT. They present themselves as official, but are not. See [this reddit thread](https://www.reddit.com/r/MythWar/comments/bq3wtc/myth_war_ii_online_known_servers_info/).

# About this repository
I am trying to create a MythWar I server from scratch, purely as a hobby. I do not have access to any original source code. All original materials, trademarks and copyrights belong to Unigium (as far as I'm aware), and I will not be publishing these here. All code in this repository is original work (unless specified otherwise).

I may also publish some other tools, to deal with MW file formats, as well as guides and various other data.

Code is written in TypeScript 4 and targets Node 16. If you use a lower version of Node, you may have to modify `tsconfig.json`.

# Client
During development I use MW1 version 1.0.48.35.

The `update.exe` file tries to connect to an old server to retrieve updates and the server list. The serverlist is stored in the `door.dat` file. I've added a script so you can create this file yourself for a local server. After adding that to the client directory, you can start the game through `main.exe`.

# Server
The server is very limited at the moment. No data is stored, no multiplayer and most features don't work yet.

See the [issue list](https://gitlab.com/wander-gr/mw-tools/-/issues) for a list of things that need to be done.

## Getting started
Assuming node and npm are installed, and you have cloned or downloaded this repository.

- Install dependencies with `npm install`
- Put a copy of the client in `/client`
- Build with `npm run build`
- (Optional) Follow the steps to setup a couchbase database in the [database readme](DatabaseReadme.md)
  - You may skip this for testing or development, but it may result in decreased performance or data-loss
- Fill the storage with default data with `npm run update`
- Create the door.dat file by running `node build/door-dat/main`
- Start server with `npm run start-server`
- Open the game through `/client/main.exe`

## Docker
- Create server.config.json with your settings and ip address
- Put a copy of the client in `/client`
- Run docker image host networking

```bash
docker run -it --network host -v "$(pwd)/client:/app/client" -v "$(pwd)/server.config.json:/app/server.config.json"  registry.gitlab.com/wander-gr/mw-tools:latest
```

# Contributing
If you wish to contribute there are a few ways:
- Implement features / fix bugs
  - Fork this repository and create a merge request
- Report bugs
- Send us old videos (or mw .rec files) to help replicating original features
- Contribute to the [wiki](https://myth-war-online.fandom.com/)
- Participate on [discord](https://discord.com/channels/777863932765143080)
