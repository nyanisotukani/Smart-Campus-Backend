const Announcement = require('../models/Announcement');


const createAnnouncement =  async (req, res) => {
  try {
    const { userId, name, surname, title, message, category } = req.body;

    if (!userId || !name || !surname || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAnnouncement = new Announcement({
      userId,
      name,
      surname,
      title,
      message,
      category
    });

    await newAnnouncement.save();
    res.status(201).json({ message: 'Announcement posted successfully', announcement: newAnnouncement });
  } catch (error) {
    console.error('Error posting announcement:', error);
    res.status(500).json({ error: 'Server error while posting announcement' });
  }
}

module.exports = {createAnnouncement};
