// 설정 저장 및 불러오기
export interface GoogleSheetsSettings {
  apiKey: string;
  sheetId: string;
  sheetName: string;
}

const SETTINGS_KEY = 'google_sheets_settings';

export function saveSettings(settings: GoogleSheetsSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadSettings(): GoogleSheetsSettings | null {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function clearSettings(): void {
  localStorage.removeItem(SETTINGS_KEY);
}