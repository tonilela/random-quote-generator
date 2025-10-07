FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

RUN npm cache clean --force

RUN npm install -g tsx

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]