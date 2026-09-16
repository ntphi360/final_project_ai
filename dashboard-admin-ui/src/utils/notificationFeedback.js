const notificationChannels = [
    {key: 'email', label: 'Email'},
    {key: 'sms', label: 'SMS'},
]

function formatDeliveryStatus(selected, delivery) {
    if (!selected) return 'Không chọn'
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
    skippedCount,
    failedCount = 0,
    channels,
    notifications = [],
}) {
    const lines = [
        `${title}:`,
        `- Thành công: ${successCount} hồ sơ`,
        `- Bỏ qua: ${skippedCount} hồ sơ`,
    ]

    if (failedCount > 0) {
        lines.push(`- Thất bại: ${failedCount} hồ sơ`)
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
        const sentCount = notifications.filter((item) => item?.[key]?.success === true).length
        const failedDeliveryCount = Math.max(successCount - sentCount, 0)
        lines.push(`- ${label}: ${sentCount} đã gửi, ${failedDeliveryCount} thất bại`)
    }

    return lines.join('\n')
}
