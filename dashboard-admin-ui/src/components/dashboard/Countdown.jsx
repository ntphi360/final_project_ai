import { useEffect, useMemo, useState } from 'react'

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, totalSeconds)
  const days = Math.floor(safeSeconds / 86400)
  const hours = Math.floor((safeSeconds % 86400) / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return {
    days,
    time: [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':'),
  }
}

export default function Countdown({ seconds, level }) {
  const deadline = useMemo(() => Date.now() + seconds * 1000, [seconds])
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    const update = () => setRemaining(Math.max(0, Math.floor((deadline - Date.now()) / 1000)))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [deadline])

  const { days, time } = formatTime(remaining)
  const colorClass = level === 'Thấp' ? 'safe' : level === 'Trung bình' ? 'warning' : 'danger'

  return (
    <span className={`countdown ${colorClass}`}>
      {days > 0 && <b>{days} ngày</b>}
      <strong>{time}</strong>
    </span>
  )
}
