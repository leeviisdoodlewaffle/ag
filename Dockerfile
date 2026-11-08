FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src ./src

EXPOSE 80 8080 1111 3390

CMD ["node", "server.js"]
