const express = require('express');
const cors = require('cors');
const { Client } = require('@notionhq/client');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

// OpenAPI 스키마 설정
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Notion API 서버',
      version: '1.0.0',
      description: 'Notion API를 위한 커스텀 서버',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: '개발 서버',
      },
    ],
  },
  apis: ['./server.js'], // 현재 파일에서 JSDoc 주석을 찾음
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Express 앱 초기화
const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors({
  exposedHeaders: ['X-MCP-Version'],
}));
app.use(express.json());

// 정적 파일 제공 설정
app.use(express.static('public'));

// index.html 파일을 제공할 때 PORT 환경 변수 주입
app.get('/', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  
  // API_BASE_URL을 환경 변수 PORT를 사용하여 동적으로 설정
  html = html.replace(
    "const API_BASE_URL = 'http://localhost:3000/api';",
    `const API_BASE_URL = 'http://localhost:${PORT}/api';`
  );
  
  res.send(html);
});

// 모든 응답에 MCP 헤더 추가
app.use((req, res, next) => {
  res.setHeader('X-MCP-Version', '1.0.0');
  next();
});

// Swagger UI 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocs);
});

// Notion API 토큰 설정
const NOTION_TOKEN = process.env.NOTION_TOKEN;

// Notion 클라이언트 초기화
const notion = new Client({
  auth: NOTION_TOKEN,
});

// 루트 경로 - 상태 확인
app.get('/', (req, res) => {
  res.json({ status: 'Notion API 서버가 실행 중입니다.' });
});

/**
 * @swagger
 * /api/search:
 *   post:
 *     summary: Notion 워크스페이스에서 검색을 수행합니다
 *     description: 키워드를 사용하여 페이지와 데이터베이스를 검색합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               query:
 *                 type: string
 *                 description: 검색 키워드
 *               filter:
 *                 type: object
 *                 description: 검색 필터
 *               sort:
 *                 type: object
 *                 description: 정렬 옵션
 *     responses:
 *       200:
 *         description: 검색 결과
 */
// ========= 검색 API =========
app.post('/api/search', async (req, res) => {
  try {
    const { query = '', filter, sort, start_cursor = null, page_size = 100 } = req.body;
    
    // API 호출용 옵션 생성
    const options = { query };
    
    // null이 아닌 경우에만 옵션에 추가
    if (start_cursor) options.start_cursor = start_cursor;
    if (page_size) options.page_size = page_size;
    if (filter && Object.keys(filter).length > 0) options.filter = filter;
    if (sort && Object.keys(sort).length > 0) options.sort = sort;
    
    const response = await notion.search(options);
    res.json(response);
  } catch (error) {
    console.error('검색 API 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========= 데이터베이스 API =========
// 데이터베이스 생성
app.post('/api/databases', async (req, res) => {
  try {
    const response = await notion.databases.create(req.body);
    res.json(response);
  } catch (error) {
    console.error('데이터베이스 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 데이터베이스 조회
app.get('/api/databases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.databases.retrieve({
      database_id: id
    });
    res.json(response);
  } catch (error) {
    console.error('데이터베이스 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 데이터베이스 업데이트
app.patch('/api/databases/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.databases.update({
      database_id: id,
      ...req.body
    });
    res.json(response);
  } catch (error) {
    console.error('데이터베이스 업데이트 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 데이터베이스 쿼리
app.post('/api/databases/:id/query', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.databases.query({
      database_id: id,
      ...req.body,
    });
    res.json(response);
  } catch (error) {
    console.error('데이터베이스 쿼리 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/pages:
 *   post:
 *     summary: 새 페이지를 생성합니다
 *     description: 지정된 상위 페이지 아래에 새 페이지를 생성합니다
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parent:
 *                 type: object
 *                 description: 상위 페이지 정보
 *               properties:
 *                 type: object
 *                 description: 페이지 속성
 *     responses:
 *       200:
 *         description: 생성된 페이지 정보
 */
// ========= 페이지 API =========
// 페이지 생성
app.post('/api/pages', async (req, res) => {
  try {
    const response = await notion.pages.create(req.body);
    res.json(response);
  } catch (error) {
    console.error('페이지 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/pages/{id}:
 *   get:
 *     summary: 페이지 정보를 조회합니다
 *     description: 페이지 ID를 기반으로 페이지 정보를 가져옵니다
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 페이지 ID
 *     responses:
 *       200:
 *         description: 페이지 정보
 */
// 페이지 조회
app.get('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.pages.retrieve({ page_id: id });
    res.json(response);
  } catch (error) {
    console.error('페이지 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 페이지 업데이트
app.patch('/api/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.pages.update({
      page_id: id,
      ...req.body,
    });
    res.json(response);
  } catch (error) {
    console.error('페이지 업데이트 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 페이지 속성 조회
app.get('/api/pages/:page_id/properties/:property_id', async (req, res) => {
  try {
    const { page_id, property_id } = req.params;
    const response = await notion.pages.properties.retrieve({
      page_id,
      property_id
    });
    res.json(response);
  } catch (error) {
    console.error('페이지 속성 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========= 블록 API =========
// 블록 조회
app.get('/api/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.blocks.retrieve({
      block_id: id
    });
    res.json(response);
  } catch (error) {
    console.error('블록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 블록 내용 조회
app.get('/api/blocks/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const { start_cursor, page_size } = req.query;
    const response = await notion.blocks.children.list({
      block_id: id,
      start_cursor,
      page_size
    });
    res.json(response);
  } catch (error) {
    console.error('블록 내용 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 블록 업데이트
app.patch('/api/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.blocks.update({
      block_id: id,
      ...req.body
    });
    res.json(response);
  } catch (error) {
    console.error('블록 업데이트 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 블록 내용 추가
app.patch('/api/blocks/:id/children', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.blocks.children.append({
      block_id: id,
      children: req.body.children,
    });
    res.json(response);
  } catch (error) {
    console.error('블록 추가 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 블록 삭제
app.delete('/api/blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.blocks.delete({
      block_id: id
    });
    res.json(response);
  } catch (error) {
    console.error('블록 삭제 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========= 사용자 API =========
// 사용자 목록 조회
app.get('/api/users', async (req, res) => {
  try {
    const { start_cursor, page_size } = req.query;
    const response = await notion.users.list({
      start_cursor,
      page_size
    });
    res.json(response);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 사용자 조회
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await notion.users.retrieve({
      user_id: id
    });
    res.json(response);
  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 자신의 사용자 정보 조회
app.get('/api/users/me', async (req, res) => {
  try {
    const response = await notion.users.me();
    res.json(response);
  } catch (error) {
    console.error('자신의 사용자 정보 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========= 코멘트 API =========
// 코멘트 생성
app.post('/api/comments', async (req, res) => {
  try {
    const response = await notion.comments.create(req.body);
    res.json(response);
  } catch (error) {
    console.error('코멘트 생성 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 코멘트 조회
app.get('/api/comments', async (req, res) => {
  try {
    const { block_id, start_cursor, page_size } = req.query;
    
    if (!block_id) {
      return res.status(400).json({ error: 'block_id는 필수 파라미터입니다.' });
    }
    
    const response = await notion.comments.list({
      block_id,
      start_cursor,
      page_size
    });
    res.json(response);
  } catch (error) {
    console.error('코멘트 조회 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Notion API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`API 문서: http://localhost:${PORT}/api-docs`);
  console.log(`OpenAPI 스키마: http://localhost:${PORT}/openapi.json`);
  console.log('사용 가능한 엔드포인트:');
  console.log('- 검색: POST /api/search');
  console.log('- 데이터베이스: GET, POST, PATCH /api/databases, POST /api/databases/:id/query');
  console.log('- 페이지: GET, POST, PATCH /api/pages, GET /api/pages/:page_id/properties/:property_id');
  console.log('- 블록: GET, PATCH, DELETE /api/blocks/:id, GET, PATCH /api/blocks/:id/children');
  console.log('- 사용자: GET /api/users, GET /api/users/:id, GET /api/users/me');
  console.log('- 코멘트: POST /api/comments, GET /api/comments?block_id=...');
}); 