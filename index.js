const { Client } = require('@notionhq/client');

// Notion API 토큰 설정
const NOTION_TOKEN = process.env.NOTION_TOKEN;

// Notion 클라이언트 초기화
const notion = new Client({
  auth: NOTION_TOKEN,
});

// API 호출 테스트 함수
async function testNotionAPI() {
  try {
    // 검색 API 호출
    console.log('검색 API 호출 중...');
    const searchResponse = await notion.search({
      query: '테스트',
    });
    console.log('검색 결과:');
    console.log(JSON.stringify(searchResponse, null, 2));

    // 사용자 정보 조회 시도
    console.log('\n사용자 정보 조회 중...');
    try {
      const usersResponse = await notion.users.list({});
      console.log('사용자 목록:');
      console.log(JSON.stringify(usersResponse, null, 2));
    } catch (error) {
      console.log('사용자 정보 조회 실패:', error.message);
      console.log('권한 문제일 수 있습니다. 통합 설정에서 User capabilities 확인 필요');
    }
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 테스트 실행
testNotionAPI();