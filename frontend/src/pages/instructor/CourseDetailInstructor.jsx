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
import { Formik, Form, Field, FieldArray } from 'formik';
import {
  getCourseById,
  getLessons,
  createLesson,
  updateLesson,
  updateCourse,
  deleteLesson,
  getQuizzesByCourse,
  createQuiz,
  getQuizQuestions,
  addQuizQuestion,
  addBatchQuizQuestions,
  deleteQuizQuestion,
  uploadFile,
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
  const [openEdit, setOpenEdit] = useState(false);
  const [openQuestion, setOpenQuestion] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [openViewQuestions, setOpenViewQuestions] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);


  const loadQuizzes = () => {
    if (!id || isNew) return;
    getQuizzesByCourse(id).then((res) => setQuizzes(res.data.data.quizzes || [])).catch(() => { });
  };

  const handleOpenViewQuestions = async (quiz) => {
    setSelectedQuiz(quiz);
    setOpenViewQuestions(true);
    setViewLoading(true);
    try {
      const res = await getQuizQuestions(quiz.id);
      setQuizQuestions(res.data.data.questions || []);
    } catch (err) {
      setError('Failed to load questions');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await deleteQuizQuestion(qId);
      setQuizQuestions((prev) => prev.filter((q) => q.id !== qId));
    } catch (err) {
      setError('Failed to delete question');
    }
  };


  useEffect(() => {
    if (isNew) {
      navigate('/instructor/courses', { replace: true });
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
      const res = await createCourse({ title: values.title, description: values.description, image_url: values.image_url });
      navigate(`/instructor/courses/${res.data.data.course.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleUpdateCourseMeta = async (values) => {
    try {
      const res = await updateCourse(id, values);
      setCourse(res.data.data.course);
      setOpenEdit(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
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
        <Formik initialValues={{ title: '', description: '', image_url: '' }} onSubmit={handleSaveCourse}>
          {({ errors, touched }) => (
            <Form>
              <Field as={TextField} fullWidth name="title" label="Title" margin="normal" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
              <Field as={TextField} fullWidth name="image_url" label="Image URL (optional)" margin="normal" />
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
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="h5" gutterBottom>{course.title}</Typography>
          {course.description && <Typography color="text.secondary" sx={{ mb: 2 }}>{course.description}</Typography>}
        </Box>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEdit(true)}>
          Edit Course
        </Button>
      </Box>
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
                  <Button size="small" variant="text" onClick={() => handleOpenViewQuestions(q)}>View Questions</Button>
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
          initialValues={{ title: '', passing_score_pct: 60, image_url: '' }}
          onSubmit={async (values) => {
            try {
              await createQuiz({ course_id: id, title: values.title, passing_score_pct: values.passing_score_pct, image_url: values.image_url });
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
                <Field as={TextField} fullWidth name="image_url" label="Image/Thumbnail URL (optional)" margin="dense" />
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

      <Dialog open={openQuestion && !!selectedQuiz} onClose={() => { setOpenQuestion(false); setSelectedQuiz(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Add Questions to &quot;{selectedQuiz?.title}&quot;</DialogTitle>
        <Formik
          initialValues={{
            questions: [{ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', image_url: '' }]
          }}
          onSubmit={async (values, { setFieldError, setStatus }) => {
            try {
              setStatus(null);
              await addBatchQuizQuestions(selectedQuiz.id, values.questions);
              setOpenQuestion(false);
              setSelectedQuiz(null);
              loadQuizzes();
            } catch (e) {
              const msg = e.response?.data?.message || 'Failed to add questions. Please check your connection.';
              setStatus(msg);
              setFieldError('questions.0.question_text', msg);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, status, setStatus }) => (
            <Form>
              <DialogContent>
                {status && <Alert severity="error" sx={{ mb: 2 }}>{status}</Alert>}
                <FieldArray name="questions">
                  {({ push, remove }) => (
                    <Box>
                      {values.questions.map((_, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 2, mb: 3 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">Question #{index + 1}</Typography>
                            {values.questions.length > 1 && (
                              <IconButton size="small" color="error" onClick={() => remove(index)}><DeleteIcon fontSize="small" /></IconButton>
                            )}
                          </Box>
                          <Field
                            as={TextField}
                            fullWidth
                            multiline
                            rows={2}
                            name={`questions.${index}.question_text`}
                            label="Question Text"
                            margin="dense"
                            required
                            error={touched.questions?.[index]?.question_text && !!errors.questions?.[index]?.question_text}
                            helperText={touched.questions?.[index]?.question_text && errors.questions?.[index]?.question_text}
                          />
                          <Box sx={{ mt: 1, mb: 1 }}>
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={`upload-file-${index}`}
                              onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                try {
                                  const res = await uploadFile(file);
                                  setFieldValue(`questions.${index}.image_url`, res.data.data.url);
                                } catch (err) {
                                  console.error('Upload failed:', err);
                                  alert('File upload failed');
                                }
                              }}
                            />
                            <label htmlFor={`upload-file-${index}`}>
                              <Button variant="outlined" component="span" size="small" startIcon={<AddIcon />} type="button">
                                {values.questions[index].image_url ? 'Change Image' : 'Upload Image'}
                              </Button>
                            </label>
                            {values.questions[index].image_url && (
                              <Box sx={{ mt: 1 }}>
                                <img src={values.questions[index].image_url} alt="Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 4 }} />
                                <Button size="small" color="error" onClick={() => setFieldValue(`questions.${index}.image_url`, '')} sx={{ ml: 1 }} type="button">Remove</Button>
                              </Box>
                            )}
                          </Box>
                          <Box display="flex" gap={2}>
                            <Field as={TextField} fullWidth name={`questions.${index}.option_a`} label="Option A" margin="dense" size="small" />
                            <Field as={TextField} fullWidth name={`questions.${index}.option_b`} label="Option B" margin="dense" size="small" />
                          </Box>
                          <Box display="flex" gap={2}>
                            <Field as={TextField} fullWidth name={`questions.${index}.option_c`} label="Option C" margin="dense" size="small" />
                            <Field as={TextField} fullWidth name={`questions.${index}.option_d`} label="Option D" margin="dense" size="small" />
                          </Box>
                          <Field as={TextField} select fullWidth name={`questions.${index}.correct_option`} label="Correct Answer" margin="dense" size="small">
                            <MenuItem value="a">A</MenuItem>
                            <MenuItem value="b">B</MenuItem>
                            <MenuItem value="c">C</MenuItem>
                            <MenuItem value="d">D</MenuItem>
                          </Field>
                        </Paper>
                      ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => push({ question_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a', image_url: '' })}
                        variant="outlined"
                        sx={{ mt: 1 }}
                        type="button"
                      >
                        Add Another Question
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setOpenQuestion(false); setSelectedQuiz(null); }} type="button">Cancel</Button>
                <Button type="submit" variant="contained">Add Questions</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={openLesson} onClose={() => setOpenLesson(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Lesson</DialogTitle>
        <Formik
          initialValues={{
            title: '',
            image_url: '',
            duration_minutes: 0,
            contents: [{ title: '', video_url: '', text_content: '' }]
          }}
          onSubmit={async (values, { setFieldError }) => {
            const err = await handleAddLesson(values);
            if (err?.submitError) setFieldError('title', err.submitError);
          }}
        >
          {({ values, errors, touched }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="title" label="Lesson Title" margin="dense" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                <Field as={TextField} fullWidth name="image_url" label="Thumbnail URL (optional)" margin="dense" />
                <Field as={TextField} fullWidth name="duration_minutes" label="Duration (minutes)" type="number" margin="dense" />

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Content Items</Typography>
                <FieldArray name="contents">
                  {({ push, remove }) => (
                    <Box>
                      {values.contents.map((_, index) => (
                        <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="caption" fontWeight="bold">Item #{index + 1}</Typography>
                            {values.contents.length > 1 && (
                              <IconButton size="small" color="error" onClick={() => remove(index)}><DeleteIcon fontSize="small" /></IconButton>
                            )}
                          </Box>
                          <Field as={TextField} fullWidth name={`contents.${index}.title`} label="Item Title (e.g. Overview)" margin="dense" size="small" />
                          <Field as={TextField} fullWidth name={`contents.${index}.video_url`} label="Video URL (YouTube/MP4)" margin="dense" size="small" />
                          <Field as={TextField} fullWidth name={`contents.${index}.text_content`} label="Text Lesson / Notes" margin="dense" size="small" multiline rows={4} />
                        </Paper>
                      ))}
                      <Button size="small" startIcon={<AddIcon />} onClick={() => push({ title: '', video_url: '', text_content: '' })}>
                        Add More Content
                      </Button>
                    </Box>
                  )}
                </FieldArray>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenLesson(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Add Lesson</Button>
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
              duration_minutes: editingLesson.duration_minutes || 0,
              image_url: editingLesson.image_url || '',
              contents: editingLesson.contents && editingLesson.contents.length > 0
                ? editingLesson.contents.map(c => ({
                  title: c.title,
                  video_url: c.video_url || '',
                  text_content: c.text_content || ''
                }))
                : [{ title: '', video_url: '', text_content: '' }]
            }}
            onSubmit={async (values, { setFieldError }) => {
              const err = await handleUpdateLesson(values);
              if (err?.submitError) setFieldError('title', err.submitError);
            }}
          >
            {({ values, errors, touched }) => (
              <Form>
                <DialogContent>
                  <Field as={TextField} fullWidth name="title" label="Title" margin="dense" error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                  <Field as={TextField} fullWidth name="image_url" label="Thumbnail URL (optional)" margin="dense" />
                  <Field as={TextField} fullWidth name="duration_minutes" label="Duration (minutes)" type="number" margin="dense" />

                  <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Content Items</Typography>
                  <FieldArray name="contents">
                    {({ push, remove }) => (
                      <Box>
                        {values.contents.map((_, index) => (
                          <Paper key={index} variant="outlined" sx={{ p: 1.5, mb: 1.5 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" fontWeight="bold">Item #{index + 1}</Typography>
                              {values.contents.length > 1 && (
                                <IconButton size="small" color="error" onClick={() => remove(index)}><DeleteIcon fontSize="small" /></IconButton>
                              )}
                            </Box>
                            <Field as={TextField} fullWidth name={`contents.${index}.title`} label="Item Title" margin="dense" size="small" />
                            <Field as={TextField} fullWidth name={`contents.${index}.video_url`} label="Video URL" margin="dense" size="small" />
                            <Field as={TextField} fullWidth name={`contents.${index}.text_content`} label="Text Lesson / Notes" margin="dense" size="small" multiline rows={4} />
                          </Paper>
                        ))}
                        <Button size="small" startIcon={<AddIcon />} onClick={() => push({ title: '', video_url: '', text_content: '' })}>
                          Add More Content
                        </Button>
                      </Box>
                    )}
                  </FieldArray>
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
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Course</DialogTitle>
        <Formik
          initialValues={{
            title: course.title,
            description: course.description || '',
            image_url: course.image_url || '',
          }}
          onSubmit={handleUpdateCourseMeta}
        >
          {({ touched, errors }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="title" label="Title" margin="dense" required error={touched.title && !!errors.title} helperText={touched.title && errors.title} />
                <Field as={TextField} fullWidth name="image_url" label="Image URL" margin="dense" />
                <Field as={TextField} fullWidth name="description" label="Description" multiline rows={3} margin="dense" />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Save Changes</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
      <Dialog open={openViewQuestions} onClose={() => { setOpenViewQuestions(false); setSelectedQuiz(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Questions for &quot;{selectedQuiz?.title}&quot;</DialogTitle>
        <DialogContent dividers>
          {viewLoading ? (
            <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
          ) : quizQuestions.length === 0 ? (
            <Typography align="center" color="text.secondary" p={3}>No questions in this quiz yet.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">Question</TableCell>
                    <TableCell>Options</TableCell>
                    <TableCell>Correct</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quizQuestions.map((q, idx) => (
                    <TableRow key={q.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">{idx + 1}. {q.question_text}</Typography>
                        {q.image_url && (
                          <Box mt={1}>
                            <img src={q.image_url} alt="Question" style={{ maxWidth: 100, maxHeight: 60, borderRadius: 4 }} />
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" display="block">A: {q.option_a}</Typography>
                        <Typography variant="caption" display="block">B: {q.option_b}</Typography>
                        <Typography variant="caption" display="block">C: {q.option_c}</Typography>
                        <Typography variant="caption" display="block">D: {q.option_d}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary.main" fontWeight="bold">{q.correct_option?.toUpperCase()}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(q.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewQuestions(false)}>Close</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setOpenViewQuestions(false); setOpenQuestion(true); }}>
            Add Questions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
