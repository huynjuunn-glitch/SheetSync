import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncGoogleSheets } from "@/lib/google-sheets";
import { useToast } from "@/hooks/use-toast";

interface DateRangeSelectorProps {
  selectedDateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  onDateRangeChange: (dateRange: {
    startDate: string | null;
    endDate: string | null;
  }) => void;
}

export default function DateRangeSelector({
  selectedDateRange,
  onDateRangeChange,
}: DateRangeSelectorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: syncGoogleSheets,
    onSuccess: () => {
      // 모든 관련 쿼리 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      
      // 강제로 새로고침
      queryClient.refetchQueries({ queryKey: ["/api/orders"] });
      queryClient.refetchQueries({ queryKey: ["/api/statistics"] });
      
      toast({
        title: "데이터 동기화 완료",
        description: "Google Sheets에서 최신 데이터를 가져왔습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "동기화 실패",
        description: "Google Sheets 데이터를 가져오는데 실패했습니다.",
        variant: "destructive",
      });
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's trailing days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i),
      });
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: day,
        isCurrentMonth: true,
        fullDate: new Date(year, month, day),
      });
    }

    // Add next month's leading days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, day),
      });
    }

    return days;
  };

  const formatDateToString = (date: Date) => {
    // 로컬 타임존을 고려한 날짜 형식 변환
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateString: string) => {
    // YYYY-MM-DD 형식을 YYYY.MM.DD 형식으로 직접 변환
    const [year, month, day] = dateString.split('-');
    return `${year}.${month}.${day}`;
  };

  const handleDateClick = (date: Date) => {
    const dateString = formatDateToString(date);
    
    if (!tempStartDate) {
      // First click - reset any existing range and set start date
      onDateRangeChange({ startDate: null, endDate: null });
      setTempStartDate(dateString);
      // 첫 번째 클릭 시 바로 시작 날짜 표시
      onDateRangeChange({ startDate: dateString, endDate: null });
    } else {
      // Second click - set end date and complete selection
      const startDate = tempStartDate;
      const endDate = dateString;
      
      if (startDate <= endDate) {
        onDateRangeChange({ startDate, endDate });
      } else {
        onDateRangeChange({ startDate: endDate, endDate: startDate });
      }
      
      setTempStartDate(null);
    }
  };

  const isDateInRange = (date: Date) => {
    const dateString = formatDateToString(date);
    const { startDate, endDate } = selectedDateRange;
    
    if (!startDate || !endDate) return false;
    return dateString >= startDate && dateString <= endDate;
  };

  const isDateSelected = (date: Date) => {
    const dateString = formatDateToString(date);
    const { startDate, endDate } = selectedDateRange;
    
    return dateString === startDate || dateString === endDate || dateString === tempStartDate;
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });

  const getDaysBetweenDates = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">날짜 선택</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="calendar-container">
            <div className="calendar-header flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
                data-testid="button-prev-month"
              >
                <ChevronLeft className="text-gray-600" size={20} />
              </button>
              <h3 className="text-lg font-medium text-gray-900">{monthName}</h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 hover:bg-gray-100 rounded-lg"
                data-testid="button-next-month"
              >
                <ChevronRight className="text-gray-600" size={20} />
              </button>
            </div>
            <div className="calendar-grid">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isSelected = isDateSelected(day.fullDate);
                  const isInRange = isDateInRange(day.fullDate);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(day.fullDate)}
                      className={`
                        p-2 text-sm rounded transition-colors
                        ${!day.isCurrentMonth 
                          ? 'text-gray-400 hover:bg-gray-100' 
                          : 'text-gray-900 hover:bg-gray-100'
                        }
                        ${isSelected 
                          ? 'bg-primary text-white hover:bg-blue-600' 
                          : ''
                        }
                        ${isInRange && !isSelected 
                          ? 'bg-primary bg-opacity-50 text-white' 
                          : ''
                        }
                      `}
                      data-testid={`button-date-${formatDateToString(day.fullDate)}`}
                    >
                      {day.date}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">선택된 기간</h4>
            {selectedDateRange.startDate ? (
              <>
                <p className="text-sm text-blue-700" data-testid="text-selected-range">
                  {selectedDateRange.endDate 
                    ? `${formatDisplayDate(selectedDateRange.startDate)} - ${formatDisplayDate(selectedDateRange.endDate)}`
                    : `${formatDisplayDate(selectedDateRange.startDate)} (종료일 선택 중...)`
                  }
                </p>
                {selectedDateRange.endDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    총 {getDaysBetweenDates(selectedDateRange.startDate, selectedDateRange.endDate)}일 선택됨
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-blue-700">날짜를 선택해주세요</p>
            )}
          </div>
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="w-full bg-primary text-white hover:bg-blue-600"
            data-testid="button-sync-orders"
          >
            {syncMutation.isPending ? "동기화 중..." : "주문 조회"}
          </Button>
          <div className="text-xs text-gray-500">
            <p>• 첫 번째 클릭: 시작일</p>
            <p>• 두 번째 클릭: 종료일</p>
            <p>• 같은 날짜: 당일 조회</p>
          </div>
        </div>
      </div>
    </div>
  );
}
