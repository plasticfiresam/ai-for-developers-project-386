FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_API_URL=
RUN npm run build

FROM node:22-alpine AS backend-build

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json ./
RUN npm ci

COPY backend/ ./
RUN npm run build

FROM node:22-alpine

WORKDIR /app/backend

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/app.db
ENV STATIC_DIR=/app/backend/public

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist ./public

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "dist/index.js"]
