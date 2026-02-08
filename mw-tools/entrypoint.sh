#!/bin/bash

help() {
    echo "Usage: ./entrypoint.sh"
    echo "COMMAND:"
    echo "  --help, -h              Print this help message"
    echo "  --build-door            Build door.dat file"
    echo "  --run-server            Build and run the server"
}


if [ "$1" == "--help" ] || [ "$COMMAND" == "-h" ]; then
    help
elif [ "$1" == "--build-door" ]; then
    npm run build && \
    node build/door-dat/main
elif [ "$1" == "--run-server" ]; then
    npm run build && \
    npm run update && \
    npm run start-server
else
    exec "$@"
fi