# Dockerfile for the Fragments microservice

# Use Node.js version 22.17.1
FROM node:22.17.1

# Image metadata
LABEL maintainer="Grace Elezabeth Thomas <grace.sally.thomas9656@gmail.com>"
LABEL description="Fragments node.js microservice"

# Environment variables
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Use /app as working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY ./src ./src

# Start the server
CMD npm start

# Document exposed port
EXPOSE 8080