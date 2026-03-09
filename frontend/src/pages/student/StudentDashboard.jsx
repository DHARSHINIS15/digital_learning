import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer as LineResp,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getStudentAnalytics } from '../../services/api';

const COLORS = ['#1976d2', '#2e7d32', '#ed6c02'];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    getStudentAnalytics(user.id)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Auto-redirect removed to allow viewing the dashboard
  // useEffect(() => {
  //   if (!data?.byCourse?.length) return;
  //   const first = data.byCourse[0];
  //   if (first?.courseId) navigate(`/student/courses/${first.courseId}`, { replace: true });
  // }, [data, navigate]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  // if (data?.byCourse?.length > 0) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const overall = data?.overall || {};
  const byCourse = data?.byCourse || [];
  const pieData = [
    { name: 'Completed', value: overall.totalCompleted || 0 },
    { name: 'Pending', value: Math.max(0, (overall.totalLessons || 0) - (overall.totalCompleted || 0)) },
  ].filter((d) => d.value > 0);
  if (pieData.length === 0) pieData.push({ name: 'No lessons', value: 1 });

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Student Dashboard</Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Total Lessons</Typography>
              <Typography variant="h4">{overall.totalLessons ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Completed</Typography>
              <Typography variant="h4">{overall.totalCompleted ?? 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Completion %</Typography>
              <Typography variant="h4">{overall.completionPercentage ?? 0}%</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary">Engagement Score</Typography>
              <Typography variant="h4">{(overall.engagementScore ?? 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Completed vs Pending Lessons</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Course Completion %</Typography>
              <LineResp width="100%" height={250}>
                <LineChart data={byCourse.map((c) => ({ name: (c.courseTitle || '').slice(0, 10), pct: c.completionPercentage }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" stroke="#1976d2" name="Completion %" />
                </LineChart>
              </LineResp>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
