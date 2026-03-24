const express = require('express');
const router = express.Router();
const caveController = require('../controllers/cave.controller');
const middleware = require('../middlewares/authMiddleWare');

// Public routes - anyone can view caves
router.get('/', caveController.getAllCaves);
router.get('/:id', caveController.getCaveById);

// Admin only routes - create, update, delete caves
router.post('/', middleware.verifyAdmin, caveController.createCave);
router.put('/:id', middleware.verifyAdmin, caveController.updateCave);
router.delete('/:id', middleware.verifyAdmin, caveController.deleteCave);

module.exports = router;
