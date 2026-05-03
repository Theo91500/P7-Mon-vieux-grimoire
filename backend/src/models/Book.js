const mongoose = require('mongoose');
// Ce fichier définit le modèle de données pour les livres, avec les champs suivants
const BookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    ratings: [
        {
            userId: { type: String, required: true },
            grade: { type: Number, required: true }
        }],
    averageRating: { type: Number }
});

module.exports = mongoose.model('Book', BookSchema);