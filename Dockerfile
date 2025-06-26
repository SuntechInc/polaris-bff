# ---------- STAGE 1 : build ----------
    FROM node:22-alpine AS builder
    WORKDIR /app
    
    # 1. Instala pnpm uma única vez
    RUN corepack enable && corepack prepare pnpm@10.10.0 --activate
    
    # 2. Instala dependências **dev + prod**
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # 3. Copia código e gera /dist
    COPY . .
    RUN pnpm run build            # -> dist/
    
    # ---------- STAGE 2 : runtime ----------
    FROM node:22-alpine
    WORKDIR /app
    
    # 4. Habilita pnpm apenas se precisar exec-time (não obrigatório)
    RUN corepack enable && corepack prepare pnpm@10.10.0 --activate
    
    # 5. Copia artefatos mínimos
    COPY package.json pnpm-lock.yaml ./
    COPY --from=builder /app/node_modules ./node_modules   # já contém só prod deps
    COPY --from=builder /app/dist ./dist
    
    # 6. Define ambiente e porta
    ENV NODE_ENV=production
    EXPOSE 3000
    
    CMD ["node", "dist/src/main.js"]
    