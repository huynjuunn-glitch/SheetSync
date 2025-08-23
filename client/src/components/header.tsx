import { useState, useEffect } from "react";
import { Cake, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveSettings, loadSettings, type GoogleSheetsSettings } from "@/lib/settings";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [sheetName, setSheetName] = useState("Sheet1");
  const { toast } = useToast();

  useEffect(() => {
    // 저장된 설정 불러오기
    const settings = loadSettings();
    if (settings) {
      setGoogleApiKey(settings.apiKey);
      setSheetId(settings.sheetId);
      setSheetName(settings.sheetName);
    }
  }, []);

  const handleSaveSettings = async () => {
    try {
      const settings: GoogleSheetsSettings = {
        apiKey: googleApiKey,
        sheetId,
        sheetName,
      };

      // 로컬 스토리지에 저장
      saveSettings(settings);

      // 서버에도 저장
      await apiRequest("POST", "/api/save-settings", {
        apiKey: googleApiKey,
        sheetId,
        sheetName,
      });

      toast({
        title: "설정 저장 완료",
        description: "구글 시트 설정이 저장되었습니다.",
      });

      setIsSettingsOpen(false);
    } catch (error) {
      toast({
        title: "설정 저장 실패",
        description: "설정 저장에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cake className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">케이크 주문 관리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">관리자</span>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsSettingsOpen(true)}
                data-testid="button-settings"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md" data-testid="modal-settings">
          <DialogHeader>
            <DialogTitle>구글 시트 연동 설정</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">Google API 키</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Google Cloud Console에서 발급받은 API 키"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                data-testid="input-api-key"
              />
            </div>
            
            <div>
              <Label htmlFor="sheet-id">시트 ID</Label>
              <Input
                id="sheet-id"
                placeholder="구글 시트 URL의 ID 부분"
                value={sheetId}
                onChange={(e) => setSheetId(e.target.value)}
                data-testid="input-sheet-id"
              />
              <p className="text-xs text-gray-500 mt-1">
                예: https://docs.google.com/spreadsheets/d/<strong>시트ID</strong>/edit
              </p>
            </div>
            
            <div>
              <Label htmlFor="sheet-name">시트 이름</Label>
              <Input
                id="sheet-name"
                placeholder="Sheet1"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                data-testid="input-sheet-name"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsSettingsOpen(false)}
              data-testid="button-cancel-settings"
            >
              취소
            </Button>
            <Button 
              onClick={handleSaveSettings}
              className="bg-primary hover:bg-blue-600"
              data-testid="button-save-settings"
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
