import { useState, useEffect } from 'react';
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

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" onClose={() => setError('')}>{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Courses</Typography>
      <Grid container spacing={2}>
        {courses.map((c) => {
          const isEnrolled = enrolledIds.has(c.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={c.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{c.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {(c.description || '').slice(0, 100)}...
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Instructor: {c.instructor_name}
                  </Typography>
                </CardContent>
                <CardActions>
                  {isEnrolled ? (
                    <Button size="small" color="primary" onClick={() => navigate(`/student/courses/${c.id}`)}>
                      Open Course
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="contained"
                      disabled={enrolling === c.id}
                      onClick={() => handleEnroll(c.id)}
                    >
                      {enrolling === c.id ? 'Enrolling...' : 'Enroll'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
