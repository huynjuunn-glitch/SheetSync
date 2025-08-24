const express = require('express');
const path = require('path');

const app = express();
const port = 5000;

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, 'client/dist')));

// SPA를 위한 fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🎂 케이크 주문 관리 앱이 실행 중입니다: http://0.0.0.0:${port}`);
  console.log('✅ UI 변경사항:');
  console.log('   - 우측 상단 "관리자" 텍스트 제거');
  console.log('   - "로그인" 버튼 추가');
});