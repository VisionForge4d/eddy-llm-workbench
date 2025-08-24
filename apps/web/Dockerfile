# web/Dockerfile

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Build the app
COPY . .
# Allow compose to pass in the backend URL at build time
ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
RUN npm run build

# ---- Serve stage ----
FROM nginx:1.27-alpine
# Nginx will serve the Vite build
COPY --from=build /app/dist /usr/share/nginx/html
# SPA routing (fallback to index.html)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
