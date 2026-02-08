# Setup
First download and install [couchbase server](https://www.couchbase.com/downloads).

Next, create a file called `server.config.json` in the root folder of this repository.
This file is based on [server.config.default.json](src/game-server/Config/server.config.default.json). You could copy that and change the values, or only put the keys you want to override.

Example:
```json
{
	"$schema": "./src/game-server/Config/server.config.schema.json",
	"databaseType": "couchbase",
	"couchbase": {
		"password": "your_password"
	}
}
```

After changing the config you need to call `npm run config`.
Once that's done, run `npm run update`.
