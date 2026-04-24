FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
ENV DATABASE_URL=file:./prisma/dev.db
RUN npx prisma generate && npm run build && mkdir -p dist/uploads dist/tmp
RUN npx prisma db push && npx ts-node prisma/seed.ts

FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json prisma.config.ts ./
COPY prisma ./prisma
COPY --from=builder /app/prisma/dev.db ./prisma/db.sqlite
ENV DATABASE_URL=file:/app/prisma/db.sqlite
ENV JWT_SECRET=dd2aed341ca2df14c98817e9d1db3356adfb7e8676d745cd54c265437e0406a8
ENV JWT_EXPIRES_IN=7d
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]
