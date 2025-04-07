FROM node:23-alpine AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --production
RUN yarn global add @nestjs/cli@11.0.0

COPY . .

RUN yarn build


FROM node:23-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]