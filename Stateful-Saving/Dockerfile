# Dockerfile
FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --build-from-source   # Important to rebuild native modules correctly
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
