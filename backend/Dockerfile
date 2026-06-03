FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose the port
EXPOSE 8000

# Start Elysia backend
CMD ["bun", "run", "src/index.ts"]
