FROM node:18

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# package.jsonをコピーし、依存関係をインストール
COPY package.json ./
RUN npm install


# アプリケーションのソースコードをコピー
COPY . .

# ポート5000を公開
EXPOSE 5000

# MySQLが起動するまで待機し、その後アプリケーションを開始
CMD ["node", "server.ts"]


