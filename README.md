# Notion API 서버

## 레퍼런스 영상
![Notion MCP 사용법 영상](public/notion_mcp_video.gif)

노션 API를 간편하게 사용하기 위한 커스텀 서버입니다. Express.js를 사용하여 구현되었으며, Notion API의 다양한 기능을 REST API로 제공합니다.

## 설치 방법

1. 필요한 패키지 설치:
```bash
npm install express cors @notionhq/client swagger-jsdoc swagger-ui-express
```

2. 서버 실행:
```bash
node server.js
```

3. 서버가 http://localhost:3000 에서 실행됩니다.

## 설정 방법

1. server.js 파일의 `NOTION_TOKEN` 변수에 노션 API 토큰을 설정합니다:
```javascript
const NOTION_TOKEN = '여기에_노션_API_토큰_입력';
```

2. 필요한 경우 PORT 변수를 수정하여 다른 포트에서 실행할 수 있습니다.

## API 기능

### 검색 API
- `POST /api/search`: 노션 워크스페이스 내 페이지 및 데이터베이스 검색

### 데이터베이스 API
- `POST /api/databases`: 데이터베이스 생성
- `GET /api/databases/:id`: 데이터베이스 조회
- `PATCH /api/databases/:id`: 데이터베이스 업데이트
- `POST /api/databases/:id/query`: 데이터베이스 쿼리

### 페이지 API
- `POST /api/pages`: 페이지 생성
- `GET /api/pages/:id`: 페이지 정보 조회
- `PATCH /api/pages/:id`: 페이지 업데이트
- `GET /api/pages/:page_id/properties/:property_id`: 페이지 속성 조회

### 블록 API
- `GET /api/blocks/:id`: 블록 조회
- `GET /api/blocks/:id/children`: 블록 내용 조회
- `PATCH /api/blocks/:id`: 블록 업데이트
- `PATCH /api/blocks/:id/children`: 블록 내용 추가
- `DELETE /api/blocks/:id`: 블록 삭제

### 사용자 API
- `GET /api/users`: 사용자 목록 조회
- `GET /api/users/:id`: 사용자 조회
- `GET /api/users/me`: 자신의 사용자 정보 조회

### 코멘트 API
- `POST /api/comments`: 코멘트 생성
- `GET /api/comments?block_id=...`: 코멘트 조회

## Cursor MCP 통합

1. `.cursor/mcp.json` 파일에 다음 설정을 추가:
```json
{
  "mcpServers": {
    "customApi": {
      "url": "http://localhost:3000",
      "toolNameStrategy": "url-path-segments"
    }
  }
}
```

2. 서버 실행 중에 Cursor에서 MCP 기능을 사용하여 노션 API에 접근할 수 있습니다.

## 사용 예제

### 검색 요청 예시
```javascript
// 페이지 검색
fetch('http://localhost:3000/api/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filter: {
      value: "page",
      property: "object"
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 페이지 생성 예시
```javascript
// 새 페이지 생성
fetch('http://localhost:3000/api/pages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    parent: {
      page_id: "페이지_ID"
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: "새 페이지 제목"
            }
          }
        ]
      }
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

### 데이터베이스 생성 예시
```javascript
// 데이터베이스 생성
fetch('http://localhost:3000/api/databases', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    parent: {
      type: "page_id",
      page_id: "페이지_ID"
    },
    title: [
      {
        text: {
          content: "테스트 데이터베이스"
        }
      }
    ],
    properties: {
      "이름": {
        "title": {},
        "description": "제목 항목"
      },
      "상태": {
        "description": "작업 상태",
        "select": {
          "options": [
            {
              "name": "진행 중",
              "color": "blue"
            },
            {
              "name": "완료",
              "color": "green"
            }
          ]
        }
      }
    }
  })
})
.then(response => response.json())
.then(data => console.log(data));
```

## API 문서

API 문서는 서버 실행 시 다음 URL에서 확인할 수 있습니다:
- Swagger UI: http://localhost:3000/api-docs
- OpenAPI 스키마: http://localhost:3000/openapi.json 