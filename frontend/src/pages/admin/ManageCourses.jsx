import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Formik, Form, Field } from 'formik';
import { getCourses, getUsers, createCourse } from '../../services/api';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openAdd, setOpenAdd] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getCourses(), getUsers()])
      .then(([coursesRes, usersRes]) => {
        setCourses(coursesRes.data.data.courses || []);
        const users = usersRes.data.data.users || [];
        setInstructors(users.filter((u) => u.role === 'instructor'));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleAddCourse = async (values) => {
    try {
      await createCourse({
        title: values.title,
        description: values.description || '',
        instructor_id: values.instructor_id || undefined,
      });
      setOpenAdd(false);
      load();
    } catch (err) {
      return { submitError: err.response?.data?.message || 'Failed' };
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" onClose={() => setError('')}>{error}</Alert>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Manage Courses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAdd(true)}>
          Add Course
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>{(c.description || '').slice(0, 50)}...</TableCell>
                <TableCell>{c.instructor_name}</TableCell>
                <TableCell>{new Date(c.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Course</DialogTitle>
        <Formik
          initialValues={{ title: '', description: '', instructor_id: instructors[0]?.id || '' }}
          onSubmit={async (values, { setFieldError }) => {
            const err = await handleAddCourse(values);
            if (err?.submitError) setFieldError('title', err.submitError);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field
                  as={TextField}
                  fullWidth
                  name="title"
                  label="Course Title"
                  margin="dense"
                  required
                  error={touched.title && !!errors.title}
                  helperText={touched.title && errors.title}
                />
                <Field
                  as={TextField}
                  fullWidth
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                  margin="dense"
                />
                <Field as={TextField} select fullWidth name="instructor_id" label="Instructor" margin="dense">
                  {instructors.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
                  ))}
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Create Course</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
