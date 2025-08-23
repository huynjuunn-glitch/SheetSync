import { google } from 'googleapis';
import { storage } from '../lib/storage.js';
import { googleSheetsRowSchema } from '../shared/schema.js';
import { randomUUID } from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log('동기화 시작...');
    
    // 설정 가져오기
    const apiKey = global.settings?.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    const sheetId = global.settings?.GOOGLE_SHEET_ID || process.env.GOOGLE_SHEET_ID;
    const sheetName = global.settings?.GOOGLE_SHEET_NAME || process.env.GOOGLE_SHEET_NAME || 'Sheet1';

    if (!apiKey || !sheetId) {
      return res.status(400).json({ 
        error: "Google API 키와 시트 ID가 필요합니다. 관리자 설정에서 입력해주세요." 
      });
    }

    const sheetsData = await fetchGoogleSheetsData(apiKey, sheetId, sheetName);
    console.log('시트 데이터 가져오기 완료, 행 개수:', sheetsData.length);
    
    const orders = convertSheetsDataToOrders(sheetsData);
    console.log('주문 데이터 변환 완료, 주문 개수:', orders.length);
    
    await storage.seedOrders(orders);
    console.log('저장 완료');
    
    res.json({ 
      message: "데이터 동기화가 완료되었습니다", 
      count: orders.length 
    });
  } catch (error) {
    console.error("Error syncing data:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "데이터 동기화에 실패했습니다" 
    });
  }
}

async function fetchGoogleSheetsData(apiKey, sheetId, sheetName) {
  const sheets = google.sheets({ version: 'v4', auth: apiKey });
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:K`,
  });

  const rows = response.data.values || [];
  console.log('헤더 행:', rows[0]);

  // Skip header row
  const dataRows = rows.slice(1);
  
  return dataRows.map((row, index) => {
    console.log(`행 ${index + 2} 처리:`, row);
    // 첫 번째 컬럼이 비어있어서 인덱스를 1부터 시작
    const [, 이름, 디자인, 주문일자, 픽업일자, 맛선택, 시트, 사이즈, 크림, 요청사항, 특이사항] = row;
    
    return googleSheetsRowSchema.parse({
      이름: 이름 || '',
      디자인: 디자인 || '',
      주문일자: 주문일자 || '',
      픽업일자: 픽업일자 || '',
      맛선택: 맛선택 || '',
      시트: 시트 || '',
      사이즈: 사이즈 || '',
      크림: 크림 || '',
      요청사항: 요청사항 || '',
      특이사항: 특이사항 || '',
      주문경로: '', // 주문경로가 시트에 없어서 빈 값으로 설정
    });
  });
}

function convertSheetsDataToOrders(sheetsData) {
  return sheetsData.map(row => ({
    id: randomUUID(),
    customerName: row.이름,
    design: row.디자인,
    orderDate: formatDate(row.주문일자),
    pickupDate: formatDate(row.픽업일자),
    flavor: row.맛선택,
    sheet: row.시트,
    size: row.사이즈,
    cream: row.크림,
    requests: row.요청사항 || null,
    notes: row.특이사항 || null,
    orderChannel: row.주문경로,
  }));
}

function formatDate(dateString) {
  console.log('날짜 변환 시작:', dateString);
  
  if (!dateString) return '';
  
  // Korean date format like "2025.07.25"
  const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (koreanDateMatch) {
    const [, year, month, day] = koreanDateMatch;
    const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    console.log('한국 날짜 형식 변환:', dateString, '->', formatted);
    return formatted;
  }
  
  // Try parsing as regular date
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const formatted = date.toISOString().split('T')[0];
    console.log('일반 날짜 형식 변환:', dateString, '->', formatted);
    return formatted;
  }
  
  console.log('날짜 변환 실패, 원본 반환:', dateString);
  return dateString;
}