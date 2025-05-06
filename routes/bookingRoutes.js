
const router = require('express').Router()
const {addRoom,
    addManyRooms,
    getAllRooms,
    createBooking,
    getAllBookings,
    getBookingsByUser,
    updateBookingStatus,
    deleteBooking } = require('../controllers/bookingController');
const checkRole = require('../middleware/authMiddleware');

router.post('/add-room', addRoom);
router.post('/', createBooking)
router.post('/add-many-rooms', addManyRooms)
router.get('/get-all-rooms', getAllRooms)


router.get('/bookings', checkRole('admin'), getAllBookings);
router.get('/bookings/user/:userId', checkRole('admin'), getBookingsByUser);
router.patch('/:id/status', checkRole('admin'), updateBookingStatus);
router.delete('/bookings/:id', checkRole('admin'), deleteBooking);

module.exports = router;
