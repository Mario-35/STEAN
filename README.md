![Logo](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/logo.png "Logo")

## SensorThings Enhanced API Node

![Inrae](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/inrae.png "Inrae")

# Installation

1. Fork/Clone : <https://github.com/Mario-35/STEAN.git>
    or unzip  : <https://github.com/Mario-35/STEAN/archive/refs/heads/main.zip>
2. Install dependencies : npm install
3. Fire up Postgres on the default ports
4. Make configuration/[development or production].json file (see [config.json.example](https://github.com/Mario-35/STEAN/blob/main/src/server/configuration/config.json.example))
5. npm run dev for dev, npm run build (vs script package.json)
6. If database not exists the program create it.

[Release infos](https://github.com/Mario-35/STEAN/blob/main/realease.md)

## Want to use this with docker

![Docker](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/logo-docker.png "Docker")

docker-compose up --build -d

```yaml
version: '3.8'
services:
    db:
        container_name: postgis
        image: postgis/postgis
        ports:
            - "5433:5432"
#        volumes:
#            - data:/data/db
        restart: always
        environment:
            POSTGRES_USER: sensorthings
            POSTGRES_DB: postgres
            POSTGRES_PASSWORD: sensorthings
            ALLOW_IP_RANGE: 0.0.0.0/0
    stean:
        container_name: stean
        image: mario35/api-stean:latest
        depends_on:
            - db
        ports:
            - "8029:8029"
#volumes:
#     data: {}
```

## Want to use this project?

1. Fork/Clone
2. Install dependencies - npm install
3. Fire up Postgres on the default ports
4. Make configuration/config.json file (see [example](https://github.com/Mario-35/STEAN/blob/main/src/configuration/example.md))
5. npm run dev for dev, npm run build (vs script package.json)
6. If database not exists the program create it.

The project run under nodeJS.

![Nodejs](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/nodejs.png "Nodejs")

Is 100% typescript, the javascript is used for TDD only and apidoc.

![TypeScript](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/ts.png "TypeScript") ![Javascript](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/js.png "Javascript")

For views a little :

![HTML JS CSS](https://raw.githubusercontent.com/Mario-35/STEAN/main/doc/assets/html.png "HTML JS CSS")

## Directory Structure

```js
📦src
 ┣ 📂server // API Server
 ┃ ┣ 📂authentication // authentication and tokens
 ┃ ┣ 📂configuration // Configuration Server
 ┃ ┃ ┣ 📜.key // crypt Key
 ┃ ┃ ┗ 📜 production.json // configuration file
 ┃ ┣ 📂db
 ┃ ┃ ┣ 📂createDb // datas to create blank Database
 ┃ ┃ ┣ 📂dataAccess
 ┃ ┃ ┣ 📂entities // SensorThings entities
 ┃ ┃ ┣ 📂helpers 
 ┃ ┃ ┣ 📂monitoring 
 ┃ ┃ ┣ 📂queries
 ┃ ┃ ┗ 📜constants.ts // Constants for DB
 ┃ ┣ 📂enums // Enums datas
 ┃ ┣ 📂helpers // Application helpers
 ┃ ┣ 📂logger // Logs tools
 ┃ ┣ 📂lora // loras functions
 ┃ ┣ 📂messages //all messages of the api
 ┃ ┣ 📂odata // Odata decoder
 ┃ ┃ ┣ 📂parser // Odata parser
 ┃ ┃ ┗ 📂visitor //  Odata decoder process
 ┃ ┃   ┗📂helpers
 ┃ ┣ 📂public // public HTTP pages
 ┃ ┣ 📂routes // routes API
 ┃ ┃ ┣ 📜favicon.ico // Icon
 ┃ ┃ ┣ 📜protected.ts // protected routes
 ┃ ┃ ┗ 📜unProtected.ts // open routes
 ┃ ┣ 📂types // data types
 ┃ ┣ 📂views // generated view
 ┃ ┃ ┣ 📂css // CsS filse
 ┃ ┃ ┣ 📂helpers
 ┃ ┃ ┣ 📂js // JS filse
 ┃ ┃ ┗ 📂query // Query view
 ┃ ┣ 📜constants.ts // App constants
 ┃ ┗ 📜index.ts // starting file
 ┣ 📂template // ApiDoc template
 ┣ 📂test
 ┃ ┣ 📂integration // Tests
 ┃ ┃ ┗ 📂files // files For importation tests
 ┃ ┣ 📜apidoc.json // Apidoc configuration
 ┃ ┗ 📜dbTest.ts // DB test connection
 ┗ 📜build.js // js file for building app
```

## Tech Stack

- [Node.js](https://nodejs.org/) `v18.15.0`
- [PostgreSQL](https://www.postgresql.org/)
- [Postgres.js](https://github.com/porsager/postgres)
- [pg](https://node-postgres.com/)
- [pg-copy-streams](https://github.com/brianc/node-pg-copy-streams#readme)
- [json2csv](https://mircozeiss.com/json2csv/)
- [busboy](https://github.com/mscdex/busboy)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- [exceljs](https://github.com/exceljs/exceljs)

---

- [koa](https://koajs.com/)
- [koa-bodyparser](https://github.com/koajs/bodyparser)
- [koa-bodyparser](https://github.com/koajs/cors)
- [koa-compress](https://github.com/koajs/compress)
- [koa-html-minifier](https://github.com/koajs/html-minifier)
- [koa-json](https://github.com/koajs/json)
- [koa-helmet](https://github.com/venables/koa-helmet)
- [koa-logger](https://github.com/koajs/logger)
- [koa-router](https://github.com/koajs/router)
- [koa-session](https://github.com/koajs/session)
- [koa-passport](https://github.com/rkusa/koa-passport)
- [koa-static](https://github.com/koajs/static)
- [koa-favicon](https://github.com/koajs/favicon)
- [@koa/cors](https://github.com/koajs/cors)
- [passport-local](https://github.com/jaredhanson/passport-local)
