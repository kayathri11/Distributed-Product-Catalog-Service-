FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN npm ci
COPY apps/api apps/api
RUN npm run build --workspace @catalog/api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN npm ci --omit=dev
COPY --from=build /app/apps/api/dist apps/api/dist
CMD ["npm", "run", "start", "--workspace", "@catalog/api"]
