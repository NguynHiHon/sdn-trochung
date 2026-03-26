const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/news.controller');
const middleware = require('../middlewares/authMiddleWare');
const { body, param, validationResult } = require('express-validator');

const runValidation = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            await validation.run(req);
        }
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
        }
        next();
    };
};

const categoryCreateValidators = [
    body('slug').trim().notEmpty().withMessage('slug danh mục là bắt buộc'),
    body('name.vi').trim().notEmpty().withMessage('Tên danh mục (VI) là bắt buộc'),
    body('name.en').trim().notEmpty().withMessage('Tên danh mục (EN) là bắt buộc'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

const categoryUpdateValidators = [
    param('id').isMongoId().withMessage('ID danh mục không hợp lệ'),
    body('slug').optional().trim().notEmpty().withMessage('slug danh mục không được để trống'),
    body('name.vi').optional().trim().notEmpty().withMessage('Tên danh mục (VI) không được để trống'),
    body('name.en').optional().trim().notEmpty().withMessage('Tên danh mục (EN) không được để trống'),
    body('sortOrder').optional().isInt({ min: 0 }).withMessage('sortOrder không hợp lệ'),
];

const articleCreateValidators = [
    body('categoryId').isMongoId().withMessage('categoryId không hợp lệ'),
    body('slug').trim().notEmpty().withMessage('slug bài viết là bắt buộc'),
    body('title.vi').trim().notEmpty().withMessage('Tiêu đề (VI) là bắt buộc'),
    body('title.en').trim().notEmpty().withMessage('Tiêu đề (EN) là bắt buộc'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('status bài viết không hợp lệ'),
];

const articleUpdateValidators = [
    param('id').isMongoId().withMessage('ID bài viết không hợp lệ'),
    body('categoryId').optional().isMongoId().withMessage('categoryId không hợp lệ'),
    body('slug').optional().trim().notEmpty().withMessage('slug bài viết không được để trống'),
    body('title.vi').optional().trim().notEmpty().withMessage('Tiêu đề (VI) không được để trống'),
    body('title.en').optional().trim().notEmpty().withMessage('Tiêu đề (EN) không được để trống'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('status bài viết không hợp lệ'),
];

router.get('/feed', ctrl.getFeed);
router.get('/categories', ctrl.listCategoriesPublic);
router.get('/articles', ctrl.listArticlesPublic);
router.get('/articles/:slug', ctrl.getArticleBySlug);

router.get('/admin/categories', middleware.verifyAdmin, ctrl.listCategoriesAdmin);
router.post('/admin/categories', middleware.verifyAdmin, runValidation(categoryCreateValidators), ctrl.createCategory);
router.put('/admin/categories/:id', middleware.verifyAdmin, runValidation(categoryUpdateValidators), ctrl.updateCategory);
router.delete('/admin/categories/:id', middleware.verifyAdmin, runValidation([param('id').isMongoId().withMessage('ID danh mục không hợp lệ')]), ctrl.deleteCategory);

router.get('/admin/articles', middleware.verifyAdmin, ctrl.listArticlesAdmin);
router.get('/admin/articles/:id', middleware.verifyAdmin, runValidation([param('id').isMongoId().withMessage('ID bài viết không hợp lệ')]), ctrl.getArticleByIdAdmin);
router.post('/admin/articles', middleware.verifyAdmin, runValidation(articleCreateValidators), ctrl.createArticle);
router.put('/admin/articles/:id', middleware.verifyAdmin, runValidation(articleUpdateValidators), ctrl.updateArticle);
router.delete('/admin/articles/:id', middleware.verifyAdmin, runValidation([param('id').isMongoId().withMessage('ID bài viết không hợp lệ')]), ctrl.deleteArticle);

module.exports = router;
