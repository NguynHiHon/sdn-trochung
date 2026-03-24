const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const middleware = require('../middlewares/authMiddleWare');

router.get('/', ctrl.getPublicTree);

router.get('/admin/categories', middleware.verifyAdminOrStaff, ctrl.listCategories);
router.post('/admin/categories', middleware.verifyAdminOrStaff, ctrl.createCategory);
router.put('/admin/categories/:id', middleware.verifyAdminOrStaff, ctrl.updateCategory);
router.delete('/admin/categories/:id', middleware.verifyAdminOrStaff, ctrl.deleteCategory);

router.get('/admin/items', middleware.verifyAdminOrStaff, ctrl.listItems);
router.post('/admin/items', middleware.verifyAdminOrStaff, ctrl.createItem);
router.put('/admin/items/:id', middleware.verifyAdminOrStaff, ctrl.updateItem);
router.delete('/admin/items/:id', middleware.verifyAdminOrStaff, ctrl.deleteItem);

module.exports = router;
