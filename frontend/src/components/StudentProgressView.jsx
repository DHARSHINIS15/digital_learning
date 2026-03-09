import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ActivityHeatmap from './ActivityHeatmap';

export default function StudentProgressView({ data, recommendations = [], loading, error, isStudent = false, studentId }) {
    const navigate = useNavigate();

    if (loading) return null; // Parent handles loading spinner or let it be handled here? 
    // The plan said "Props: data, loading, error". 
    // simpler to let parent handle loading/error state for full page, but if this is a view...
    // Let's assume parent handles loading/error for now as per likely usage in Progress.jsx which has early returns.

    // Wait, if I want to reuse it, I should probably pass data.
    // If data is null, return null.
    if (!data) return null;

    const byCourse = data.byCourse || [];
    const overall = data.overall || {};

    return (
        <Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Activity (past year)</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Lesson completions and quiz attempts — light to dark by intensity</Typography>
                    {/* ActivityHeatmap might need props if it fetches its own data. 
              Let's check ActivityHeatmap.jsx. 
              It wasn't read in full, but based on Progress.jsx imports, it's used as <ActivityHeatmap />.
              If it fetches "my" activity, it might not work for admin viewing another student.
              I need to check ActivityHeatmap.jsx.
          */}
                    <ActivityHeatmap studentId={studentId} />
                </CardContent>
            </Card>

            {recommendations.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>Recommended for you</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Topics/courses to revisit based on quiz performance</Typography>
                        <Grid container spacing={1}>
                            {recommendations.map((r) => (
                                <Grid item xs={12} sm={6} key={`${r.course_id}-${r.quiz_id}`}>
                                    <Card variant="outlined" sx={{ p: 1.5 }}>
                                        <Typography variant="subtitle2">{r.course_title}</Typography>
                                        <Typography variant="body2" color="text.secondary">{r.quiz_title}</Typography>
                                        <Typography variant="caption" color="warning.main">Best score: {r.best_score}% (pass: {r.passing_score_pct}%)</Typography>
                                        <Box sx={{ mt: 0.5 }}>
                                            <Button size="small" onClick={() => navigate(isStudent ? `/student/courses/${r.course_id}` : `/admin/courses`)}>
                                                {isStudent ? 'Open course' : 'View Course'}
                                            </Button>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Overall</Typography>
                    <Typography color="text.secondary">
                        {overall.totalCompleted ?? 0} / {overall.totalLessons ?? 0} lessons completed
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={overall.completionPercentage ?? 0}
                        sx={{ mt: 1, height: 10, borderRadius: 1 }}
                    />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Engagement score: {(overall.engagementScore ?? 0).toFixed(2)}
                    </Typography>
                </CardContent>
            </Card>
            <Typography variant="h6" gutterBottom>By Course</Typography>
            <Grid container spacing={2}>
                {byCourse.map((c) => (
                    <Grid item xs={12} md={6} key={c.courseId}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1">{c.courseTitle}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {c.completedLessons} / {c.totalLessons} lessons • {c.timeSpentMinutes} min spent
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={c.completionPercentage ?? 0}
                                    sx={{ mt: 1, height: 8, borderRadius: 1 }}
                                />
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                    Engagement: {c.engagementScore?.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
