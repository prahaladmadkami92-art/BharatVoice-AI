FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y \
    python3 \
    python-is-python3 \
    espeak \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]
