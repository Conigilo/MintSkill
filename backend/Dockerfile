FROM oven/bun:1.1-alpine
WORKDIR /app

# Copy package files and lock file
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Expose the port
EXPOSE 8000

# Start Elysia backend
CMD ["bun", "run", "src/index.ts"]
