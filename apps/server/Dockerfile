# ---------- build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# deps first (cacheable)
COPY package*.json ./
RUN npm ci

# source and build
COPY tsconfig.json ./tsconfig.json
COPY src ./src
RUN npm run build

# ---------- runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# only prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# app files
COPY --from=build /app/dist ./dist

# container port (informational)
EXPOSE 5000

# run the server
CMD ["node", "dist/index.js"]
