FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3002

# Start AI Microservice
CMD ["bun", "run", "src/index.ts"]
