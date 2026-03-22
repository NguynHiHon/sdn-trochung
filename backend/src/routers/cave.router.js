const express = require('express');
const router = express.Router();
const caveController = require('../controllers/cave.controller');

router.get('/', caveController.getAllCaves);
router.get('/:id', caveController.getCaveById);
router.post('/', caveController.createCave);
router.put('/:id', caveController.updateCave);
router.delete('/:id', caveController.deleteCave);

module.exports = router;
