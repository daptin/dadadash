# develop stage
FROM node:14.16 as develop-stage
WORKDIR /app
COPY package*.json ./
RUN npm install -g @quasar/cli@1.4.0
COPY . .

# build stage
FROM develop-stage as build-stage
RUN npm install
RUN quasar build -m spa

# production stage
FROM nginx:1.17.5-alpine as production-stage
COPY --from=build-stage /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
