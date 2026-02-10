import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  LinearProgress,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import {
  getCourseById,
  getLessons,
  myProgress,
  updateProgress,
  getQuizzesByCourse,
  getQuizWithQuestions,
  submitQuizAttempt,
  getMyQuizAttempts,
} from '../../services/api';

export default function CourseDetailStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState({});
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizModal, setQuizModal] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([getCourseById(id), getLessons(id), myProgress(), getQuizzesByCourse(id), getMyQuizAttempts()])
      .then(([courseRes, lessonsRes, progressRes, quizzesRes, attemptsRes]) => {
        setCourse(courseRes.data.data.course);
        setLessons(lessonsRes.data.data.lessons || []);
        const byLesson = {};
        (progressRes.data.data.progress || []).forEach((p) => {
          byLesson[p.lesson_id] = p;
        });
        setProgress(byLesson);
        setQuizzes(quizzesRes.data.data.quizzes || []);
        const all = attemptsRes.data.data.attempts || [];
        setAttempts(all.filter((a) => Number(a.course_id) === Number(id)));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, [id]);

  const markComplete = async (lessonId, completed) => {
    try {
      await updateProgress({ course_id: id, lesson_id: lessonId, completed, time_spent_minutes: 0 });
      setProgress((prev) => ({
        ...prev,
        [lessonId]: { ...prev[lessonId], completed, time_spent_minutes: (prev[lessonId]?.time_spent_minutes || 0) },
      }));
    } catch (_) {}
  };

  const openQuiz = async (quiz) => {
    setQuizResult(null);
    setQuizAnswers({});
    try {
      const res = await getQuizWithQuestions(quiz.id);
      setQuizModal({ quiz: res.data.data.quiz, questions: res.data.data.questions || [] });
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load quiz');
    }
  };

  const submitQuiz = async () => {
    if (!quizModal?.quiz) return;
    setSubmitting(true);
    try {
      const res = await submitQuizAttempt(quizModal.quiz.id, quizAnswers);
      setQuizResult(res.data.data);
      const attemptsRes = await getMyQuizAttempts();
      setAttempts((attemptsRes.data.data.attempts || []).filter((a) => Number(a.course_id) === Number(id)));
    } catch (e) {
      setError(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const completedLessons = lessons.filter((l) => progress[l.id]?.completed).length;
  const courseProgressPct = lessons.length ? Math.round((completedLessons / lessons.length) * 100) : 0;

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!course) return <Alert severity="error">Course not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/student/courses')} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>{course.title}</Typography>
      {course.description && <Typography color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary">Course progress</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
          <LinearProgress variant="determinate" value={courseProgressPct} sx={{ flex: 1, height: 10, borderRadius: 1 }} />
          <Typography variant="body2" fontWeight={600}>{courseProgressPct}%</Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">{completedLessons} of {lessons.length} lessons completed</Typography>
      </Paper>

      <Typography variant="h6" gutterBottom>Lessons & Resources</Typography>
      <Paper>
        <List>
          {lessons.map((l) => {
            const prog = progress[l.id];
            const completed = prog?.completed;
            return (
              <ListItem key={l.id} disablePadding divider>
                <ListItemIcon>
                  {completed ? <CheckCircleIcon color="success" /> : <PlayCircleIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={l.title}
                  secondary={`${l.content_type} ${l.duration_minutes ? `• ${l.duration_minutes} min` : ''}`}
                />
                {l.content_url && (
                  <Button size="small" href={l.content_url} target="_blank" rel="noopener noreferrer">
                    Open
                  </Button>
                )}
                {!completed && (
                  <Chip
                    size="small"
                    label="Mark complete"
                    onClick={() => markComplete(l.id, true)}
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Paper>

      {quizzes.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Quizzes</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            {quizzes.map((q) => (
              <Box key={q.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <QuizIcon color="action" />
                  <Typography>{q.title}</Typography>
                  <Chip size="small" label={`Pass: ${q.passing_score_pct ?? 60}%`} variant="outlined" />
                </Box>
                <Button size="small" variant="contained" onClick={() => openQuiz(q)}>Take Quiz</Button>
              </Box>
            ))}
          </Paper>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>My quiz marks</Typography>
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Quiz</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.quiz_title}</TableCell>
                    <TableCell>
                      <Chip size="small" color={a.score_pct >= (a.passing_score_pct ?? 60) ? 'success' : 'default'} label={`${a.score_pct}%`} />
                    </TableCell>
                    <TableCell>{new Date(a.submitted_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {attempts.length === 0 && <TableRow><TableCell colSpan={3} align="center" color="text.secondary">No attempts yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      <Dialog open={!!quizModal} onClose={() => !submitting && setQuizModal(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{quizModal?.quiz?.title}</DialogTitle>
        <DialogContent>
          {quizResult ? (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="h5" color={quizResult.passed ? 'success.main' : 'text.secondary'}>
                {quizResult.passed ? 'Passed' : 'Not passed'}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>{quizResult.score_pct}%</Typography>
              <Typography variant="body2">({quizResult.correct} / {quizResult.total} correct)</Typography>
              <Button variant="contained" sx={{ mt: 2 }} onClick={() => setQuizModal(null)}>Close</Button>
            </Box>
          ) : (
            quizModal?.questions?.map((q, idx) => (
              <FormControl key={q.id} component="fieldset" sx={{ display: 'block', mb: 2 }}>
                <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>{idx + 1}. {q.question_text}</Typography>
                <RadioGroup value={quizAnswers[q.id] || ''} onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}>
                  {['a', 'b', 'c', 'd'].map((opt) => q[`option_${opt}`] && <FormControlLabel key={opt} value={opt} control={<Radio />} label={q[`option_${opt}`]} />)}
                </RadioGroup>
              </FormControl>
            ))
          )}
        </DialogContent>
        {!quizResult && quizModal?.questions?.length > 0 && (
          <DialogActions>
            <Button onClick={() => setQuizModal(null)}>Cancel</Button>
            <Button variant="contained" onClick={submitQuiz} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
