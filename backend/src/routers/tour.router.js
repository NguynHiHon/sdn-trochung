const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const middleware = require('../middlewares/authMiddleWare');

// Public routes - anyone can view tours
router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);

// Admin only routes - create, update, delete tours
router.post('/', middleware.verifyAdmin, tourController.createTour);
router.put('/:id', middleware.verifyAdmin, tourController.updateTour);
router.delete('/:id', middleware.verifyAdmin, tourController.deleteTour);

module.exports = router;
