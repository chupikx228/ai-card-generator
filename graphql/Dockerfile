FROM node:24-alpine

LABEL maintainer="Podorozhnyi Illia" version="1.0" description="Deckly GraphQL API (Apollo Server + JWT)"

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV PORT=4001
EXPOSE 4001

CMD ["node", "index.ts"]
