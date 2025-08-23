export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { apiKey, sheetId, sheetName } = req.body;
    
    // Vercel에서는 환경변수를 런타임에 설정할 수 없으므로
    // 메모리나 다른 저장소를 사용해야 합니다
    // 여기서는 간단히 전역 객체를 사용
    if (!global.settings) {
      global.settings = {};
    }
    
    global.settings.GOOGLE_API_KEY = apiKey;
    global.settings.GOOGLE_SHEET_ID = sheetId;
    global.settings.GOOGLE_SHEET_NAME = sheetName;
    
    res.json({ message: "설정이 저장되었습니다" });
  } catch (error) {
    console.error("Error saving settings:", error);
    res.status(500).json({ error: "설정 저장에 실패했습니다" });
  }
}