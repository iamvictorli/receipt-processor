# Receipt Processor

## Run on Docker

1. `docker build -t receipt .` - Builds docker image
2. `docker run -p 9999:9999 receipt` - Runs container on port 9999. url will be on localhost:9999

## Routes

- `/reference` - API docs built with [scalar](https://scalar.com/)
- `/doc` - Generated OpenApi Documentation
- POST `/receipts/process`
- GET `/receipts/{id}/points`

## Tech Stack

- [Zod OpenAPI Hono](https://hono.dev/examples/zod-openapi) - generates OpenAPI documentation and validates both request and response in hono

## Local Setup

1. `pnpm install` - Install dependencies
2. `pnpm dev` - Runs application
