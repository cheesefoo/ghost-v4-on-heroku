#!/usr/bin/env bash

echo "Initializing the deployment…"
echo "pwd →"
pwd
wget "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem" -P /opt/render/project/src/
echo "config.production.json →"
cat "config.production.json"
node ./bin/wait-for-db.js

knex-migrator init --mgpath node_modules/ghost