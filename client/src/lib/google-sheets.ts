import { apiRequest } from "./queryClient";

export async function syncGoogleSheets() {
  const response = await apiRequest("POST", "/api/sync-sheets");
  return response.json();
}

export async function getOrders(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await apiRequest("GET", `/api/orders?${params}`);
  return response.json();
}

export async function getStatistics(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await apiRequest("GET", `/api/statistics?${params}`);
  return response.json();
}
