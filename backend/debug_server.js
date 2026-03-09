const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { pool } = require('./config/db');

const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found at 5002' });
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
});
