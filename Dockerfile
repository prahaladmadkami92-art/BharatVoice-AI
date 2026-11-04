FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y python3 python3-venv espeak \
    && rm -rf /var/lib/apt/lists/*

RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir edge-tts

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm", "start"]0
