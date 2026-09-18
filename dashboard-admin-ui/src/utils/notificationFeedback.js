const notificationChannels = [
    {key: 'email', label: 'Email'},
    {key: 'sms', label: 'SMS'},
]

function formatDeliveryStatus(selected, delivery) {
    if (!selected) return 'Không chọn'
    if (delivery?.status === 'SENT') return 'Đã gửi'
    if (delivery?.status === 'FAILED') return 'Gửi thất bại'
    if (delivery?.status === 'NO_RECIPIENT') return 'Không có người nhận'
    if (delivery?.success === true) return 'Đã gửi'
    if (delivery?.success === false) return 'Gửi thất bại'
    return 'Chưa có kết quả'
}

export function formatSingleNotificationFeedback(title, channels, notification = {}) {
    if (!channels.email && !channels.sms) {
        return `${title}\nKhông có kênh thông báo nào được chọn.`
    }

    const channelLines = notificationChannels.map(({key, label}) => (
        `${label}: ${formatDeliveryStatus(Boolean(channels[key]), notification[key])}`
    ))
    return [title, ...channelLines].join('\n')
}

export function formatBulkNotificationFeedback({
    title,
    successCount,
    notConfirmedCount = null,
    skippedCount,
    failedCount = 0,
    channels,
    notifications = [],
}) {
    const lines = [
        `${title}:`,
        `- Thành công: ${successCount} hồ sơ`,
    ]

    if (notConfirmedCount != null) {
        lines.push(`- Không xác nhận: ${notConfirmedCount} hồ sơ`)
    } else {
        lines.push(`- Bỏ qua: ${skippedCount} hồ sơ`)
        if (failedCount > 0) {
            lines.push(`- Thất bại: ${failedCount} hồ sơ`)
        }
    }

    if (!channels.email && !channels.sms) {
        lines.push('- Không có kênh thông báo nào được chọn.')
        return lines.join('\n')
    }

    for (const {key, label} of notificationChannels) {
        if (!channels[key]) {
            lines.push(`- ${label}: Không chọn`)
            continue
        }
        const deliveries = notifications
            .map((item) => item?.[key])
            .filter(Boolean)
        const sentCount = deliveries.filter((delivery) => (
            delivery.status === 'SENT' || delivery.success === true
        )).length
        const noRecipientCount = deliveries.filter((delivery) => (
            delivery.status === 'NO_RECIPIENT'
        )).length
        const failedDeliveryCount = deliveries.filter((delivery) => (
            delivery.status === 'FAILED'
            || (delivery.status == null && delivery.success === false)
        )).length
        const summary = [
            `${sentCount} đã gửi`,
            `${failedDeliveryCount} thất bại`,
        ]
        if (noRecipientCount > 0) {
            summary.push(`${noRecipientCount} không có người nhận`)
        }
        lines.push(`- ${label}: ${summary.join(', ')}`)
    }

    return lines.join('\n')
}
