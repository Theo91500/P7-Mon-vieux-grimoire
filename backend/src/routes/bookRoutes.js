const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/bookController');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// Lecture
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRating);
router.get('/:id', bookCtrl.getBookById);

// Écriture
router.post('/', auth, multer, bookCtrl.createBook);
router.put('/:id', auth, multer, bookCtrl.updateBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

// Notation
router.post('/:id/rating', auth, bookCtrl.addRating);

module.exports = router;
