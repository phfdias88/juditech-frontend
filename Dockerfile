FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && echo "DEPS INSTALLED OK"

COPY . .

ARG NEXT_PUBLIC_API_URL=http://72.60.248.41:8002
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx next build

ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", ".next/standalone/server.js"]
