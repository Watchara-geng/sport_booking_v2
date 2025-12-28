FROM node:20-bullseye
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl python3 build-essential && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
    else npm install; fi
COPY . .
EXPOSE 4000
CMD ["sh", "-c", "npm run prisma:generate && npm run dev"]