const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = (req, res, next) => {
  const email = String(req.body.email || '').trim();
  const atIndex = email.indexOf('@');

  // en gros ca refuse: si pas de @, ou rien avant @, ou rien après @
  if (atIndex <= 0 || atIndex === email.length - 1) {
    return res.status(400).json({ message: 'Email invalide.' });
  }

// Permet de hasher le mot de passe avant de le stocker dans la base de données
  bcrypt.hash(req.body.password, 10)
    .then(hash => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

// Permet de vérifier que l'utilisateur existe et que le mot de passe est correct, puis de lui attribuer un token d'authentification    
exports.login = (req, res, next) => {
   User.findOne({ email: req.body.email })
       .then(user => {
           if (!user) {
               return res.status(401).json({ error: 'Utilisateur non trouvé !' });
           }
           bcrypt.compare(req.body.password, user.password)
               .then(valid => {
                   if (!valid) {
                       return res.status(401).json({ error: 'Mot de passe incorrect !' });
                   }
                   res.status(200).json({
                       userId: user._id,
                       token: jwt.sign(
                           { userId: user._id },
                           'RANDOM_TOKEN_SECRET',
                           { expiresIn: '24h' }
                       )
                   });
               })
               .catch(error => res.status(500).json({ error: error.message }));
       })
       .catch(error => res.status(500).json({ error: error.message }));
};