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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayCircleIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import QuizIcon from '@mui/icons-material/Quiz';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionIcon from '@mui/icons-material/Description';
import {
  getCourseById,
  getLessons,
  myProgress,
  updateProgress,
  getQuizzesByCourse,
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
  const [contentViews, setContentViews] = useState({}); // { lessonId-contentId: 'video' | 'text' }

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
    } catch (_) { }
  };

  const startQuiz = (quizId) => {
    navigate(`/student/quiz/${quizId}`);
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
      <Box>
        {lessons.map((l) => {
          const prog = progress[l.id];
          const completed = prog?.completed;
          return (
            <Accordion key={l.id} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }} elevation={1}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%">
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {l.image_url ? (
                      <Avatar src={l.image_url} variant="rounded" sx={{ width: 32, height: 32 }} />
                    ) : (
                      completed ? <CheckCircleIcon color="success" /> : <PlayCircleIcon color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={l.title}
                    secondary={`${l.contents?.length || 0} topics ${l.duration_minutes ? `• ${l.duration_minutes} min` : ''}`}
                  />
                  {!completed && (
                    <Chip
                      size="small"
                      label="Mark complete"
                      onClick={(e) => { e.stopPropagation(); markComplete(l.id, true); }}
                      sx={{ ml: 'auto', mr: 2 }}
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <List size="small" disablePadding>
                  {l.contents?.map((content, cIdx) => {
                    const viewKey = `${l.id}-${content.id || cIdx}`;
                    const currentView = contentViews[viewKey] || 'video';

                    return (
                      <Paper key={content.id || cIdx} variant="outlined" sx={{ mb: 2, p: 0, overflow: 'hidden', borderRadius: 2 }}>
                        <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={700}>{content.title}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {content.video_url && (
                              <Button
                                size="extra-small"
                                variant={currentView === 'video' ? "contained" : "outlined"}
                                onClick={() => setContentViews({ ...contentViews, [viewKey]: 'video' })}
                                startIcon={<PlayCircleIcon sx={{ fontSize: '1rem !important' }} />}
                                sx={{ textTransform: 'none', borderRadius: 1, px: 1, py: 0.25, fontSize: '0.75rem' }}
                              >
                                Video
                              </Button>
                            )}
                            {content.text_content && (
                              <Button
                                size="extra-small"
                                variant={currentView === 'text' ? "contained" : "outlined"}
                                onClick={() => setContentViews({ ...contentViews, [viewKey]: 'text' })}
                                startIcon={<DescriptionIcon sx={{ fontSize: '1rem !important' }} />}
                                sx={{ textTransform: 'none', borderRadius: 1, px: 1, py: 0.25, fontSize: '0.75rem' }}
                              >
                                Notes
                              </Button>
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          {currentView === 'video' && content.video_url ? (
                            <Box sx={{ textAlign: 'center' }}>
                              <Button
                                variant="contained"
                                color="primary"
                                href={content.video_url}
                                target="_blank"
                                startIcon={<PlayCircleIcon />}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                              >
                                Watch Video
                              </Button>
                              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                Opens in a new tab
                              </Typography>
                            </Box>
                          ) : currentView === 'text' && content.text_content ? (
                            <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {content.text_content}
                            </Typography>
                          ) : (
                            <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                              Select a format to study
                            </Typography>
                          )}
                        </Box>
                      </Paper>
                    );
                  })}
                  {(!l.contents || l.contents.length === 0) && (
                    <Typography variant="caption" color="text.secondary" sx={{ py: 1, display: 'block', textAlign: 'center' }}>
                      No content items in this lesson.
                    </Typography>
                  )}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      {quizzes.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Quizzes</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            {quizzes.map((q) => (
              <Box key={q.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {q.image_url ? (
                    <Avatar src={q.image_url} variant="rounded" sx={{ width: 40, height: 40 }} />
                  ) : (
                    <QuizIcon color="action" />
                  )}
                  <Typography>{q.title}</Typography>
                  <Chip size="small" label={`Pass: ${q.passing_score_pct ?? 60}%`} variant="outlined" />
                </Box>
                <Button size="small" variant="contained" onClick={() => startQuiz(q.id)}>Take Quiz</Button>
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
                  <TableCell>Improvement Suggestion</TableCell>
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
                    <TableCell>
                      {a.score_pct >= 80 ? (
                        <Typography variant="body2" color="success.main">Good performance</Typography>
                      ) : a.focus_topics ? (
                        <Typography variant="body2" color="warning.main">Focus on: {a.focus_topics}</Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">General Revision Recommended</Typography>
                      )}
                    </TableCell>
                    <TableCell>{new Date(a.submitted_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {attempts.length === 0 && <TableRow><TableCell colSpan={4} align="center" color="text.secondary">No attempts yet</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
