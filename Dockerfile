# AfroSpace Production Dockerfile
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Expose the single port managed by the platform
EXPOSE 3000

# Start the full-stack server
CMD ["node", "dist/server.js"]
