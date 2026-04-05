FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads/materials/pdf uploads/materials/videos

EXPOSE 3001

CMD ["node", "src/app.js"]
