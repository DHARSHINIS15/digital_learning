import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  Alert,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function QuizResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const quizTitle = location.state?.quizTitle;
  const courseId = location.state?.courseId;

  if (!result) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">No quiz result found. Redirecting to your courses...</Alert>
        <Button onClick={() => navigate('/student/courses')} sx={{ mt: 2 }}>Back to Courses</Button>
      </Container>
    );
  }

  const { score_pct, correct, total, passed, focus_topics } = result;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <CheckCircleIcon color={passed ? "success" : "action"} sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={700}>
            {passed ? 'Congratulations!' : 'Keep Practicing!'}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {quizTitle}
          </Typography>

          <Box sx={{ my: 4, p: 3, bgcolor: passed ? 'success.50' : 'grey.100', borderRadius: 3 }}>
            <Typography variant="h3" fontWeight={800} color={passed ? 'success.main' : 'text.primary'}>
              {score_pct}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You got {correct} out of {total} questions correct.
            </Typography>
            <Chip 
              label={passed ? 'Passed' : 'Not Passed'} 
              color={passed ? 'success' : 'default'} 
              sx={{ mt: 2, fontWeight: 700 }} 
            />
          </Box>

          {focus_topics && (
            <Box sx={{ mb: 4, textAlign: 'left' }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Focus Areas for Improvement:
              </Typography>
              <Typography variant="body2" color="warning.main" sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
                {focus_topics}
              </Typography>
            </Box>
          )}

          <Divider sx={{ mb: 4 }} />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(`/student/courses/${courseId}`)}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Back to Course
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={<ReplayIcon />}
              onClick={() => navigate(-1)}
              sx={{ borderRadius: 3, px: 4 }}
            >
              Try Again
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
