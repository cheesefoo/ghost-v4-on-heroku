#!/usr/bin/env node
// Ghost Configuration for Heroku

var fs = require("fs");
var path = require("path");
var url = require("url");

var envValues = require("./common/env-values");
var appRoot = path.join(__dirname, "..");

function createConfig() {
  var fileStorage, storage;

  if (!!process.env.S3_ACCESS_KEY_ID) {
    fileStorage = true;
    storage = {
      active: "s3",
      s3: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
        bucket: process.env.S3_BUCKET_NAME,
        region: process.env.S3_BUCKET_REGION,
        assetHost: process.env.S3_ASSET_HOST_URL,
      },
    };
  } else if (!!process.env.CLOUDINARY_URL) {
    fileStorage = true;
    storage = {
      active: "cloudinary",
      cloudinary: {
        useDatedFolder: false,
        upload: {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
          folder: "ghost-blog-images",
          tags: ["blog"],
        },
        fetch: {
          quality: "auto",
          secure: true,
          cdn_subdomain: true,
        },
      },
    };
  } else {
    fileStorage = false;
    storage = {};
  }

  config = {
    url: process.env.APP_PUBLIC_URL,
    logging: {
      level: "info",
      transports: ["stdout"],
    },
    mail: {
      transport: "SMTP",
      options: {
        service: "Mailgun",
        auth: {
          user: process.env.MAILGUN_SMTP_LOGIN,
          pass: process.env.MAILGUN_SMTP_PASSWORD,
        },
      },
    },
    fileStorage: fileStorage,
    storage: storage,
    database: {
      client: "mysql",
      connection: getMysqlConfig(envValues.mysqlDatabaseUrl),
      pool: { min: 0, max: 5 },
      debug: false,

    },
    server: {
      host: "0.0.0.0",
      port: process.env.PORT,
    },
    paths: {
      contentPath: path.join(appRoot, "/content/"),
    },
  };

  return config;
}

function getMysqlConfig(connectionUrl) {
  if (connectionUrl == null) {
    return {};
  }

  var dbConfig = url.parse(connectionUrl);
  if (dbConfig == null) {
    return {};
  }

  var dbAuth = dbConfig.auth ? dbConfig.auth.split(":") : [];
  var dbUser = dbAuth[0];
  var dbPassword = dbAuth[1];
  var dbName = "ghost";
  if (dbConfig.pathname == null) {
    dbName = "ghost";
  } else {
    dbName = dbConfig.pathname.split("/")[1];
  }

  var dbConnection = {
    host: dbConfig.hostname,
    port: dbConfig.port || "3306",
    user: dbUser,
    password: dbPassword,
    database: dbName,
    // ssl:{
    //   ca: fs.readFileSync(path.join(appRoot,'global-bundle.pem'), "utf-8")
    // }
    // ssl: "Amazon RDS"
  };
  return dbConnection;
}

var configContents = JSON.stringify(createConfig(), null, 2);
fs.writeFileSync(path.join(appRoot, "config.production.json"), configContents);
