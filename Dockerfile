
FROM node:16.15.1-slim

WORKDIR /usr/src/app

COPY . ./

EXPOSE 7998 7998

RUN yarn

CMD ["yarn","start"]