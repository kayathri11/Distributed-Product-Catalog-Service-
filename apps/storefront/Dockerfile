FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/storefront/package.json apps/storefront/package.json
RUN npm ci
COPY apps/storefront apps/storefront
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build --workspace @catalog/storefront

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/apps/storefront/.next/standalone ./
COPY --from=build /app/apps/storefront/.next/static ./apps/storefront/.next/static
EXPOSE 3000
CMD ["node", "apps/storefront/server.js"]
