export const currentUserId = 1

export const departments = [
  'Phòng Kinh tế, hạ tầng và đô thị',
  'Phòng Tài nguyên và Môi trường',
  'Phòng Tư pháp - Hộ tịch',
  'Phòng Giáo dục và Đào tạo',
  'Phòng Lao động - Thương binh và Xã hội',
  'Công an',
]

export const roleOptions = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'SUPERVISOR', label: 'Quản lý' },
  { value: 'OFFICER', label: 'Cán bộ xử lý' },
  { value: 'VIEWER', label: 'Chỉ xem' },
]

export const roleLabels = Object.fromEntries(roleOptions.map((item) => [item.value, item.label]))

export const initialUsers = [
  { id: 1, fullName: 'Nguyễn Văn A', email: 'admin@example.com', phoneNumber: '0901234567', role: 'ADMIN', departmentName: null, isActive: true, createdAt: '2026-09-01T08:00:00', updatedAt: '2026-09-12T09:30:00' },
  { id: 2, fullName: 'Trần Thị B', email: 'tranthib@example.com', phoneNumber: '0902222333', role: 'OFFICER', departmentName: 'Phòng Kinh tế, hạ tầng và đô thị', isActive: true, createdAt: '2026-09-02T09:00:00', updatedAt: '2026-09-11T14:20:00' },
  { id: 3, fullName: 'Lê Văn C', email: 'levanc@example.com', phoneNumber: '0913333444', role: 'OFFICER', departmentName: 'Phòng Tư pháp - Hộ tịch', isActive: true, createdAt: '2026-09-02T10:15:00', updatedAt: '2026-09-10T08:45:00' },
  { id: 4, fullName: 'Phạm Thị D', email: 'phamthid@example.com', phoneNumber: '0924444555', role: 'SUPERVISOR', departmentName: 'Phòng Tài nguyên và Môi trường', isActive: true, createdAt: '2026-09-03T08:30:00', updatedAt: '2026-09-09T16:10:00' },
  { id: 5, fullName: 'Hoàng Văn E', email: 'hoangvane@example.com', phoneNumber: '0935555666', role: 'VIEWER', departmentName: null, isActive: false, createdAt: '2026-09-03T13:20:00', updatedAt: '2026-09-08T11:40:00' },
  { id: 6, fullName: 'Nguyễn Thị F', email: 'nguyenthif@example.com', phoneNumber: '0946666777', role: 'OFFICER', departmentName: 'Công an', isActive: true, createdAt: '2026-09-04T09:45:00', updatedAt: '2026-09-07T15:05:00' },
  { id: 7, fullName: 'Đỗ Văn G', email: 'dovang@example.com', phoneNumber: '0957777888', role: 'OFFICER', departmentName: 'Phòng Kinh tế, hạ tầng và đô thị', isActive: false, createdAt: '2026-09-05T07:50:00', updatedAt: '2026-09-07T10:25:00' },
  { id: 8, fullName: 'Vũ Thị H', email: 'vuthih@example.com', phoneNumber: '0968888999', role: 'SUPERVISOR', departmentName: 'Phòng Giáo dục và Đào tạo', isActive: true, createdAt: '2026-09-05T14:10:00', updatedAt: '2026-09-06T09:15:00' },
  { id: 9, fullName: 'Bùi Văn I', email: 'buivani@example.com', phoneNumber: '0979999000', role: 'OFFICER', departmentName: 'Phòng Lao động - Thương binh và Xã hội', isActive: true, createdAt: '2026-09-06T08:20:00', updatedAt: '2026-09-06T16:30:00' },
  { id: 10, fullName: 'Trần Văn K', email: 'tranvank@example.com', phoneNumber: '0981111222', role: 'VIEWER', departmentName: 'Phòng Tư pháp - Hộ tịch', isActive: true, createdAt: '2026-09-07T10:00:00', updatedAt: '2026-09-07T10:00:00' },
  { id: 11, fullName: 'Lương Thị L', email: 'luongthil@example.com', phoneNumber: '0982222333', role: 'OFFICER', departmentName: 'Phòng Tài nguyên và Môi trường', isActive: true, createdAt: '2026-09-08T11:30:00', updatedAt: '2026-09-10T13:45:00' },
  { id: 12, fullName: 'Mai Văn M', email: 'maivanm@example.com', phoneNumber: '0983333444', role: 'ADMIN', departmentName: null, isActive: false, createdAt: '2026-09-09T15:20:00', updatedAt: '2026-09-11T08:10:00' },
]

export function formatUserDate(value, includeTime = false) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('vi-VN', includeTime ? {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  } : {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value))
}

export function getInitials(fullName) {
  return fullName.split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join('').toUpperCase()
}
