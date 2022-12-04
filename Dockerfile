FROM node:lts-alpine AS builder
WORKDIR /app
COPY package.json yarn.lock tsconfig.json .eslintrc.json /app/
RUN yarn install
COPY src /app/src
RUN yarn build

FROM node:lts-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json
RUN yarn install
EXPOSE 80
ENTRYPOINT ["yarn", "start"]
