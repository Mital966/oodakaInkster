import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const STATUS_META = {
  NEW: { color: '#f59e0b' },
  CONTACTED: { color: '#3b82f6' },
  CONSULTATION: { color: '#8b5cf6' },
  BOOKED: { color: '#10b981' },
  COMPLETED: { color: '#a3a3a3' },
  CANCELLED: { color: '#ef4444' },
}

const ORDER = ['NEW', 'CONTACTED', 'CONSULTATION', 'BOOKED', 'COMPLETED', 'CANCELLED']

// Bar chart of enquiries grouped by pipeline status.
function EnquiriesStatusChart({ enquiries }) {
  const data = ORDER.map((status) => ({
    status,
    count: enquiries.filter((e) => e.status === status).length,
    color: STATUS_META[status].color,
  })).filter((d) => d.count > 0)

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-neutral-400">
        No enquiries yet.
      </div>
    )
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
          <XAxis
            dataKey="status"
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={{ stroke: '#e5e5e5' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#737373' }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            cursor={{ fill: '#fafafa' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e5e5e5',
              fontSize: 12,
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          />
          <Bar dataKey="count" name="Enquiries" radius={[4, 4, 0, 0]} maxBarSize={44}>
            {data.map((d) => (
              <Cell key={d.status} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default EnquiriesStatusChart