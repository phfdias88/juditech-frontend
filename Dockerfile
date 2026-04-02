FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL=http://72.60.248.41:8002
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Copy pdf.js worker to public folder before build
RUN mkdir -p public && cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs

RUN NODE_ENV=production npm run build

# Next.js standalone doesn't include static assets - copy them manually
RUN cp -r .next/static .next/standalone/.next/static
RUN mkdir -p .next/standalone/public && cp -r public/* .next/standalone/public/

ENV NODE_ENV=production
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", ".next/standalone/server.js"]
