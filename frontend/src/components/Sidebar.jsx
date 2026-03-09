import { NavLink } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText, Drawer, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useAuth } from '../context/AuthContext';

export const drawerWidth = 240;

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/admin/users', label: 'Manage Users', icon: <PeopleIcon /> },
  { to: '/admin/courses', label: 'Manage Courses', icon: <MenuBookIcon /> },
];

const instructorLinks = [
  { to: '/instructor', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/instructor/courses', label: 'My Courses', icon: <MenuBookIcon /> },
  { to: '/instructor/reports', label: 'Reports', icon: <AssessmentIcon /> },
];

const studentLinks = [
  { to: '/student/courses', label: 'Courses', icon: <SchoolIcon /> },
  { to: '/student', label: 'Dashboard', icon: <DashboardIcon />, end: true },
  { to: '/student/progress', label: 'Progress', icon: <TrendingUpIcon /> },
  { to: '/student/notifications', label: 'Notifications', icon: <NotificationsIcon /> },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const links =
    user?.role === 'admin'
      ? adminLinks
      : user?.role === 'instructor'
        ? instructorLinks
        : studentLinks;

  const drawerContent = (
    <Box sx={{ pt: 2 }}>
      <List>
        {links.map(({ to, label, icon, end }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            end={end}
            onClick={onClose}
            sx={({ palette }) => ({
              '&.active': { backgroundColor: palette.primary.main, color: palette.primary.contrastText },
            })}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', mt: 7 },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
