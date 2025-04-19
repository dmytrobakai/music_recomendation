FROM node:18-alpine AS builder
WORKDIR /app
COPY . .

ENV NEXT_PUBLIC_API_URL=https://api-91386896322.us-central1.run.app

RUN npm install && npm run build

FROM node:18-alpine
WORKDIR /app

ENV PORT=8080

COPY --from=builder /app ./
EXPOSE 8080

CMD ["npm", "start"]
