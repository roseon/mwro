# mwro
# Myth War Online Website + Server Setup
Credit for Starting the Project (Wander) (https://gitlab.com/wander-gr/mw-tools)
Second Support (St3rkr) (https://gitlab.com/Luigi311/mw-tools)
This repository contains the game server (`mw-tools`) and the website (`website`). The website uses the same database as the server, so both setups should point to the same DB.

## Prerequisites

### Website
- PHP 8.2+
- Web server (Apache/Nginx/IIS)
- MySQL 5.7+ (or MariaDB)
- PHP extensions: PDO, JSON
- PHP extensions PD For images (optional, for item icons, NPC)

### Game Server
- Node.js 16+
- npm
- MySQL 5.7+ (or Couchbase if configured)

## Repository Layout

- `website/`: PHP website and admin panel.
- `mw-tools/`: Node/TypeScript game server, tools, and database initialization.
- `mw-tools/src/game-server/Database/MySQL/InitDB.ts`: MySQL schema initializer.

## Database Setup (MySQL)

1. Install MySQL and create a user with permissions to create databases.
2. Configure the server DB connection:
   - Copy `mw-tools/src/game-server/Config/server.config.default.json` to `mw-tools/server.config.json`.
   - Update MySQL settings:
     ```json
     {
       "databaseType": "mysql",
       "mysql": {
         "host": "localhost",
         "port": 3306,
         "user": "root",
         "password": "yourpassword",
         "database": "MythWarServer"
       }
     }
     ```
3. Install dependencies and generate config:
   ```bash
   cd mw-tools
   npm install
   npm run config
   ```
4. Initialize the database tables:
   ```bash
   npx ts-node src/game-server/Database/MySQL/InitDB.ts
   ```

> The initializer creates `MythWarServer` and collections/tables like `User`, `Player`, `BaseItem`, `BasePet`, `BaseQuest`, `Npc`, and `GameData`.

## Game Server Setup

1. Build the server:
   ```bash
   cd mw-tools
   npm run build
   ```
2. Populate default data:
   ```bash
   npm run update
   ```
3. Create `door.dat` for your client:
   ```bash
   node build/door-dat/main
   ```
4. Start the server:
   ```bash
   npm run start-server
   ```

## Client Setup (Local)

1. Place a Myth War client under `mw-tools/client`.
2. Run `node build/door-dat/main` to generate `door.dat`.
3. Start the game via `mw-tools/client/main.exe`.

## Website Setup

1. Configure DB connection in `website/includes/db.php`:
   - Host, username, password, database `MythWarServer`.
2. Point your web server document root to the `website` folder.
3. Make sure the MySQL database is initialized by running the game server `InitDB.ts`.

## Admin Panel

- `website/admin.php` provides an admin UI for users, items, pets, quests, and NPC data.
- User deletion removes associated `Player` records based on the character list in the user JSON.

## Common Issues

- **Cannot login**: verify `website/includes/db.php` and MySQL credentials.
- **Empty data lists**: run `npm run update` to populate base data.
- **Missing tables**: re-run `npx ts-node src/game-server/Database/MySQL/InitDB.ts`.

## Notes

- The website and server must share the same MySQL database.
- If you use Couchbase instead of MySQL, follow `mw-tools/DatabaseReadme.md` instead of the MySQL steps above.
