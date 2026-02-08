# MySQL Database Support

This module adds support for using MySQL as a database backend for the game server.

## Configuration

Update your `config.json` (or `server.config.json`) to use `mysql` type and provide the connection details:

```json
{
    "databaseType": "mysql",
    "mysql": {
        "host": "localhost",
        "port": 3306,
        "user": "root",
        "password": "yourpassword",
        "database": "MythWarServer"
    },
    ...
}
```

The database name in the config isn't strictly used for connection (it uses `CREATE DATABASE IF NOT EXISTS`), but `InitDB.ts` uses `MythWarServer` by default.

## Initialization

Before running the server, you need to initialize the database tables.
Run the initialization script using `ts-node`:

```bash
npx ts-node src/game-server/Database/MySQL/InitDB.ts
```

This will connect to MySQL, create the `MythWarServer` database (if it doesn't exist), and create the required tables (User, Player, etc.) with JSON columns.

## Dependencies

Make sure `mysql2` is installed:

```bash
npm install mysql2
```
