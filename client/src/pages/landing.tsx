import { Button } from "@/components/ui/button";
import { Cake } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <Cake className="text-primary text-6xl mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">케이크 주문 관리</h1>
            </div>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
              구글 시트와 연동하여 케이크 주문을 효율적으로 관리하고 분석할 수 있는 웹 애플리케이션입니다.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-primary hover:bg-blue-600 text-white px-8 py-3 text-lg"
                data-testid="button-login"
              >
                로그인하기
              </Button>
              
              <p className="text-sm text-gray-500">
                로그인하여 개인화된 구글 시트 설정을 저장하고 주문 데이터를 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}