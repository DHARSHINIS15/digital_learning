import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import { getStudentAnalytics, getQuizRecommendations } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StudentProgressView from '../../components/StudentProgressView';

export default function Progress() {
  const { user } = useAuth();
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
      .catch(() => { });
  }, [user?.id]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Progress</Typography>
      <StudentProgressView
        data={data}
        recommendations={recommendations}
        loading={loading}
        error={error}
        isStudent={true}
      />
    </Box>
  );
}
