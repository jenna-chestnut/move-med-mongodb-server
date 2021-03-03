/* eslint-disable eqeqeq */
const express = require('express');
const AuthService = require('../middleware/auth-service');
const { requireAuth } = require("../middleware/jwt-auth");
const UserValService = require('../Services/user-validation-service');

const registerRouter = express.Router();

registerRouter
  .use(requireAuth)
  .use((req, res, next) => {
    const { is_admin } = req.user;

    if (!is_admin) return res.status(401).json({ 
      error: 'Unauthorized request' 
    });
    else next();
  });

registerRouter
  .route('/register')
  .post((req, res, next) => {
    const { full_name, user_name, password, is_admin, is_provider } = req.body;
    const regUser = { full_name, user_name, password, is_admin, is_provider };

    for (const [key, value] of Object.entries(regUser)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    }

    const passwordError = UserValService.validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ error: passwordError});
    }
    
    return AuthService.getUserWithUserName(
      req.app.get('db'),
      regUser.user_name
    ).then(user => {
      if (user) {
        return res.status(400).json({
          error: 'User name not available'
        });
      } 

      return AuthService.createUser(
        req.app.get('db'), regUser
      ).then(newUser => {
        if (!newUser) {
          return res.status(400).json({
            error: 'User not created, please try again'
          });
        }

        delete newUser.password;
        return res.status(201).send(newUser);
      });
    }).catch(next);
  });

module.exports = registerRouter;
