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
    FROM node:22.13.1-alpine
    WORKDIR /app
    
    # Instala pacotes adicionais no ambiente de produção
    RUN apk add --no-cache curl bash
    
    RUN npm install -g pnpm@10.10.0
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --prod --frozen-lockfile
    
    COPY --from=builder /app/dist ./dist
    
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]
    