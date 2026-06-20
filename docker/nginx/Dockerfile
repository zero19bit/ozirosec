# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
ARG VITE_API_BASE_URL=/api/v1
ARG VITE_SANCTUM_CSRF_URL=/sanctum/csrf-cookie
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SANCTUM_CSRF_URL=${VITE_SANCTUM_CSRF_URL}
COPY frontend ./
RUN npm run build \
    && find dist -name "*.map" -type f -delete

FROM nginx:1.27-alpine AS production
COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html
COPY backend/public /var/www/backend/public
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health/live >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
