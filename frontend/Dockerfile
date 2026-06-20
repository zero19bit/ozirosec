# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

FROM dependencies AS development
ENV HOST=0.0.0.0
COPY frontend ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM dependencies AS build
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SANCTUM_CSRF_URL=/sanctum/csrf-cookie
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SANCTUM_CSRF_URL=${VITE_SANCTUM_CSRF_URL}
COPY frontend ./
RUN npm run build \
    && find dist -name "*.map" -type f -delete

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
