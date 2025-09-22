FROM node:22-alpine3.18 AS base

# All deps stage
FROM base AS deps
WORKDIR /app
ADD package.json ./
RUN npm install



# Build stage
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
EXPOSE 3333
CMD ["npm", "run", "dev"]


