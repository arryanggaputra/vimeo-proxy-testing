# VimeoVideoProxy2

A video proxy server for Vimeo built with Bun and Hono.

## Local Development

### Install dependencies
```sh
bun install
```

### Run in development mode
```sh
bun run dev
```

### Build for production
```sh
bun run build
```

### Run production build
```sh
bun run start
```

### Run in background
```sh
# Simple background process
bun run start &

# With nohup (persists after terminal close)
nohup bun run start > output.log 2>&1 &
```

## Docker

### Build and run with Docker Compose
```sh
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Build and run with Docker
```sh
# Build image
docker build -t vimeo-proxy .

# Run container
docker run -d \
  -p 3000:3000 \
  -e API_BASE_URL=your_api_url \
  --name vimeo-proxy \
  vimeo-proxy
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `API_BASE_URL` - Base URL for the Vimeo API (required)

Create a `.env` file:
```env
API_BASE_URL=https://your-api-url.com
PORT=3000
```

## Usage

Open http://localhost:3000
