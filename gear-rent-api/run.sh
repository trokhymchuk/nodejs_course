#!/bin/bash
set -e

if [ ! -f .env ]; then
  cp .env.example .env
  JWT_SECRET=$(openssl rand -hex 32)
  sed -i "s/your-secret-key-here/$JWT_SECRET/" .env
  echo ".env created"
fi

npm install
npx prisma generate
npx prisma db push
npm run dev
