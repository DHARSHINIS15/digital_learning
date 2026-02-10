import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { getCourses } from '../../services/api';
import { getCourseReport, getStudentReport, downloadReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [reportId, setReportId] = useState(null);

  useEffect(() => {
    getCourses()
      .then((res) => {
        const all = res.data.data.courses || [];
        setCourses(all.filter((c) => c.instructor_id === user?.id));
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const loadCourseReport = (courseId) => {
    setReportType('course');
    setReportId(courseId);
    getCourseReport(courseId)
      .then((res) => setReport(res.data.data))
      .catch((err) => setReport({ error: err.response?.data?.message }));
  };

  const loadStudentReport = (studentId) => {
    setReportType('student');
    setReportId(studentId);
    getStudentReport(studentId)
      .then((res) => setReport(res.data.data))
      .catch((err) => setReport({ error: err.response?.data?.message }));
  };

  const handleDownload = async () => {
    if (!reportId || !reportType) return;
    try {
      const res = await downloadReport(reportId, reportType);
      const data = res.data.data.report;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${reportId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" onClose={() => setError('')}>{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reports</Typography>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Card sx={{ minWidth: 280 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Course-wise Report</Typography>
            <List dense>
              {courses.map((c) => (
                <ListItem key={c.id} disablePadding>
                  <ListItemButton onClick={() => loadCourseReport(c.id)}>
                    <ListItemText primary={c.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            {report?.error && <Alert severity="error">{report.error}</Alert>}
            {report && !report.error && (
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {reportType === 'course' ? report.course?.title : report.student?.name}
                  </Typography>
                  <Button size="small" variant="outlined" onClick={handleDownload}>Export JSON</Button>
                </Box>
                {reportType === 'course' && report.students && (
                  <List dense>
                    {report.students.map((s) => (
                      <ListItem key={s.studentId}>
                        <ListItemText
                          primary={s.studentName}
                          secondary={`${s.completionPercentage}% complete, ${s.timeSpentMinutes} min`}
                        />
                        <Button size="small" onClick={() => loadStudentReport(s.studentId)}>View</Button>
                      </ListItem>
                    ))}
                  </List>
                )}
                {reportType === 'student' && report.courses && (
                  <List dense>
                    {report.courses.map((c, i) => (
                      <ListItem key={i}>
                        <ListItemText
                          primary={c.courseTitle}
                          secondary={`${c.completionPercentage}% complete, ${c.timeSpentMinutes} min`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </>
            )}
            {!report && <Typography color="text.secondary">Select a course to view report</Typography>}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
