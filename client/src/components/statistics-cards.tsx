import { useQuery } from "@tanstack/react-query";
import { Palette, IceCream, Ruler, Layers, Cake, TrendingUp } from "lucide-react";
import { getStatistics } from "@/lib/google-sheets";
import { Statistics } from "@/types/order";

interface StatisticsCardsProps {
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
}

export default function StatisticsCards({ dateRange }: StatisticsCardsProps) {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/statistics", dateRange.startDate, dateRange.endDate],
    queryFn: () => getStatistics(dateRange.startDate || undefined, dateRange.endDate || undefined),
    enabled: Boolean(dateRange.startDate),
    staleTime: 0, // 캐시를 즉시 만료시킴
    cacheTime: 0, // 캐시 시간을 0으로 설정
  });

  if (!dateRange.startDate) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  const renderStatSection = (
    title: string,
    icon: any,
    data: Record<string, number>,
    color: string,
    testId: string
  ) => {
    const maxCount = Math.max(...Object.values(data));
    const entries = Object.entries(data).sort(([,a], [,b]) => b - a);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid={testId}>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          {icon}
          {title}
        </h3>
        <div className="space-y-3">
          {entries.map(([item, count]) => (
            <div key={item} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{item}</span>
              <div className="flex items-center">
                <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className={`${color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}개</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getDaysBetweenDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const avgOrdersPerDay = statistics.totalOrders > 0 
    ? (statistics.totalOrders / getDaysBetweenDates(dateRange.startDate, dateRange.endDate)).toFixed(1)
    : "0";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Design Stats */}
      {renderStatSection(
        "디자인별 주문 수",
        <Palette className="text-primary mr-2" size={20} />,
        statistics.designCounts,
        "bg-primary",
        "card-design-stats"
      )}

      {/* Flavor Stats */}
      {renderStatSection(
        "맛별 주문 수",
        <IceCream className="text-primary mr-2" size={20} />,
        statistics.flavorCounts,
        "bg-green-500",
        "card-flavor-stats"
      )}

      {/* Size Stats */}
      {renderStatSection(
        "사이즈별 주문 수",
        <Ruler className="text-primary mr-2" size={20} />,
        statistics.sizeCounts,
        "bg-purple-500",
        "card-size-stats"
      )}

      {/* Sheet Stats */}
      {renderStatSection(
        "시트별 주문 수",
        <Layers className="text-primary mr-2" size={20} />,
        statistics.sheetCounts,
        "bg-yellow-500",
        "card-sheet-stats"
      )}

      {/* Cream Stats */}
      {renderStatSection(
        "크림별 주문 수",
        <Cake className="text-primary mr-2" size={20} />,
        statistics.creamCounts,
        "bg-red-500",
        "card-cream-stats"
      )}

      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" data-testid="card-summary-stats">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="text-primary mr-2" size={20} />
          기간 요약
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">총 주문 건수</span>
            <span className="text-lg font-semibold text-gray-900" data-testid="text-total-orders">
              {statistics.totalOrders}건
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">일평균 주문</span>
            <span className="text-lg font-semibold text-gray-900" data-testid="text-avg-orders">
              {avgOrdersPerDay}건
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">인기 디자인</span>
            <span className="text-sm font-medium text-primary" data-testid="text-popular-design">
              {statistics.popularDesign || "N/A"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">인기 사이즈</span>
            <span className="text-sm font-medium text-primary" data-testid="text-popular-size">
              {statistics.popularSize || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
