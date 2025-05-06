const Room = require('../models/Room');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Room management
const addRoom = async (req, res) => {
    try {
        const { name, type, location, capacity } = req.body;

        if (!name || !type || !location || !capacity) {
            return res.status(400).json({ message: 'Some fields are missing' });
        }

        const roomExist = await Room.findOne({ name });

        if (roomExist) {
            return res.status(409).json({ message: 'Room is already added' });
        }

        const newRoom = await Room.create({
            name,
            type,
            location,
            capacity
        });

        res.status(201).json({
            message: 'Room added successfully',
            room: newRoom
        });

    } catch (error) {
        res.status(500).json({
            message: 'An error occurred while adding room',
            error: error.message
        });
    }
};

const addManyRooms = async (req, res) => {
    try {
        const rooms = req.body;

        if (!Array.isArray(rooms) || rooms.length === 0) {
            return res.status(400).json({ message: 'Request body must be a non-empty array' });
        }

        const createdRooms = await Room.insertMany(rooms);
        res.status(201).json({
            message: `${createdRooms.length} rooms added successfully`,
            rooms: createdRooms
        });
    } catch (error) {
        res.status(500).json({ message: 'Error adding rooms', error: error.message });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find(); 
        res.status(200).json(rooms);     
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
    }
};

// Check for overlapping bookings
const isOverlapping = async (roomId, date, startTime, endTime) => {
    const bookings = await Booking.find({ 
        room: roomId, 
        date,
        status: { $ne: 'Declined' } // Only consider bookings that aren't declined
    });

    return bookings.some(booking =>
        (startTime < booking.endTime && endTime > booking.startTime)
    );
};

// Booking management
const createBooking = async (req, res) => {
    try {
        const { user, room, date, startTime, endTime, purpose } = req.body;

        if (!user || !room || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing required booking fields' });
        }

        // Check if the room exists
        const roomExists = await Room.findById(room);
        if (!roomExists) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check for overlapping bookings
        if (await isOverlapping(room, date, startTime, endTime)) {
            return res.status(409).json({ message: 'Room already booked for selected time slot' });
        }

        // Get user details if only ID is provided
        let userDetails = user;
        if (typeof user === 'string' || user instanceof mongoose.Types.ObjectId) {
            const userDoc = await User.findById(user);
            if (!userDoc) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            userDetails = {
                id: userDoc._id,
                name: userDoc.firstName,
                surname: userDoc.lastName,
                email: userDoc.email,
                role: userDoc.role
            };
        }

        const booking = new Booking({
            user: userDetails,
            room,
            date,
            startTime,
            endTime,
            purpose,
            status: 'Pending'
        });

        await booking.save();
        res.status(201).json({ message: 'Booking successful', booking });
    } catch (error) {
        res.status(500).json({ 
            message: 'An error occurred while creating booking',
            error: error.message
        });
    }
};

const getAllBookings = async (req, res) => {
    try {
        // Populate room details for each booking
        const bookings = await Booking.find()
            .populate('room', 'name type location capacity')
            .sort({ createdAt: -1 }); // Most recent first

        // Format the response
        const formattedBookings = bookings.map(booking => {
            return {
                _id: booking._id,
                user: booking.user,
                roomDetails: booking.room,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                purpose: booking.purpose,
                status: booking.status || 'Pending',
                createdAt: booking.createdAt
            };
        });

        res.status(200).json(formattedBookings);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch bookings', 
            error: error.message 
        });
    }
};

const getBookingsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Find bookings where user id matches
        const bookings = await Booking.find({ 'user.id': userId })
            .populate('room', 'name type location capacity')
            .sort({ date: 1, startTime: 1 }); // Sort by date and time
        
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to fetch user bookings', 
            error: error.message 
        });
    }
};

const updateBookingStatus = async (req, res) => {
    try {
      console.log('Request body:', req.body); // Log the request body
        const { id } = req.params;
        const { status } = req.body;
        
         
         
         
        if (!['Pending', 'Accepted', 'Declined'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const booking = await Booking.findById(id);
        console.log('Booking:', booking);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        booking.status = status;
        await booking.save();
        
        res.status(200).json({ 
            message: 'Booking status updated successfully',
            booking 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to update booking status', 
            error: error.message 
        });
    }
};

const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        
        const booking = await Booking.findById(id);
        
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        
        await Booking.findByIdAndDelete(id);
        
        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Failed to delete booking', 
            error: error.message 
        });
    }
};

module.exports = {
    // Room endpoints
    addRoom,
    addManyRooms,
    getAllRooms,
    
    // Booking endpoints
    createBooking,
    getAllBookings,
    getBookingsByUser,
    updateBookingStatus,
    deleteBooking
};