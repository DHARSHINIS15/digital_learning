import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, Field } from 'formik';
import {
  getCourseById,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  getQuizzesByCourse,
  createQuiz,
  addQuizQuestion,
} from '../../services/api';
import { CONTENT_TYPES } from '../../utils/constants';

export default function CourseDetailInstructor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openLesson, setOpenLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [openQuiz, setOpenQuiz] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const loadQuizzes = () => {
    if (!id || isNew) return;
    getQuizzesByCourse(id).then((res) => setQuizzes(res.data.data.quizzes || [])).catch(() => {});
  };

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    Promise.all([getCourseById(id), getLessons(id)])
      .then(([courseRes, lessonsRes]) => {
        setCourse(courseRes.data.data.course);
        setLessons(lessonsRes.data.data.lessons || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
    loadQuizzes();
  }, [id, isNew]);

  const handleSaveCourse = async (values) => {
    try {
      const { createCourse } = await import('../../services/api');
      const res = await createCourse({ title: values.title, description: values.description });
      navigate(`/instructor/courses/${res.data.data.course.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleAddLesson = async (values) => {
    try {
      await createLesson(id, values);
      setOpenLesson(false);
      const res = await getLessons(id);
      setLessons(res.data.data.lessons || []);
    } catch (err) {
      return { submitError: err.response?.data?.message };
    }
  };

  const handleUpdateLesson = async (values) => {
    if (!editingLesson) return;
    try {
      await updateLesson(editingLesson.id, values);
      setEditingLesson(null);
      const res = await getLessons(id);
      setLessons(res.data.data.lessons || []);
    } catch (err) {
      return { submitError: err.response?.data?.message };
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  if (isNew) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/instructor/courses')} sx={{ mb: 2 }}>
          Back
        </Button>
        <Typography variant="h5" gutterBottom>New Course</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Formik initialValues={{ title: '', description: '' }} onSubmit={handleSaveCourse}>
          {({ errors, touched }) => (
            <Form>
              <Field as={TextField} fullWidth name="title" label="Title" margin="normal" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
              <Field as={TextField} fullWidth name="description" label="Description" multiline rows={3} margin="normal" />
              <Button type="submit" variant="contained" sx={{ mt: 2 }}>Create Course</Button>
            </Form>
          )}
        </Formik>
      </Box>
    );
  }

  if (!course) return <Alert severity="error">Course not found</Alert>;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/instructor/courses')} sx={{ mb: 2 }}>
        Back
      </Button>
      <Typography variant="h5" gutterBottom>{course.title}</Typography>
      {course.description && <Typography color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>}
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Lessons</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenLesson(true)}>
          Add Lesson
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.title}</TableCell>
                <TableCell>{l.content_type}</TableCell>
                <TableCell>{l.duration_minutes}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditingLesson(l)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteLesson(l.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Quizzes</Typography>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="body2" color="text.secondary">Add quizzes for students to take after lessons.</Typography>
        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setOpenQuiz(true)}>Add Quiz</Button>
      </Box>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Quiz Title</TableCell>
              <TableCell>Passing %</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizzes.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.title}</TableCell>
                <TableCell>{q.passing_score_pct ?? 60}%</TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => { setSelectedQuiz(q); setOpenQuestion(true); }}>Add Question</Button>
                </TableCell>
              </TableRow>
            ))}
            {quizzes.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center" color="text.secondary">No quizzes yet. Add one to get started.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openQuiz} onClose={() => setOpenQuiz(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Quiz</DialogTitle>
        <Formik
          initialValues={{ title: '', passing_score_pct: 60 }}
          onSubmit={async (values) => {
            try {
              await createQuiz({ course_id: id, title: values.title, passing_score_pct: values.passing_score_pct });
              setOpenQuiz(false);
              loadQuizzes();
            } catch (e) {
              return { submitError: e.response?.data?.message };
            }
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="title" label="Quiz title" margin="dense" required error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                <Field as={TextField} fullWidth name="passing_score_pct" label="Passing score %" type="number" margin="dense" inputProps={{ min: 0, max: 100 }} />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenQuiz(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Create</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={openQuestion && !!selectedQuiz} onClose={() => { setOpenQuestion(false); setSelectedQuiz(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>Add Question to &quot;{selectedQuiz?.title}&quot;</DialogTitle>
        <Formik
          initialValues={{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' }}
          onSubmit={async (values, { setFieldError }) => {
            try {
              await addQuizQuestion(selectedQuiz.id, values);
              setOpenQuestion(false);
              setSelectedQuiz(null);
            } catch (e) {
              setFieldError('question_text', e.response?.data?.message);
            }
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="question_text" label="Question" multiline rows={2} margin="dense" required error={touched.question_text && !!errors.question_text} helperText={touched.question_text && errors.question_text} />
                <Field as={TextField} fullWidth name="option_a" label="Option A" margin="dense" />
                <Field as={TextField} fullWidth name="option_b" label="Option B" margin="dense" />
                <Field as={TextField} fullWidth name="option_c" label="Option C" margin="dense" />
                <Field as={TextField} fullWidth name="option_d" label="Option D" margin="dense" />
                <Field as={TextField} select fullWidth name="correct_option" label="Correct answer" margin="dense">
                  <MenuItem value="a">A</MenuItem>
                  <MenuItem value="b">B</MenuItem>
                  <MenuItem value="c">C</MenuItem>
                  <MenuItem value="d">D</MenuItem>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenQuestion(false); setSelectedQuiz(null); }}>Cancel</Button>
                <Button type="submit" variant="contained">Add Question</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={openLesson} onClose={() => setOpenLesson(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Lesson</DialogTitle>
        <Formik
          initialValues={{ title: '', content_type: 'text', content_url: '', duration_minutes: 0 }}
          onSubmit={async (values, { setFieldError }) => {
            const err = await handleAddLesson(values);
            if (err?.submitError) setFieldError('title', err.submitError);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="title" label="Title" margin="dense" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                <Field as={TextField} select fullWidth name="content_type" label="Content Type" margin="dense">
                  {CONTENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Field>
                <Field as={TextField} fullWidth name="content_url" label="Content URL" margin="dense" />
                <Field as={TextField} fullWidth name="duration_minutes" label="Duration (minutes)" type="number" margin="dense" />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenLesson(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Add</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={!!editingLesson} onClose={() => setEditingLesson(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Lesson</DialogTitle>
        {editingLesson && (
          <Formik
            initialValues={{
              title: editingLesson.title,
              content_type: editingLesson.content_type,
              content_url: editingLesson.content_url || '',
              duration_minutes: editingLesson.duration_minutes || 0,
            }}
            onSubmit={async (values, { setFieldError }) => {
              const err = await handleUpdateLesson(values);
              if (err?.submitError) setFieldError('title', err.submitError);
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <DialogContent>
                  <Field as={TextField} fullWidth name="title" label="Title" margin="dense" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                  <Field as={TextField} select fullWidth name="content_type" label="Content Type" margin="dense">
                    {CONTENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Field>
                  <Field as={TextField} fullWidth name="content_url" label="Content URL" margin="dense" />
                  <Field as={TextField} fullWidth name="duration_minutes" label="Duration (minutes)" type="number" margin="dense" />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditingLesson(null)}>Cancel</Button>
                  <Button type="submit" variant="contained">Save</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        )}
      </Dialog>
    </Box>
  );
}
