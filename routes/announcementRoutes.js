const announcementController = require('../controllers/announcementController');
const express = require('express');
const router = express.Router();

router.post('/create', announcementController.createAnnouncement);

module.exports = router;