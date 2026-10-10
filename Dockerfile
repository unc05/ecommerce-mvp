FROM node:20-alpine

WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy thư mục prisma và generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 3000

CMD ["npm", "start"]