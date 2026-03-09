import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  CircularProgress,
  Alert,
  CardMedia,
} from '@mui/material';
import { getCourses, myEnrollments, enroll } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function StudentCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    Promise.all([getCourses(), myEnrollments()])
      .then(([coursesRes, enrollRes]) => {
        setCourses(coursesRes.data.data.courses || []);
        const ids = new Set((enrollRes.data.data.enrollments || []).map((e) => e.course_id));
        setEnrolledIds(ids);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrolling(courseId);
    try {
      await enroll(courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
    } catch (err) {
      setError(err.response?.data?.message || 'Enroll failed');
    } finally {
      setEnrolling(null);
    }
  };

  const { enrolledCourses, availableCourses } = useMemo(() => {
    const enrolled = [];
    const available = [];
    courses.forEach((c) => {
      if (enrolledIds.has(c.id)) enrolled.push(c);
      else available.push(c);
    });
    return { enrolledCourses: enrolled, availableCourses: available };
  }, [courses, enrolledIds]);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" onClose={() => setError('')}>{error}</Alert>;

  const renderCourseCard = (c) => {
    const isEnrolled = enrolledIds.has(c.id);
    return (
      <Grid item xs={12} sm={6} md={3} lg={2.4} key={c.id}>
        <Card sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s',
          '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }
        }}>
          <Box sx={{ p: 1 }}>
            <CardMedia
              component="img"
              sx={{
                height: 140,
                borderRadius: 2,
                objectFit: 'cover'
              }}
              image={c.image_url || 'https://via.placeholder.com/400x250?text=Course+Image'}
              alt={c.title}
            />
          </Box>
          <CardContent sx={{ flexGrow: 1, pt: 0, px: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Box sx={{
                width: 24,
                height: 24,
                bgcolor: '#00274c',
                borderRadius: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffcb05',
                fontWeight: 'bold',
                fontSize: 10,
                flexShrink: 0
              }}>
                M
              </Box>
              <Typography variant="caption" color="text.secondary" noWrap>
                {c.instructor_name}
              </Typography>
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2, fontSize: '0.95rem' }}>
              {c.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {c.description || 'No description available.'}
            </Typography>
          </CardContent>
          <CardActions sx={{ px: 2, pb: 2, pt: 0, mt: 'auto' }}>
            {isEnrolled ? (
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={() => navigate(`/student/courses/${c.id}`)}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem' }}
              >
                Open
              </Button>
            ) : (
              <Button
                fullWidth
                size="small"
                variant="contained"
                disabled={enrolling === c.id}
                onClick={() => handleEnroll(c.id)}
                sx={{ borderRadius: 1.5, textTransform: 'none', fontWeight: 600, bgcolor: '#1a73e8', fontSize: '0.8rem' }}
              >
                {enrolling === c.id ? '...' : 'Enroll'}
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Box>
      {enrolledCourses.length > 0 && (
        <Box mb={4}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            My Enrollments
          </Typography>
          <Grid container spacing={2}>
            {enrolledCourses.map(renderCourseCard)}
          </Grid>
        </Box>
      )}

      <Box>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Available Courses
        </Typography>
        {availableCourses.length > 0 ? (
          <Grid container spacing={2}>
            {availableCourses.map(renderCourseCard)}
          </Grid>
        ) : (
          <Typography variant="body1" color="text.secondary">
            No active courses available at the moment.
          </Typography>
        )}
      </Box>
    </Box>
  );
}
