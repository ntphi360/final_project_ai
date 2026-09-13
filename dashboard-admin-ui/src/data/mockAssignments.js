export const assignmentOfficers = [
  { id: 'CB001', name: 'Nguyễn Văn B', department: 'Phòng Tài nguyên và Môi trường' },
  { id: 'CB002', name: 'Trần Thị B', department: 'Phòng Kinh tế - Hạ tầng' },
  { id: 'CB003', name: 'Lê Văn C', department: 'Phòng Quản lý đô thị' },
  { id: 'CB004', name: 'Phạm Thị D', department: 'Phòng Tư pháp - Hộ tịch' },
  { id: 'CB005', name: 'Vũ Thị H', department: 'Phòng Văn hóa - Xã hội' },
  { id: 'CB006', name: 'Đỗ Văn G', department: 'Phòng Giao thông vận tải' },
]

const defaultContent = 'Đề nghị Anh/Chị xử lý hồ sơ được giao theo đúng quy định, bảo đảm hoàn thành trước hạn.'

export const initialAssignments = [
  {
    id: 'GV0001', caseCode: 'HS000123', procedureName: 'Cấp giấy chứng nhận quyền sử dụng đất', fieldName: 'Đất đai', departmentName: 'Phòng Tài nguyên và Môi trường', assignerName: 'Nguyễn Văn A', assigneeName: 'Trần Thị B', assignedAt: '2026-09-13T09:45:00', title: 'Xử lý hồ sơ đất đai đúng hạn', content: defaultContent, notificationChannels: ['EMAIL', 'SMS'], status: 'PENDING', acceptedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0002', caseCode: 'HS000124', procedureName: 'Đăng ký thành lập hộ kinh doanh', fieldName: 'Kinh doanh', departmentName: 'Phòng Kinh tế - Hạ tầng', assignerName: 'Nguyễn Văn A', assigneeName: 'Trần Thị B', assignedAt: '2026-09-12T16:20:00', title: 'Thẩm tra hồ sơ đăng ký kinh doanh', content: defaultContent, notificationChannels: ['EMAIL'], status: 'ACCEPTED', acceptedAt: '2026-09-12T16:35:00', rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0003', caseCode: 'HS000125', procedureName: 'Cấp phép xây dựng nhà ở riêng lẻ', fieldName: 'Xây dựng', departmentName: 'Phòng Quản lý đô thị', assignerName: 'Trần Thị C', assigneeName: 'Lê Văn C', assignedAt: '2026-09-11T10:15:00', title: 'Kiểm tra hồ sơ cấp phép xây dựng', content: defaultContent, notificationChannels: ['SMS'], status: 'REJECTED', acceptedAt: null, rejectedAt: '2026-09-11T11:00:00', rejectionReason: 'Hiện đang có quá nhiều hồ sơ cần xử lý.',
  },
  {
    id: 'GV0004', caseCode: 'HS000126', procedureName: 'Cấp bản sao Trích lục hộ tịch', fieldName: 'Hộ tịch', departmentName: 'Phòng Tư pháp - Hộ tịch', assignerName: 'Nguyễn Văn A', assigneeName: 'Phạm Thị D', assignedAt: '2026-09-10T14:30:00', title: 'Xử lý yêu cầu trích lục hộ tịch', content: defaultContent, notificationChannels: ['EMAIL', 'SMS'], status: 'ACCEPTED', acceptedAt: '2026-09-10T14:45:00', rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0005', caseCode: 'HS000127', procedureName: 'Thủ tục cấp Giấy xác nhận tình trạng hôn nhân', fieldName: 'Hộ tịch', departmentName: 'Phòng Tư pháp - Hộ tịch', assignerName: 'Lê Văn D', assigneeName: 'Hoàng Văn E', assignedAt: '2026-09-09T08:10:00', title: 'Xác minh tình trạng hôn nhân', content: defaultContent, notificationChannels: ['EMAIL'], status: 'ACCEPTED', acceptedAt: '2026-09-09T08:25:00', rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0006', caseCode: 'HS000128', procedureName: 'Cấp lại căn cước công dân', fieldName: 'Công dân', departmentName: 'Công an', assignerName: 'Nguyễn Văn A', assigneeName: 'Nguyễn Thị F', assignedAt: '2026-09-08T13:20:00', title: 'Tiếp nhận hồ sơ cấp lại căn cước', content: defaultContent, notificationChannels: ['SMS'], status: 'PENDING', acceptedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0007', caseCode: 'HS000129', procedureName: 'Cấp đổi giấy phép lái xe', fieldName: 'Giao thông', departmentName: 'Phòng Giao thông vận tải', assignerName: 'Phạm Minh K', assigneeName: 'Đỗ Văn G', assignedAt: '2026-09-07T09:05:00', title: 'Kiểm tra hồ sơ đổi giấy phép lái xe', content: defaultContent, notificationChannels: ['EMAIL'], status: 'ACCEPTED', acceptedAt: '2026-09-07T09:18:00', rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0008', caseCode: 'HS000130', procedureName: 'Đăng ký tạm trú', fieldName: 'Cư trú', departmentName: 'Công an', assignerName: 'Nguyễn Văn A', assigneeName: 'Vũ Thị H', assignedAt: '2026-09-06T15:40:00', title: 'Xử lý đăng ký tạm trú', content: defaultContent, notificationChannels: ['EMAIL', 'SMS'], status: 'PENDING', acceptedAt: null, rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0009', caseCode: 'HS000131', procedureName: 'Cấp giấy phép môi trường', fieldName: 'Môi trường', departmentName: 'Phòng Tài nguyên và Môi trường', assignerName: 'Trần Thị C', assigneeName: 'Bùi Văn I', assignedAt: '2026-09-05T10:05:00', title: 'Thẩm định hồ sơ môi trường', content: defaultContent, notificationChannels: ['EMAIL'], status: 'ACCEPTED', acceptedAt: '2026-09-05T10:30:00', rejectedAt: null, rejectionReason: null,
  },
  {
    id: 'GV0010', caseCode: 'HS000132', procedureName: 'Thẩm định thiết kế phòng cháy chữa cháy', fieldName: 'Xây dựng', departmentName: 'Phòng Quản lý đô thị', assignerName: 'Lê Văn D', assigneeName: 'Trần Văn K', assignedAt: '2026-09-04T08:30:00', title: 'Thẩm định hồ sơ phòng cháy chữa cháy', content: defaultContent, notificationChannels: ['SMS'], status: 'ACCEPTED', acceptedAt: '2026-09-04T08:50:00', rejectedAt: null, rejectionReason: null,
  },
]

export function createMockAssignments(cases, officer, form) {
  const assignedAt = new Date().toISOString()
  const channels = [
    ...(form.email ? ['Email'] : []),
    ...(form.sms ? ['SMS'] : []),
  ]

  return cases.map((item, index) => ({
    id: `GV-${Date.now()}-${index + 1}`,
    caseCode: item.id,
    procedureName: item.procedure,
    fieldName: item.field,
    departmentName: item.department,
    assignerName: 'Nguyễn Văn A',
    assigneeId: officer.id,
    assigneeName: officer.name,
    assigneeDepartment: officer.department,
    title: form.title.trim(),
    content: form.content.trim(),
    notificationChannels: channels.map((channel) => channel.toUpperCase()),
    status: 'PENDING',
    assignedAt,
    acceptedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    notificationMessage: `Bạn vừa được giao xử lý hồ sơ ${item.id}. Vui lòng xem chi tiết và phản hồi.`,
  }))
}
