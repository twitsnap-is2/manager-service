FROM node:lts-alpine

WORKDIR /home/node

COPY . .
RUN npm i && npm run prod:build

# EXPOSE 3000
CMD ["npm", "run", "prod:start"]