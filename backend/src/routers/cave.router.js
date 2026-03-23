const express = require('express');
const router = express.Router();
const caveController = require('../controllers/cave.controller');
const authMiddleWare = require('../middlewares/authMiddleWare');

router.get('/', caveController.getAllCaves);
router.get('/:id', caveController.getCaveById);
router.post('/', authMiddleWare.verifyAdmin, caveController.createCave);
router.put('/:id', authMiddleWare.verifyAdmin, caveController.updateCave);
router.delete('/:id', authMiddleWare.verifyAdmin, caveController.deleteCave);

module.exports = router;
