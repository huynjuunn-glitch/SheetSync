import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/order";

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
}: OrderDetailModalProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-order-detail">
        <DialogHeader>
          <DialogTitle>주문 상세 정보</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
              <p className="text-sm text-gray-900" data-testid="text-customer-name">
                {order.customerName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">디자인</label>
              <p className="text-sm text-gray-900" data-testid="text-design">
                {order.design}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주문일자</label>
              <p className="text-sm text-gray-900" data-testid="text-order-date">
                {formatDate(order.orderDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">픽업일자</label>
              <p className="text-sm text-gray-900" data-testid="text-pickup-date">
                {formatDate(order.pickupDate)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주문경로</label>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChannelBadgeClass(order.orderChannel)}`} data-testid="badge-order-channel">
                {order.orderChannel}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">맛 선택</label>
              <p className="text-sm text-gray-900" data-testid="text-flavor">
                {order.flavor}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시트</label>
              <p className="text-sm text-gray-900" data-testid="text-sheet">
                {order.sheet}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사이즈</label>
              <p className="text-sm text-gray-900" data-testid="text-size">
                {order.size}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">크림</label>
              <p className="text-sm text-gray-900" data-testid="text-cream">
                {order.cream}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {order.requests && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">요청사항</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg" data-testid="text-requests">
                {order.requests}
              </p>
            </div>
          )}
          {order.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
              <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg" data-testid="text-notes">
                {order.notes}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
            data-testid="button-close-modal"
          >
            닫기
          </Button>
          <Button 
            className="bg-primary hover:bg-blue-600"
            data-testid="button-edit-order"
          >
            수정하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
