import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import api from '../services/api';

const schema = Yup.object({
  email: Yup.string().email('Invalid email format').required('Email is required'),
});

export default function ForgotPassword() {
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: values.email });
      setStatus({ type: 'success', message: res.data.message || 'If your email is registered, you will receive a reset link.' });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Something went wrong. Please try again.' 
      });
    } finally {
      setLoading(false);
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
            Forgot Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Enter your email address and we will send you a link to reset your password.
          </Typography>
          
          {status.message && (
            <Alert severity={status.type} sx={{ mb: 2 }}>
              {status.message}
            </Alert>
          )}

          <Formik
            initialValues={{ email: '' }}
            validationSchema={schema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  fullWidth
                  name="email"
                  label="Email Address"
                  type="email"
                  margin="normal"
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
                
                <Button 
                  type="submit" 
                  fullWidth 
                  variant="contained" 
                  size="large" 
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <Typography
                  variant="body2"
                  align="center"
                  sx={{ mt: 3 }}
                >
                  Remember your password?{' '}
                  <Typography
                    component={RouterLink}
                    to="/"
                    color="primary"
                    sx={{ fontWeight: 600, textDecoration: 'none' }}
                  >
                    Back to Login
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
