import { 
  syncGoogleSheets as syncDirectly, 
  getOrders as getOrdersDirectly, 
  getStatistics as getStatisticsDirectly,
  saveGoogleSheetsConfig
} from "./google-sheets-direct";

export async function syncGoogleSheets() {
  return await syncDirectly();
}

export async function getOrders(startDate?: string, endDate?: string) {
  return await getOrdersDirectly(startDate, endDate);
}

export async function getStatistics(startDate?: string, endDate?: string) {
  return await getStatisticsDirectly(startDate, endDate);
}

export { saveGoogleSheetsConfig };
