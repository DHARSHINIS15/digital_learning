import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { getStudentAnalytics, getQuizRecommendations } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ActivityHeatmap from '../../components/ActivityHeatmap';

export default function Progress() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    getStudentAnalytics(user.id)
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
    getQuizRecommendations()
      .then((res) => setRecommendations(res.data.data.recommendations || []))
      .catch(() => {});
  }, [user?.id]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const byCourse = data?.byCourse || [];
  const overall = data?.overall || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Progress</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Activity (past year)</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Lesson completions and quiz attempts — light to dark by intensity</Typography>
          <ActivityHeatmap />
        </CardContent>
      </Card>

      {recommendations.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recommended for you</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Topics/courses to revisit based on quiz performance</Typography>
            <Grid container spacing={1}>
              {recommendations.map((r) => (
                <Grid item xs={12} sm={6} key={`${r.course_id}-${r.quiz_id}`}>
                  <Card variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{r.course_title}</Typography>
                    <Typography variant="body2" color="text.secondary">{r.quiz_title}</Typography>
                    <Typography variant="caption" color="warning.main">Best score: {r.best_score}% (pass: {r.passing_score_pct}%)</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Button size="small" onClick={() => navigate(`/student/courses/${r.course_id}`)}>Open course</Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Overall</Typography>
          <Typography color="text.secondary">
            {overall.totalCompleted ?? 0} / {overall.totalLessons ?? 0} lessons completed
          </Typography>
          <LinearProgress
            variant="determinate"
            value={overall.completionPercentage ?? 0}
            sx={{ mt: 1, height: 10, borderRadius: 1 }}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Engagement score: {(overall.engagementScore ?? 0).toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
      <Typography variant="h6" gutterBottom>By Course</Typography>
      <Grid container spacing={2}>
        {byCourse.map((c) => (
          <Grid item xs={12} md={6} key={c.courseId}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{c.courseTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {c.completedLessons} / {c.totalLessons} lessons • {c.timeSpentMinutes} min spent
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={c.completionPercentage ?? 0}
                  sx={{ mt: 1, height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  Engagement: {c.engagementScore?.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
