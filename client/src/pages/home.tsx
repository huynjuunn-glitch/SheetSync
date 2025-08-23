import { useState } from "react";
import Header from "@/components/header";
import DateRangeSelector from "@/components/date-range-selector";
import OrdersList from "@/components/orders-list";
import StatisticsCards from "@/components/statistics-cards";
import OrderDetailModal from "@/components/order-detail-modal";
import { Order } from "@/types/order";

export default function Home() {
  const [selectedDateRange, setSelectedDateRange] = useState<{
    startDate: string | null;
    endDate: string | null;
  }>({
    startDate: null,
    endDate: null,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DateRangeSelector
          selectedDateRange={selectedDateRange}
          onDateRangeChange={setSelectedDateRange}
        />
        
        <OrdersList
          dateRange={selectedDateRange}
          onOrderSelect={handleOrderSelect}
        />
        
        <StatisticsCards dateRange={selectedDateRange} />
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
