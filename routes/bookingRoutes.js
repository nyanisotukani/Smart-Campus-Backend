
const router = require('express').Router()
const {createBooking, getAllRooms, addManyRooms, addRoom} = require('../controllers/bookingController')

router.post('/add-room', addRoom);
router.post('/', createBooking)
router.post('/add-many-rooms', addManyRooms)
router.get('/get-all-rooms', getAllRooms)
module.exports = router;