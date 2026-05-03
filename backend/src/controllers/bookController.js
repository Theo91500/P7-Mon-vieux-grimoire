const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(400).json({ error });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        res.status(200).json(book);
    } catch (error) {
        res.status(404).json({ error });
    }
};

exports.getBestRating = async (req, res) => {
    try {
        const bestBooks = await Book.find().sort({ averageRating: -1 }).limit(3);
        res.status(200).json(bestBooks);
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Permet de créer un livre, en vérifiant que l'utilisateur est authentifié, puis stocke tout dans la base de données.
exports.createBook = async (req, res) => {
    try {
        console.log(req.file);
        console.log(req.body.book);
        const bookData = JSON.parse(req.body.book);
        delete bookData._id;
        delete bookData._userId;

        const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

        const book = new Book({
            ...bookData,
            userId: req.auth.userId,
            imageUrl,
            ratings: [],
            averageRating: 0,
        });

        await book.save();
        res.status(201).json({ message: 'Livre créé avec succès !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Permet de modifier un livre, en vérifiant que l'utilisateur est le propriétaire du livre, puis modifie tout dans la base de données.
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: 'Requête non autorisée.' });
        }

        const bookObject = req.file
            ? {
                ...JSON.parse(req.body.book),
                imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
            }
            : { ...req.body };

        delete bookObject._userId;

        await Book.updateOne({ _id: req.params.id }, { ...bookObject });
        res.status(200).json({ message: 'Livre modifié avec succès !' });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// Permet de supprimer un livre, en vérifiant propriétaire du livre, puis supprime tout dans la base de données.
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });

        if (book.userId !== req.auth.userId) {
            return res.status(403).json({ message: 'Requête non autorisée.' });
        }

        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, async () => {
            await Book.deleteOne({ _id: req.params.id });
            res.status(200).json({ message: 'Livre supprimé avec succès !' });
        });
    } catch (error) {
        res.status(400).json({ error });
    }
};
// Permet de noter un livre, en vérifiant que la note est valide et que l'utilisateur n'a pas déjà noté le livre, puis recalcule la note moyenne du livre (en entier)
exports.addRating = async (req, res) => {
    try {
        const book = await Book.findOne({ _id: req.params.id });
        const userId = req.auth.userId;
        const { rating } = req.body;
        const ratingNumber = Number(rating);

        if (!Number.isInteger(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
            return res.status(400).json({ message: 'La note doit être un entier entre 0 et 5.' });
        }

        if (book.ratings.find(r => r.userId === userId)) {
            return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
        }

        book.ratings.push({ userId, grade: ratingNumber });
        book.averageRating = (
            book.ratings.reduce((acc, r) => acc + r.grade, 0) / book.ratings.length
        ).toFixed(1);

        await book.save();
        res.status(200).json(book);
    } catch (error) {
        res.status(400).json({ error });
    }
};
