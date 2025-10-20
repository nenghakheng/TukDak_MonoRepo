# Check out https://hub.docker.com/_/node to select a new base image
FROM docker.io/library/node:24-slim

# Install sqlite3 CLI tools
USER root
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Bundle app source code
COPY --chown=node . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Create data directory for SQLite database
RUN mkdir -p /home/node/app/data

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production

EXPOSE ${PORT}

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/ping', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

CMD [ "node", "." ]