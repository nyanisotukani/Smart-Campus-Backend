const Room = require('../models/Room')
const Booking = require('../models/Booking')

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
}

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

// Check for overlapping bookings
const isOverlapping = async (roomId, date, startTime, endTime) => {
  const bookings = await Booking.find({ room: roomId, date });

  return bookings.some(booking =>
    (startTime < booking.endTime && endTime > booking.startTime)
  );
};

const createBooking = async (req, res) => {
  const { user, room, date, startTime, endTime, purpose } = req.body;

  if (await isOverlapping(room, date, startTime, endTime)) {
    return res.status(409).json({ message: 'Room already booked for selected time slot' });
  }

  const booking = new Booking({
    user,
    room,
    date,
    startTime,
    endTime,
    purpose,
  });

  await booking.save();
  res.status(201).json({ message: 'Booking successful', booking });
}

const getAllRooms = async (req, res) => {
    try {
      const rooms = await Room.find(); 
      res.status(200).json(rooms);     
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
    }
  };
  


module.exports = {createBooking, getAllRooms, addManyRooms, addRoom}