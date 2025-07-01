# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm install
COPY src/frontend/ .
RUN npm run build

# Stage 2: Build the backend
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install -g typescript
COPY src/backend/ .
RUN tsc -p src/backend/tsconfig.json

# Stage 3: Final image
FROM node:18-alpine
WORKDIR /app
COPY --from=backend-builder /app/package.json ./
RUN npm install --production
COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/frontend/build ./frontend/build
EXPOSE 3001
CMD ["node", "dist/index.js"]
