FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install
COPY tsconfig.json .eslintrc.json /app/
COPY src /app/src
RUN yarn build

FROM node:lts-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
RUN yarn install
ENTRYPOINT ["yarn", "start"]
