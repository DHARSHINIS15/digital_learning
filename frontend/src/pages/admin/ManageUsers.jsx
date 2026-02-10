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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/api';
import { ROLES } from '../../utils/constants';

const createSchema = Yup.object({
  name: Yup.string().required('Required'),
  email: Yup.string().email().required('Required'),
  password: Yup.string().min(6).required('Required'),
  role: Yup.string().oneOf(['instructor', 'student']).required('Required'),
});

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    getUsers()
      .then((res) => setUsers(res.data.data.users || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleCreate = async (values) => {
    try {
      await createUser(values);
      setOpenCreate(false);
      load();
    } catch (err) {
      return { submitError: err.response?.data?.message || 'Failed' };
    }
  };

  const handleUpdate = async (values) => {
    if (!editing) return;
    try {
      await updateUser(editing.id, values);
      setEditing(null);
      load();
    } catch (err) {
      return { submitError: err.response?.data?.message || 'Failed' };
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Manage Users</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
          Add User
        </Button>
      </Box>
      {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{ROLES[u.role] || u.role}</TableCell>
                <TableCell>{new Date(u.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditing(u)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <Formik
          initialValues={{ name: '', email: '', password: '', role: 'student' }}
          validationSchema={createSchema}
          onSubmit={async (values, { setFieldError }) => {
            const err = await handleCreate(values);
            if (err?.submitError) setFieldError('email', err.submitError);
          }}
        >
          {({ errors, touched }) => (
            <Form>
              <DialogContent>
                <Field as={TextField} fullWidth name="name" label="Name" margin="dense" error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                <Field as={TextField} fullWidth name="email" label="Email" margin="dense" error={touched.email && !!errors.email} helperText={touched.email && errors.email} />
                <Field as={TextField} fullWidth name="password" label="Password" type="password" margin="dense" error={touched.password && !!errors.password} helperText={touched.password && errors.password} />
                <Field as={TextField} select fullWidth name="role" label="Role" margin="dense">
                  <MenuItem value="instructor">Instructor</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Field>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                <Button type="submit" variant="contained">Create</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={!!editing} onClose={() => setEditing(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        {editing && (
          <Formik
            initialValues={{
              name: editing.name,
              email: editing.email,
              role: editing.role,
              password: '',
            }}
            onSubmit={async (values, { setFieldError }) => {
              const payload = { name: values.name, email: values.email, role: values.role };
              if (values.password) payload.password = values.password;
              const err = await handleUpdate(payload);
              if (err?.submitError) setFieldError('email', err.submitError);
            }}
          >
            {({ errors, touched }) => (
              <Form>
                <DialogContent>
                  <Field as={TextField} fullWidth name="name" label="Name" margin="dense" error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                  <Field as={TextField} fullWidth name="email" label="Email" margin="dense" error={touched.email && !!errors.email} helperText={touched.email && errors.email} />
                  <Field as={TextField} fullWidth name="password" label="New Password (leave blank to keep)" type="password" margin="dense" />
                  <Field as={TextField} select fullWidth name="role" label="Role" margin="dense">
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="instructor">Instructor</MenuItem>
                    <MenuItem value="student">Student</MenuItem>
                  </Field>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditing(null)}>Cancel</Button>
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
