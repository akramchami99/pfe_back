const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', fileRoutes);
app.use('/api', userRoutes);
app.use('/api', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
