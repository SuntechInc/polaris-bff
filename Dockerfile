# ---- STAGE 1: Build ----
    FROM node:22.13.1-alpine AS builder
    WORKDIR /app
    
    # Instala pacotes adicionais (curl, bash)
    RUN apk add --no-cache curl bash
    
    # Instala pnpm globalmente
    RUN npm install -g pnpm@10.10.0
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    COPY . .
    RUN pnpm run build
    
    # ---- STAGE 2: Production ----
    FROM node:22-alpine
    WORKDIR /app
    RUN corepack enable && corepack prepare pnpm@10.10.0 --activate
        
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --prod --frozen-lockfile --ignore-scripts        # só deps prod
        
    COPY --from=builder /app/dist ./dist
        
    ENV NODE_ENV=production
    EXPOSE 3000
    CMD ["node", "dist/src/main.js"]
    