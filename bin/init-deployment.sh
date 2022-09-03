#!/usr/bin/env bash

echo "Initializing the deployment…"
echo "pwd →"
pwd
echo "config.production.json →"
cat "config.production.json"

node ./bin/wait-for-db.js

knex-migrator init --mgpath node_modules/ghost
knex-migrator migrate --v 4.47 --force