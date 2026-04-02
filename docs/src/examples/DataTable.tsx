import { useState, useMemo } from 'react'

type SortDirection = 'asc' | 'desc'

interface Row {
  name: string
  role: string
  status: 'Active' | 'Inactive' | 'Pending'
  score: number
}

const INITIAL_DATA: Row[] = [
  { name: 'Alice Martin',   role: 'Engineer',        status: 'Active',   score: 92 },
  { name: 'Bob Chen',       role: 'Designer',        status: 'Active',   score: 88 },
  { name: 'Carol Rivera',   role: 'Product Manager', status: 'Pending',  score: 74 },
  { name: 'David Kim',      role: 'Engineer',        status: 'Inactive', score: 61 },
  { name: 'Eva Johansson',  role: 'Data Analyst',    status: 'Active',   score: 95 },
  { name: 'Frank Okafor',   role: 'DevOps',          status: 'Active',   score: 83 },
  { name: 'Grace Patel',    role: 'Designer',        status: 'Pending',  score: 70 },
  { name: 'Henry Souza',    role: 'Engineer',        status: 'Inactive', score: 55 },
  { name: 'Iris Tanaka',    role: 'Product Manager', status: 'Active',   score: 89 },
  { name: 'James O\'Brien', role: 'Data Analyst',    status: 'Active',   score: 77 },
]

type ColumnKey = keyof Row

const COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: 'name',   label: 'Name'   },
  { key: 'role',   label: 'Role'   },
  { key: 'status', label: 'Status' },
  { key: 'score',  label: 'Score'  },
]

const STATUS_COLORS: Record<Row['status'], string> = {
  Active:   '#d1fae5',
  Inactive: '#fee2e2',
  Pending:  '#fef9c3',
}

const STATUS_TEXT_COLORS: Record<Row['status'], string> = {
  Active:   '#065f46',
  Inactive: '#991b1b',
  Pending:  '#854d0e',
}

export function DataTable() {
  const [sortKey, setSortKey] = useState<ColumnKey>('name')
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const sorted = useMemo(() => {
    return [...INITIAL_DATA].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      let cmp = 0
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv
      } else {
        cmp = String(av).localeCompare(String(bv))
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [sortKey, sortDir])

  function handleHeaderClick(key: ColumnKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', background: '#fff' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ background: '#f8fafc' }}>
            {COLUMNS.map(col => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col.key)}
                style={{
                  padding: '12px 16px',
                  textAlign: col.key === 'score' ? 'right' : 'left',
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                  userSelect: 'none',
                  borderBottom: '2px solid #e5e7eb',
                  whiteSpace: 'nowrap',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                  fontSize: 12,
                }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>
                    {sortDir === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isEven = i % 2 === 0
            const isHovered = hoveredRow === i
            return (
              <tr
                key={row.name}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  background: isHovered
                    ? '#eff6ff'
                    : isEven
                    ? '#ffffff'
                    : '#f9fafb',
                  transition: 'background 0.12s',
                }}
              >
                <td style={{ padding: '11px 16px', color: '#111827', fontWeight: 500, borderBottom: '1px solid #f3f4f6' }}>
                  {row.name}
                </td>
                <td style={{ padding: '11px 16px', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>
                  {row.role}
                </td>
                <td style={{ padding: '11px 16px', borderBottom: '1px solid #f3f4f6' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: STATUS_COLORS[row.status],
                      color: STATUS_TEXT_COLORS[row.status],
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td
                  style={{
                    padding: '11px 16px',
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    fontWeight: 600,
                    color: row.score >= 85 ? '#059669' : row.score >= 70 ? '#d97706' : '#dc2626',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  {row.score}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
