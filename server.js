const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const connectDB = require('./config/db')
const authRoutes = require('./routes/authRoutes')
const adminRoutes = require('./routes/adminRoutes')
const maintenanceRoutes = require('./routes/maintenanceRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
require('dotenv').config()

const app = express();

connectDB()

app.use(cors())
app.use(bodyParser.json())
app.use(morgan('dev'))

app.get('/', (req, res) => {
    res.send('<h1>Smart Campus API is running</h1>')
})

//Auth Routes
app.use('/api/auth', authRoutes);

//Admin routes
app.use('/api/admin', adminRoutes)

//Maintenance Routes
app.use('/api/maintenance', maintenanceRoutes);


//Booking Routes
app.use('/api/booking', bookingRoutes)


//Announcement Routes

app.use('/api/announcement', announcementRoutes)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})