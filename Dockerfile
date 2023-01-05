FROM node:16.13.1-alpine3.14
WORKDIR /usr/src/app
COPY ./build .
RUN npm install --omit=dev
EXPOSE 8029
CMD node index.js
