FROM node:20

WORKDIR /app

# package.jsonとpackage-lock.jsonのみをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production=false

# ソースコードをコピー（.dockerignoreでnode_modulesは除外される）
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
