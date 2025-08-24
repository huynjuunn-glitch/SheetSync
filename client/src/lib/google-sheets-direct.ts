import { Order } from "@/types/order";

// Google Sheets API를 직접 호출하는 함수들
let savedConfig: {
  apiKey: string;
  sheetId: string;
  sheetName: string;
} | null = null;

export function saveGoogleSheetsConfig(config: {
  apiKey: string;
  sheetId: string;  
  sheetName: string;
}) {
  savedConfig = config;
  localStorage.setItem('google-sheets-config', JSON.stringify(config));
  return Promise.resolve({ message: "설정이 저장되었습니다" });
}

export function getGoogleSheetsConfig() {
  if (savedConfig) return savedConfig;
  
  const stored = localStorage.getItem('google-sheets-config');
  if (stored) {
    savedConfig = JSON.parse(stored);
    return savedConfig;
  }
  
  return null;
}

export async function fetchGoogleSheetsData() {
  const config = getGoogleSheetsConfig();
  if (!config) {
    throw new Error('Google Sheets 설정이 필요합니다. 관리자 설정에서 API 키와 시트 정보를 입력해주세요.');
  }

  const { apiKey, sheetId, sheetName } = config;
  const range = `${sheetName}!A:K`; // A열부터 K열까지
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 403) {
        throw new Error('Google Sheets API 권한이 없습니다. 시트가 공개되어 있는지 확인하고, API 키가 올바른지 확인해주세요.');
      }
      throw new Error(`API 요청 실패: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Google Sheets API 호출 실패:', error);
    throw error;
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  // Korean date format like "2025.07.25"
  const koreanDateMatch = dateString.match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/);
  if (koreanDateMatch) {
    const [, year, month, day] = koreanDateMatch;
    const formatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    return formatted;
  }
  
  // Try parsing as regular date
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const formatted = date.toISOString().split('T')[0];
    return formatted;
  }
  
  return dateString;
}

function convertSheetsDataToOrders(sheetsData: any[]): Order[] {
  return sheetsData.map(row => {
    // 첫 번째 컬럼이 비어있어서 인덱스를 1부터 시작
    const [, 이름, 디자인, 주문일자, 픽업일자, 맛선택, 시트, 사이즈, 크림, 요청사항, 특이사항] = row;
    
    return {
      id: Math.random().toString(36).substr(2, 9), // 임시 ID 생성
      customerName: 이름 || '',
      design: 디자인 || '',
      orderDate: formatDate(주문일자 || ''),
      pickupDate: formatDate(픽업일자 || ''),
      flavor: 맛선택 || '',
      sheet: 시트 || '',
      size: 사이즈 || '',
      cream: 크림 || '',
      requests: 요청사항 || null,
      notes: 특이사항 || null,
      orderChannel: '', // 주문경로가 시트에 없어서 빈 값으로 설정
    };
  });
}

// 인메모리 스토리지
let orders: Order[] = [];

export async function syncGoogleSheets() {
  try {
    console.log('Google Sheets 동기화 시작...');
    
    const sheetsData = await fetchGoogleSheetsData();
    console.log('시트 데이터 가져오기 완료, 행 개수:', sheetsData.length);
    
    // 헤더 제거
    const dataRows = sheetsData.slice(1);
    const newOrders = convertSheetsDataToOrders(dataRows);
    console.log('주문 데이터 변환 완료, 주문 개수:', newOrders.length);
    
    // 기존 데이터를 새 데이터로 교체
    orders = newOrders;
    console.log('저장 완료');
    
    return { message: "데이터 동기화가 완료되었습니다", count: newOrders.length };
  } catch (error) {
    console.error("Error syncing Google Sheets:", error);
    throw error;
  }
}

export async function getOrders(startDate?: string, endDate?: string): Promise<Order[]> {
  console.log('주문 데이터 요청:', { startDate, endDate });
  
  if (startDate && endDate) {
    const filteredOrders = orders.filter(order => {
      const orderDate = order.orderDate;
      return orderDate >= startDate && orderDate <= endDate;
    });
    console.log('날짜 범위 필터 결과:', filteredOrders.length);
    return filteredOrders;
  } else {
    console.log('전체 주문 개수:', orders.length);
    return orders;
  }
}

export async function getStatistics(startDate?: string, endDate?: string) {
  const filteredOrders = await getOrders(startDate, endDate);
  
  const designCounts = filteredOrders.reduce((acc, order) => {
    acc[order.design] = (acc[order.design] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const flavorCounts = filteredOrders.reduce((acc, order) => {
    acc[order.flavor] = (acc[order.flavor] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sizeCounts = filteredOrders.reduce((acc, order) => {
    acc[order.size] = (acc[order.size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sheetCounts = filteredOrders.reduce((acc, order) => {
    acc[order.sheet] = (acc[order.sheet] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const creamCounts = filteredOrders.reduce((acc, order) => {
    acc[order.cream] = (acc[order.cream] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOrders = filteredOrders.length;
  const popularDesign = Object.entries(designCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  const popularSize = Object.entries(sizeCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || null;

  return {
    designCounts,
    flavorCounts,
    sizeCounts,
    sheetCounts,
    creamCounts,
    totalOrders,
    popularDesign,
    popularSize,
  };
}