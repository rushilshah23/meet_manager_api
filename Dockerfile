FROM node:18.18.0-alpine
# RUN mkdir -p /opt/app
# WORKDIR /opt/app
# COPY src/package.json src/package-lock.json /
# RUN npm install
# COPY src/ .
# COPY .env /
# EXPOSE 5000
# CMD [ "npm", "run", "prod"]


WORKDIR /app
COPY . .
RUN npm install 
RUN npm run build
# CMD ["npm","run","prod"]
EXPOSE 5000