# Quizza API

API for quizza.live.

Technologies used : NestJS, TypeORM, MySQL, Docker.

## Prerequisites

- Docker and Docker Compose
- Node.js
- Yarn package manager

## Environment Setup

Create a `.env` file in the root directory based on this `.env.example` file.

## Running with Docker Compose

### Development Mode

1. Start the application:

```bash
docker-compose up -d
```

2. Watch logs:

```bash
docker-compose logs -f app
```

3. Stop the application:

```bash
docker-compose down
```

## Database Migrations

### Generate a Migration

```bash
# From your local machine
yarn migration:generate ./src/db/migrations/MigrationName

# From within the container
docker-compose exec app yarn migration:generate ./src/db/migrations/MigrationName
```

### Create an Empty Migration

```bash
yarn migration:create ./src/db/migrations/MigrationName
```

### Run Migrations

```bash
# From your local machine
yarn migration:run

# From within the container
docker-compose exec app yarn migration:run
```

### Revert the Latest Migration

```bash
yarn migration:revert
```

## Development Without Docker

1. Install dependencies:

```bash
yarn
```

2. Start the development server:

```bash
yarn start:dev
```

## Available Scripts

- `yarn build` - Build the application
- `yarn start` - Start the application
- `yarn start:dev` - Start with hot-reload
- `yarn lint` - Lint the codebase
- `yarn test` - Run tests
- `yarn test:e2e` - Run end-to-end tests