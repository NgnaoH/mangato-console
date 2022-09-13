FROM node:16.13.2

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --network-timeout 1000000
RUN yarn install --frozen-lockfile \
    && yarn cache clean

COPY . .
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]