import { useState, useEffect } from 'react';
import { Box, Typography, Tooltip, useTheme } from '@mui/material';
import { getMyActivity, getActivityByStudent } from '../services/api';

const CELL_SIZE = 12;
const GAP = 3;
const WEEKS = 53;
const DAYS = 7;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Utility to get Monday of the current week (or last Monday if today is Sunday, depending on preference)
// Here, we align so the last column is the current week.
function buildGrid() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Calculate days to subtract to get to Monday of this week
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - daysSinceMonday);

  const start = new Date(thisMonday);
  start.setDate(start.getDate() - (WEEKS - 1) * 7);

  const grid = [];
  for (let w = 0; w < WEEKS; w++) {
    const col = [];
    for (let d = 0; d < DAYS; d++) {
      const cellDate = new Date(start);
      cellDate.setDate(start.getDate() + w * 7 + d);
      col.push(getDateKey(cellDate));
    }
    grid.push(col);
  }
  return grid;
}

function getLevel(count, max) {
  if (!count || count <= 0) return 0;
  if (!max) return 1;
  if (count >= max) return 4;
  const pct = count / max;
  if (pct >= 0.75) return 4;
  if (pct >= 0.5) return 3;
  if (pct >= 0.25) return 2;
  return 1;
}

export default function ActivityHeatmap({ studentId }) {
  const theme = useTheme();
  const [data, setData] = useState({ days: [], totalActivity: 0, maxPerDay: 0 });
  const [loading, setLoading] = useState(true);
  const byDate = {};
  (data.days || []).forEach(({ date, count }) => { byDate[date] = count; });
  const grid = buildGrid();
  const max = data.maxPerDay || 1;

  useEffect(() => {
    const fetcher = studentId ? () => getActivityByStudent(studentId) : getMyActivity;
    fetcher()
      .then((res) => setData(res.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <Box sx={{ py: 2 }}><Typography color="text.secondary">Loading activity...</Typography></Box>;

  const levelColors = [
    theme.palette.action.hover,
    theme.palette.success.light || '#9ccc65',
    theme.palette.success.main || '#4caf50',
    theme.palette.success.dark || '#2e7d32',
  ];

  // Helper to render day labels
  const getDayLabel = (index) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[index] || '';
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {data.totalActivity ?? 0} submissions in the past year
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">Less</Typography>
          {[0, 1, 2, 3, 4].map((lvl) => (
            <Box
              key={lvl}
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: lvl === 0 ? levelColors[0] : levelColors[Math.min(lvl, 3)],
              }}
            />
          ))}
          <Typography variant="caption" color="text.secondary">More</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Header Row: Months */}
        <Box sx={{ display: 'flex', mb: 0.5 }}>
          {/* Spacer for Day Labels */}
          <Box sx={{ width: 30, flexShrink: 0 }} />
          {/* Month Labels aligned with Week Columns */}
          {grid.map((week, i) => {
            const dateStr = week[0];
            const date = new Date(dateStr);
            const prevWeekDate = i > 0 ? new Date(grid[i - 1][0]) : null;
            const isNewMonth = !prevWeekDate || date.getMonth() !== prevWeekDate.getMonth();
            return (
              <Box key={i} sx={{ flex: 1, overflow: 'hidden' }}>
                {isNewMonth && (
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: '0.7rem', lineHeight: 1 }}>
                    {MONTHS[date.getMonth()]}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Data Rows (0=Mon...6=Sun) */}
        {Array.from({ length: 7 }).map((_, rowIdx) => (
          <Box key={rowIdx} sx={{ display: 'flex', gap: '2px', mb: '2px', alignItems: 'center' }}>
            {/* Day Label */}
            <Box sx={{ width: 30, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1, fontSize: '0.7rem' }}>
                {getDayLabel(rowIdx)}
              </Typography>
            </Box>
            {/* Heatmap Cells for this Day across all Weeks */}
            {grid.map((week, colIdx) => {
              const dateKey = week[rowIdx];
              const count = byDate[dateKey] || 0;
              const level = getLevel(count, max);
              return (
                <Tooltip key={`${colIdx}-${rowIdx}`} title={`${dateKey}: ${count} submission${count !== 1 ? 's' : ''}`}>
                  <Box
                    sx={{
                      flex: 1,
                      aspectRatio: '1',
                      borderRadius: 0.5,
                      bgcolor: level === 0 ? levelColors[0] : levelColors[Math.min(level, 3)],
                    }}
                  />
                </Tooltip>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
