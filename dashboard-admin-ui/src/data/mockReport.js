export const reportSummary = [
  { id: 'total', label: 'Tổng hồ sơ', value: 1248, change: 12, direction: 'up', tone: 'blue' },
  { id: 'processing', label: 'Đang xử lý', value: 130, change: 8, direction: 'up', tone: 'amber' },
  { id: 'completed', label: 'Đã hoàn thành', value: 1050, change: 15, direction: 'up', tone: 'emerald' },
  { id: 'risk', label: 'Nguy cơ trễ hạn', value: 68, change: 20, direction: 'up', tone: 'red' },
  { id: 'waiting', label: 'Chờ xác nhận', value: 42, change: 5, direction: 'down', tone: 'violet' },
  { id: 'confirmed', label: 'Đã xác nhận', value: 1008, change: 14, direction: 'up', tone: 'cyan' },
]

export const trendData = [
  { month: 'T1', received: 68, completed: 52 }, { month: 'T2', received: 83, completed: 65 },
  { month: 'T3', received: 101, completed: 80 }, { month: 'T4', received: 116, completed: 94 },
  { month: 'T5', received: 103, completed: 88 }, { month: 'T6', received: 108, completed: 91 },
  { month: 'T7', received: 137, completed: 115 }, { month: 'T8', received: 129, completed: 109 },
  { month: 'T9', received: 118, completed: 101 }, { month: 'T10', received: 146, completed: 121 },
  { month: 'T11', received: 138, completed: 110 }, { month: 'T12', received: 140, completed: 109 },
]

export const statusData = [
  { name: 'Đang xử lý', value: 130, color: '#1677ff', dotClass: 'bg-blue-500' },
  { name: 'Chờ xác nhận', value: 42, color: '#f59e0b', dotClass: 'bg-amber-500' },
  { name: 'Đã xác nhận', value: 1008, color: '#22c55e', dotClass: 'bg-green-500' },
  { name: 'Đã hoàn thành', value: 68, color: '#8b5cf6', dotClass: 'bg-violet-500' },
]

export const riskData = [
  { name: 'Rất cao', value: 16, color: '#ef4444' },
  { name: 'Cao', value: 24, color: '#f97316' },
  { name: 'Trung bình', value: 38, color: '#eab308' },
  { name: 'Thấp', value: 52, color: '#22c55e' },
]

export const fieldData = [
  { name: 'Đất đai', value: 320 }, { name: 'Hộ tịch', value: 210 },
  { name: 'Chứng thực', value: 180 }, { name: 'Tư pháp', value: 150 },
  { name: 'Giáo dục', value: 128 }, { name: 'Bảo trợ xã hội', value: 98 },
  { name: 'Xây dựng', value: 85 }, { name: 'Hộ kinh doanh', value: 77 },
]

export const departmentData = [
  { name: 'Phòng Kinh tế, hạ tầng và đô thị', total: 320, processing: 42, completed: 260, risk: 18, rate: 81 },
  { name: 'Phòng Tư pháp', total: 270, processing: 28, completed: 230, risk: 12, rate: 85 },
  { name: 'Phòng Tài nguyên và Môi trường', total: 180, processing: 25, completed: 140, risk: 15, rate: 78 },
  { name: 'Phòng Giáo dục và Đào tạo', total: 150, processing: 18, completed: 122, risk: 10, rate: 81 },
  { name: 'Phòng Lao động - TBXH', total: 170, processing: 20, completed: 140, risk: 10, rate: 82 },
  { name: 'Công an', total: 158, processing: 17, completed: 138, risk: 3, rate: 87 },
]

export const officerData = [
  { name: 'Trần Thị B', department: 'Kinh tế - Hạ tầng', processing: 28, completed: 176, risk: 18, total: 222 },
  { name: 'Lê Văn C', department: 'Tư pháp', processing: 22, completed: 154, risk: 6, total: 182 },
  { name: 'Nguyễn Thị D', department: 'TN&MT', processing: 18, completed: 120, risk: 5, total: 143 },
  { name: 'Phạm Văn E', department: 'Giáo dục', processing: 15, completed: 98, risk: 4, total: 117 },
  { name: 'Hoàng Văn F', department: 'LĐ-TBXH', processing: 12, completed: 86, risk: 3, total: 101 },
]

export const reportFilterOptions = {
  fields: ['Đất đai', 'Hộ tịch', 'Chứng thực', 'Tư pháp', 'Giáo dục', 'Xây dựng'],
  departments: departmentData.map((item) => item.name),
  officers: officerData.map((item) => item.name),
}
