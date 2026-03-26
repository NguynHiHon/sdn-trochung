const express = require('express');
const router = express.Router();
const caveController = require('../controllers/cave.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');
const runValidation = require('../middlewares/runValidation');
const { validateCaveCreate, validateCaveUpdate } = require('../validators/adminCrud.validator');

router.get('/', caveController.getAllCaves);
router.get('/:id', caveController.getCaveById);
router.post('/', authMiddleWare.verifyAdmin, runValidation(validateCaveCreate), caveController.createCave);
router.put('/:id', authMiddleWare.verifyAdmin, runValidation(validateCaveUpdate), caveController.updateCave);
router.delete('/:id', authMiddleWare.verifyAdmin, caveController.deleteCave);

module.exports = router;
