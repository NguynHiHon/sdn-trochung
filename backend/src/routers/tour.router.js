const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tour.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');
const runValidation = require('../middlewares/runValidation');
const { validateTourCreate, validateTourUpdate } = require('../validators/adminCrud.validator');

router.get('/', tourController.getAllTours);
router.get('/:id', tourController.getTourById);
router.post('/', authMiddleWare.verifyAdmin, runValidation(validateTourCreate), tourController.createTour);
router.put('/:id', authMiddleWare.verifyAdmin, runValidation(validateTourUpdate), tourController.updateTour);
router.delete('/:id', authMiddleWare.verifyAdmin, tourController.deleteTour);

module.exports = router;
