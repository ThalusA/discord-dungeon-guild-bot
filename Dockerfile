FROM node:lts-alpine AS builder
WORKDIR /app
COPY . /app
RUN yarn install
RUN yarn build

FROM node:lts-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
RUN yarn install
ENTRYPOINT ["yarn", "start"]
