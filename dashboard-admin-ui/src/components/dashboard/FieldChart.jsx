import { Box, ArrowRight } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import SectionHeading from './SectionHeading'

export default function FieldChart({ data }) {
  return (
    <article className="dashboard-card field-card">
      <SectionHeading
        icon={Box}
        iconColor="#0877ed"
        title="Hồ sơ theo lĩnh vực"
        subtitle="Top 5 lĩnh vực có số lượng hồ sơ nhiều nhất"
      />

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-slate-500">
          Chưa có dữ liệu lĩnh vực.
        </div>
      ) : (
        <div className="field-chart relative">
          {/* BAR CHART */}
          <div className="absolute inset-0 pt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{
                  top: 0,
                  right: 44,
                  left: 3,
                  bottom: 0,
                }}
                barCategoryGap={14}
              >
                <XAxis type="number" hide />

                <YAxis
                  type="category"
                  dataKey="name"
                  hide
                />

                <Tooltip
                  cursor={{
                    fill: '#f6f9fd',
                  }}
                />

                <Bar
                  dataKey="value"
                  radius={[0, 5, 5, 0]}
                  barSize={5}
                >
                  {data.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* LABEL + VALUE */}
          <div
            className="pointer-events-none absolute inset-0 grid px-[3px]"
            style={{
              gridTemplateRows: `repeat(${data.length}, minmax(0, 1fr))`,
            }}
          >
            {data.map((field) => (
              <div
                key={field.name}
                className="flex items-start"
              >
                <div className="flex w-full items-center justify-between gap-3 text-xs">
                  <span
                    className="
                      pointer-events-auto
                      min-w-0
                      flex-1
                      truncate
                      text-[#263f67]
                    "
                    title={field.name}
                  >
                    {field.name}
                  </span>

                  <span
                    className="
                      shrink-0
                      text-right
                      font-semibold
                      text-[#0c1f3d]
                    "
                  >
                    {field.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="detail-link"
      >
        Xem chi tiết
        <ArrowRight size={16} />
      </button>
    </article>
  )
}