FROM node:14.8.0-alpine as build
WORKDIR /app
COPY package*.json /app/
RUN npm install sockjs-client && npm install
COPY . /app/
RUN npm run build

# Production
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh
RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "./start.sh"]