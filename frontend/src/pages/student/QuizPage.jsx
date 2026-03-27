import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Alert,
  CardMedia,
  Container,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getQuizWithQuestions, submitQuizAttempt } from '../../services/api';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [exitDialog, setExitDialog] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 min default

  const storageKey = `quiz_progress_${id}`;

  useEffect(() => {
    getQuizWithQuestions(id)
      .then((res) => {
        setQuiz(res.data.data.quiz);
        setQuestions(res.data.data.questions || []);
        
        // Restore from localStorage
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const { answers: savedAnswers, time: savedTime } = JSON.parse(saved);
          setAnswers(savedAnswers);
          setTimeRemaining(savedTime);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load quiz'))
      .finally(() => setLoading(false));
  }, [id, storageKey]);

  // Persist to localStorage
  useEffect(() => {
    if (quiz) {
      localStorage.setItem(storageKey, JSON.stringify({ answers, time: timeRemaining }));
    }
  }, [answers, timeRemaining, quiz, storageKey]);

  // Timer logic
  useEffect(() => {
    if (loading || !quiz) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, quiz]);

  // Exit confirmation
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.keys(answers).length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(id, answers);
      localStorage.removeItem(storageKey);
      navigate('/student/quiz/result', { state: { result: res.data.data, quizTitle: quiz?.title, courseId: quiz?.course_id } });
    } catch (e) {
      setError(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = () => {
    if (Object.keys(answers).length > 0) {
      setExitDialog(true);
    } else {
      navigate(-1);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <Box display="flex" justifyContent="center" height="100vh" alignItems="center"><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleExit} sx={{ mr: 2 }}>Exit</Button>
            <Typography variant="h6">{quiz?.title}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: 2, bgcolor: timeRemaining < 300 ? 'error.light' : 'primary.light', color: 'white' }}>
            <TimerIcon fontSize="small" />
            <Typography variant="h6" fontWeight={700}>{formatTime(timeRemaining)}</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {questions.map((q, idx) => (
          <Paper key={q.id} sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Question {idx + 1}
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>{q.question_text}</Typography>
            {q.image_url && (
              <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <CardMedia component="img" image={q.image_url} alt={`Question ${idx + 1}`} sx={{ maxHeight: 400, width: 'auto', mx: 'auto' }} />
              </Box>
            )}
            <RadioGroup
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            >
              {['a', 'b', 'c', 'd'].map((opt) => (
                q[`option_${opt}`] && (
                  <Paper
                    key={opt}
                    variant="outlined"
                    sx={{
                      mb: 1,
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      borderColor: answers[q.id] === opt ? 'primary.main' : 'divider',
                      bgcolor: answers[q.id] === opt ? 'primary.50' : 'transparent',
                      transition: '0.2s'
                    }}
                  >
                    <FormControlLabel
                      value={opt}
                      control={<Radio />}
                      label={q[`option_${opt}`]}
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Paper>
                )
              ))}
            </RadioGroup>
          </Paper>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ px: 8, py: 1.5, fontSize: '1.2rem' }}
          >
            {submitting ? 'Submitting...' : 'Finish Quiz'}
          </Button>
        </Box>
      </Container>

      <Dialog open={exitDialog} onClose={() => setExitDialog(false)}>
        <DialogTitle>Exit Quiz?</DialogTitle>
        <DialogContent>
          <Typography>Your progress will be saved in your browser, but your attempt won't be submitted. Are you sure you want to leave?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitDialog(false)}>Stay</Button>
          <Button color="error" onClick={() => navigate(-1)}>Exit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
