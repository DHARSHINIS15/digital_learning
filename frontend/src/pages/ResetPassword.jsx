import { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
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
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm your new password'),
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setStatus({ type: '', message: '' });
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { 
        token, 
        newPassword: values.password 
      });
      setStatus({ type: 'success', message: res.data.message || 'Password reset successful!' });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Invalid or expired reset token. Please request a new one.' 
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
            Reset Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            Create a new strong password for your account.
          </Typography>
          
          {status.message && (
            <Alert severity={status.type} sx={{ mt: 2, mb: 2 }}>
              {status.message}
            </Alert>
          )}

          {status.type !== 'success' && (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={schema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched }) => (
                <Form>
                  <Field
                    as={TextField}
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    margin="normal"
                    error={touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                  />
                  <Field
                    as={TextField}
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    margin="normal"
                    error={touched.confirmPassword && !!errors.confirmPassword}
                    helperText={touched.confirmPassword && errors.confirmPassword}
                  />
                  
                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    size="large" 
                    sx={{ mt: 2 }}
                    disabled={loading}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Form>
              )}
            </Formik>
          )}

          {status.type === 'error' && (
             <Button
               component={RouterLink}
               to="/forgot-password"
               fullWidth
               variant="outlined"
               sx={{ mt: 2 }}
             >
               Request New Reset Link
             </Button>
          )}
          
          <Typography
            variant="body2"
            align="center"
            sx={{ mt: 3 }}
          >
            <Typography
              component={RouterLink}
              to="/"
              color="primary"
              sx={{ fontWeight: 600, textDecoration: 'none' }}
            >
              Back to Login
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
