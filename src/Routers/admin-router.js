const express = require("express");
const { requireAuth } = require("../middleware/jwt-auth");
const UserService = require("../Services/user-service");

const adminRouter = express.Router();

adminRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    const { is_admin } = req.user;

    if (!is_admin) return res.status(401).json({ 
      error: 'Unauthorized request' 
    });
    else next();
  });

adminRouter
  .route('/')
  .get(async (req, res, next) => {
    try {
      const users = await UserService.getAllUsers(req.app.get('db'));

      if (!users) return res.status(404).json({error: 'Users not found'});
      else {
        let usersToSend = users.map(el => {
          const { password, ...rest } = el;
          return rest;
        });
        return res.status(200).json(usersToSend);
      }
    }
    catch(error) { next(error); };
  });

const checkForUser = async (req, res, next) => {
  const { user_id } = req.params;
  const db = req.app.get('db');

  try {
    const user = await UserService.getUser(db, user_id);

    if (!user) return res.status(404).json({
      error: 'user not found'
    });

    else {
      const { password, ...rest } = user;
      req.foundUser = rest;
    }
    next();
  }
  catch(error) { next(error); };
};

adminRouter
  .route('/:user_id')
  .get(checkForUser, (req, res, next) => {
    return res.status(200).json(req.foundUser);
  })
  .patch(checkForUser, async (req, res, next) => {
    const { id } = req.foundUser;
    const data = req.body;

    if ( parseInt(id) >= 1 && parseInt(id) <= 5 ) {
      return res.status(400).json({
        error: { message: 'Demo user details cannot be changed' }
      });
    }

    try {
      const updated = await UserService.updateUser(req.app.get('db'), id, data);
      if (!updated) return res.status(400).json({
        error: 'User not updated'
      });

      else return res.status(201).send('Content updated!');
    }
    catch (error) { next(error); };
  })
  .delete(checkForUser, async (req, res, next) => {
    const { id } = req.foundUser;

    if ( parseInt(id) >= 1 && parseInt(id) <= 5 ) {
      return res.status(400).json({
        error: { message: 'Demo users cannot be deleted' }
      });
    }

    try {
      const deleted = await UserService.deleteUser(req.app.get('db'), id);
      if (!deleted) return res.status(400).json({
        error: 'User not deleted'
      });

      else return res.status(204).end();
    }
    catch (error) { next(error); };
  });

module.exports = adminRouter;