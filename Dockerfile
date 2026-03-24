FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

FROM node:20-alpine
WORKDIR /app

COPY bibliotech/backend/backend/package*.json ./bibliotech/backend/backend/
RUN cd bibliotech/backend/backend && npm install --omit=dev

COPY bibliotech/backend/backend/ ./bibliotech/backend/backend/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "bibliotech/backend/backend/server.js"]
