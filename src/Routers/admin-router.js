const express = require("express");
const { requireAuth } = require("../middleware/jwt-auth");
const User = require("../models/user.model");

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
      const users = await User.find().lean();

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

  try {
    const user = await User.findOne({_id: user_id}).lean();

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
    const { _id } = req.foundUser;
    const data = req.body;

    try {
      const updated = await User.updateOne({_id}, (data));
      if (!updated) return res.status(400).json({
        error: 'User not updated'
      });

      else return res.status(201).send('Content updated!');
    }
    catch (error) { next(error); };
  })
  .delete(checkForUser, async (req, res, next) => {
    const { _id } = req.foundUser;

    try {
      const deleted = await User.deleteOne({_id});
      if (!deleted) return res.status(400).json({
        error: 'User not deleted'
      });

      else return res.status(204).end();
    }
    catch (error) { next(error); };
  });

module.exports = adminRouter;