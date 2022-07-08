
FROM node:16

WORKDIR /usr/src/app

COPY . ./

EXPOSE 7998 7998

RUN yarn

CMD ["yarn","start"]