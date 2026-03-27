import { useState } from 'react';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const schema = Yup.object({
  email: Yup.string()
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
    .required('Required'),
  password: Yup.string().required('Required'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (values) => {
    setError('');
    try {
      const res = await login(values.email, values.password);
      const { token, user } = res.data.data;
      loginUser(user, token);
      const rolePath = user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/student/courses';
      navigate(rolePath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom align="center">
            Digital Learning Experience Optimizer
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Sign in to continue
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  margin="normal"
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography
                    component={RouterLink}
                    to="/forgot-password"
                    color="primary"
                    variant="body2"
                    sx={{ textDecoration: 'none', fontWeight: 500 }}
                  >
                    Forgot Password?
                  </Typography>
                </Box>
                <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 2 }}>
                  Login
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mt: 2 }}
                >
                  New here?{' '}
                  <Typography
                    component={RouterLink}
                    to="/register"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Create an account
                  </Typography>
                </Typography>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
}
