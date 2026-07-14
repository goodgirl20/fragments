########################################################################
# Stage 1: Install dependencies
########################################################################
FROM node:22.17.1-alpine AS dependencies

LABEL maintainer="Grace Elezabeth Thomas <grace.sally.thomas9656@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

WORKDIR /app

# Copy only the package files first so this layer is cached
# unless package.json / package-lock.json actually change
COPY package*.json ./

# Install only production dependencies, using the lockfile exactly as-is
RUN npm ci --omit=dev

########################################################################
# Stage 2: Build the final, minimal production image
########################################################################
FROM node:22.17.1-alpine AS production

LABEL maintainer="Grace Elezabeth Thomas <grace.sally.thomas9656@gmail.com>"
LABEL description="Fragments node.js microservice"

ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
ENV NODE_ENV=production

WORKDIR /app

# Bring in only the already-installed production node_modules from stage 1
# (no npm cache, no dev deps, no build artifacts)
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY ./src ./src

# Run as the unprivileged `node` user instead of root
USER node

EXPOSE 8080

# Basic container healthcheck against the health-check route
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', res => process.exit(res.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
