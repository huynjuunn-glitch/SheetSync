import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getOrders } from "@/lib/google-sheets";
import { Order } from "@/types/order";

interface OrdersListProps {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  onOrderSelect: (order: Order) => void;
}

export default function OrdersList({ dateRange, onOrderSelect }: OrdersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", dateRange.startDate, dateRange.endDate],
    queryFn: () => getOrders(dateRange.startDate || undefined, dateRange.endDate || undefined),
    enabled: Boolean(dateRange.startDate && dateRange.endDate),
  });

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === "all" || order.orderChannel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  const getChannelBadgeClass = (channel: string) => {
    switch (channel) {
      case "네이버예약":
        return "bg-blue-100 text-blue-800";
      case "카카오톡":
        return "bg-green-100 text-green-800";
      case "매장방문":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  if (!dateRange.startDate || !dateRange.endDate) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">날짜를 선택하여 주문 내역을 조회하세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900">주문 내역</h2>
          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            <span className="text-sm text-gray-500" data-testid="text-order-count">
              총 {filteredOrders.length}건
            </span>
            <button className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Download size={16} className="mr-1" />
              내보내기
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="고객명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-full sm:w-48" data-testid="select-channel-filter">
              <SelectValue placeholder="주문경로 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 주문경로</SelectItem>
              <SelectItem value="네이버예약">네이버예약</SelectItem>
              <SelectItem value="카카오톡">카카오톡</SelectItem>
              <SelectItem value="매장방문">매장방문</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">주문 내역을 불러오는 중...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">선택된 기간에 주문 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">디자인</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">픽업일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">맛/사이즈</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">주문경로</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order: Order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onOrderSelect(order)}
                    data-testid={`row-order-${order.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.design}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.pickupDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.flavor}</div>
                      <div className="text-sm text-gray-500">{order.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChannelBadgeClass(order.orderChannel)}`}>
                        {order.orderChannel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredOrders.map((order: Order) => (
              <div
                key={order.id}
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onOrderSelect(order)}
                data-testid={`card-order-${order.id}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-900">{order.customerName}</div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChannelBadgeClass(order.orderChannel)}`}>
                    {order.orderChannel}
                  </span>
                </div>
                <div className="text-sm text-gray-900 mb-1">{order.design}</div>
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>주문: {formatDate(order.orderDate)}</span>
                  <span>픽업: {formatDate(order.pickupDate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span>{order.flavor}</span> • <span>{order.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
