const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/news.controller');
const middleware = require('../middlewares/authMiddleWare');

router.get('/feed', ctrl.getFeed);
router.get('/categories', ctrl.listCategoriesPublic);
router.get('/articles', ctrl.listArticlesPublic);
router.get('/articles/:slug', ctrl.getArticleBySlug);

router.get('/admin/categories', middleware.verifyAdmin, ctrl.listCategoriesAdmin);
router.post('/admin/categories', middleware.verifyAdmin, ctrl.createCategory);
router.put('/admin/categories/:id', middleware.verifyAdmin, ctrl.updateCategory);
router.delete('/admin/categories/:id', middleware.verifyAdmin, ctrl.deleteCategory);

router.get('/admin/articles', middleware.verifyAdmin, ctrl.listArticlesAdmin);
router.get('/admin/articles/:id', middleware.verifyAdmin, ctrl.getArticleByIdAdmin);
router.post('/admin/articles', middleware.verifyAdmin, ctrl.createArticle);
router.put('/admin/articles/:id', middleware.verifyAdmin, ctrl.updateArticle);
router.delete('/admin/articles/:id', middleware.verifyAdmin, ctrl.deleteArticle);

module.exports = router;
