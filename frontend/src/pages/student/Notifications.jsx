import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getNotifications, markNotificationRead } from '../../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    getNotifications()
      .then((res) => setNotifications(res.data.data.notifications || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed'))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (_) {}
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Notifications</Typography>
      <Paper>
        <List>
          {notifications.length === 0 && (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          )}
          {notifications.map((n) => (
            <ListItem key={n.id} disablePadding divider>
              <ListItemButton onClick={() => !n.is_read && handleMarkRead(n.id)}>
                <ListItemText
                  primary={n.message}
                  secondary={new Date(n.created_at).toLocaleString()}
                  sx={{ opacity: n.is_read ? 0.7 : 1 }}
                />
                {!n.is_read && <Chip label="New" size="small" color="primary" />}
                <Chip label={n.type} size="small" variant="outlined" sx={{ ml: 1 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
