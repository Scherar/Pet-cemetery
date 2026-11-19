# Container für Hoster mit Container-Betrieb (z. B. mittwald). Node 22 wird wegen node:sqlite benötigt.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATA_DIR=/data STORAGE_DIR=/storage
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
VOLUME ["/data", "/storage"]
EXPOSE 3000
CMD ["npm", "start"]
