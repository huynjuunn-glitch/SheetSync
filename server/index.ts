import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

console.log('🚀 Starting static server...');

// 정적 파일 서빙 (빌드된 파일들)
const distPath = path.resolve(__dirname, '../dist/public');
console.log('📁 Serving static files from:', distPath);

app.use(express.static(distPath));

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    distPath: distPath 
  });
});

// 더미 API 엔드포인트들
app.get('/api/orders', (req, res) => {
  res.json([]);
});

app.get('/api/statistics', (req, res) => {
  res.json({
    designCounts: {},
    flavorCounts: {},
    sizeCounts: {},
    creamCounts: {},
    totalOrders: 0,
    popularDesign: null,
    popularSize: null
  });
});

app.post('/api/sync-sheets', (req, res) => {
  res.json({ message: "클라이언트에서 직접 처리됩니다", count: 0 });
});

app.post('/api/save-settings', (req, res) => {
  res.json({ message: "클라이언트에서 직접 처리됩니다" });
});

// SPA fallback - 모든 비-API 요청을 index.html로 리디렉션
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 5000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Static server running on http://0.0.0.0:${port}`);
  console.log(`📁 Serving files from: ${distPath}`);
  console.log(`🔗 Health check: http://0.0.0.0:${port}/health`);
});