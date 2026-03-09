import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getStudentAnalytics } from '../../services/api';
import StudentProgressView from '../../components/StudentProgressView';

export default function AdminStudentProgress() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;
        getStudentAnalytics(id)
            .then((res) => setData(res.data.data))
            .catch((err) => setError(err.response?.data?.message || 'Failed'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/users')} sx={{ mb: 2 }}>
                Back to Users
            </Button>
            <Typography variant="h5" gutterBottom>Student Progress: {id}</Typography>
            <StudentProgressView
                data={data}
                loading={loading}
                error={error}
                isStudent={false}
                studentId={id}
            />
        </Box>
    );
}
