FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src
ENV NODE_ENV=production
RUN npm run prisma:generate && npm run build || true
EXPOSE 4000
CMD ["node","dist/server.js"]
