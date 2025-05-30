# 🧠 Notion MCP Server

## 레퍼런스 영상
![Notion MCP 사용법 영상](public/notion_mcp_video.gif)

> **Master Control Panel for Notion**  
> Your Notion workspace, now supercharged as a real-time backend server.

Notion MCP(Server)는 Notion을 단순한 노트 앱이 아닌,  
**조직의 모든 데이터를 실시간으로 제어할 수 있는 마스터 오퍼레이팅 시스템**으로 진화시키는 서버입니다.

---

## 🚀 Features

- 🔗 **Notion API 기반 통합 백엔드**
  - Notion DB를 실제 API처럼 읽고, 정제하고, 가공해요.
- ⚡ **SSG/SSR 웹사이트용 JSON 엔드포인트 제공**
  - Next.js, Nuxt 등 프론트 프레임워크와 쉽게 연동 가능해요.
- 🧭 **컨텐츠 캘린더, 채용 시스템, 업무 관리 등 다양한 MCP 템플릿 지원**
- 🔐 **보안 토큰 인증 지원 (API Key 기반)**

> ☁️ MCP를 통해 Notion을 **CMS, CRM, ATS, Task Manager**로 자유롭게 확장해보세요.

---

## 🛠 기술 스택

* Node.js / TypeScript
* Express.js 기반 REST API
* Notion Official API v1
* .cursor/mcp.json 환경변수 기반 구성
* Docker 컨테이너 지원

---

## 🧪 확장 아이디어

* GPT API와 연동해 요약, 자동 분류 기능 추가
* Slack, Discord Webhook 연결로 실시간 알림
* 관리자용 Dashboard UI 추가 (React, Next.js 기반)
* 캐싱 서버(Firebase/Supabase) 연동으로 성능 개선

---

## 🧬 왜 Notion MCP Server인가요?

우리는 모두 Notion을 사랑하지만,
그 안의 데이터를 **실제로 "제어"하거나 "활용"하는 데는 한계**를 느껴요.
그래서 Notion MCP는 단순한 통합 도구가 아니라,
**Notion을 “진짜 백오피스”로 만드는 OS입니다.**

---

## 💬 Contact

만든 사람: [하리아빠 (@HariFatherKR)](https://github.com/HariFatherKR)
질문이나 협업 제안은 언제든지 Issues 또는 Discussions에 남겨주세요!

---

> **당신의 Notion, 이제는 서버가 됩니다.**
> → `Notion MCP Server`

---

## 🐳 Docker로 실행하기

### 준비 사항

1. Docker 및 Docker Compose 설치
2. Notion API 토큰 발급 ([Notion Developers](https://developers.notion.com/)에서 발급 가능)

### 환경 설정

1. `.env` 파일 생성:

```
PORT=3000
NOTION_TOKEN=your_notion_token_here
```

### 도커 이미지 빌드 및 실행

```bash
# 도커 이미지 빌드 및 컨테이너 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down
```

### 직접 실행 (도커 없이)

```bash
# 의존성 설치
npm install

# 서버 실행
npm start
```

서버가 실행되면 다음 주소로 접속할 수 있습니다:
- API 서버: http://localhost:3000
- API 문서: http://localhost:3000/api-docs

