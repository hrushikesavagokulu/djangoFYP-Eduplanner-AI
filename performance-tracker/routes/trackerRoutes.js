const express = require('express');
const router = express.Router();
const trackerController = require('../controllers/trackerController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * Routes for tracker operations.
 * All routes are protected by authMiddleware.
 */
router.use(authMiddleware);

router.post('/init', trackerController.init);
router.get('/data', trackerController.getData);
router.post('/add-task', trackerController.addTask);
router.post('/toggle', trackerController.toggle);
router.post('/add-day', trackerController.addDay);
router.post('/remove-day', trackerController.removeDay);
router.post('/delete-task', trackerController.deleteTask);
router.post('/reset', trackerController.reset);
router.get('/charts', trackerController.getCharts);

module.exports = router;
