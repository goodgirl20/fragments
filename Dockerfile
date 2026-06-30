FROM node:22.17.1-alpine

LABEL maintainer="Grace Elezabeth Thomas <grace.sally.thomas9656@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY ./src ./src

EXPOSE 8080

USER node

CMD ["npm", "start"]
