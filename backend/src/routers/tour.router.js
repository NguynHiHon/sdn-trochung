const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.post('/', authMiddleWare.verifyAdmin, tourController.createTour);
router.put('/:id', authMiddleWare.verifyAdmin, tourController.updateTour);
router.delete('/:id', authMiddleWare.verifyAdmin, tourController.deleteTour);

module.exports = router;
