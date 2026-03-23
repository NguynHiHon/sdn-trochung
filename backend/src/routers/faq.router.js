const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const middleware = require('../middlewares/authMiddleWare');

router.get('/', ctrl.getPublicTree);

router.get('/admin/categories', middleware.verifyAdmin, ctrl.listCategories);
router.post('/admin/categories', middleware.verifyAdmin, ctrl.createCategory);
router.put('/admin/categories/:id', middleware.verifyAdmin, ctrl.updateCategory);
router.delete('/admin/categories/:id', middleware.verifyAdmin, ctrl.deleteCategory);

router.get('/admin/items', middleware.verifyAdmin, ctrl.listItems);
router.post('/admin/items', middleware.verifyAdmin, ctrl.createItem);
router.put('/admin/items/:id', middleware.verifyAdmin, ctrl.updateItem);
router.delete('/admin/items/:id', middleware.verifyAdmin, ctrl.deleteItem);

module.exports = router;
