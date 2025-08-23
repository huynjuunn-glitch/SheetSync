import { Cake, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Cake className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">케이크 주문 관리</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">관리자</span>
            <button className="text-gray-400 hover:text-gray-600">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
