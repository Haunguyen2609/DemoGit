# ---- Build Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy package files và install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
