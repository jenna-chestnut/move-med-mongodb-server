const express = require("express");
const checkRestrictedAccess = require("../middleware/restricted-access");
const { requireAuth } = require("../middleware/jwt-auth");
const UserService = require("../Services/user-service");
const ClientMgmtService = require("../Services/client-mgmt-service");

const clientsRouter = express.Router();

clientsRouter
  .use(requireAuth)
  .use(checkRestrictedAccess);

clientsRouter
  .route('/')
  .get(async (req, res, next) => {
    try {
      const clients = await UserService.getAllClients(req.app.get('db'));

      let clientsToSend = clients.map(el => {
        const { password, ...rest } = el;
        return rest;
      });

      if (!clients) return res.status(404).json({error: 'clients not found'});
      else return res.status(200).json(clientsToSend);
    }
    catch(error) { next(error); };
  });

clientsRouter
  .route('/:client_id')
  .get(async (req, res, next) => {
    const { client_id } = req.params;
    const db = req.app.get('db');

    try {
      const client = await UserService.getUser(db, client_id);
      const clientExercises = await ClientMgmtService.getAllUserExercises(db, client_id);
      const clientGoal = await ClientMgmtService.getUserGoal(db, client_id);

      if (!client) return res.status(404).json({
        error: 'client not found'
      });
      else if (!clientExercises) return res.status(404).json({
        error: 'client exercises not found'
      });

      else {
        const { password, ...rest } = client;
        return res.status(200).json({ client : rest, clientExercises, clientGoal });
      }
    }
    catch(error) { next(error); };
  });

module.exports = clientsRouter;