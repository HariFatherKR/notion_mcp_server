FROM node:18-alpine

WORKDIR /app

# 의존성 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production

# 서버 실행
CMD ["node", "server.js"]
