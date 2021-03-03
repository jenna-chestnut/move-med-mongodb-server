const express = require("express");
const checkRestrictedAccess = require("../middleware/restricted-access");
const { requireAuth } = require("../middleware/jwt-auth");
const ClientMgmtService = require("../Services/client-mgmt-service");
const xss = require("xss");

const clientMgmtRouter = express.Router();

clientMgmtRouter
  .use(requireAuth)
  .use(checkRestrictedAccess);

clientMgmtRouter
  .route('/exercises/:client_id')
  .post(async (req, res, next) => {
    const { exercise_id, user_id, provider_id, frequency,
      duration, add_note } = req.body;
    const newExercise = { exercise_id, user_id, provider_id, frequency,
      duration, add_note };

    for (const [key, value] of Object.entries(newExercise)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    } 
    
    try {
      const newE = await ClientMgmtService.createUserExercise(req.app.get('db'), newExercise);

      if (!newE) return res.status(400).json({
        error: 'Exercise not createed! Please try again.'
      });
      else return res.status(201).json(newE);
    }
    catch(error) { next(error); }
  });

clientMgmtRouter
  .route('/exercises/:user_ex_id')
  .get(async (req, res, next) => {
    const { user_ex_id } = req.params;
    try {
      const ex = await ClientMgmtService.getUserExercise(req.app.get('db'), user_ex_id, null, true);
      if (!ex) return res.status(404).json({
        error: 'Exercise not found'
      });
      else return res.status(200).json({...ex, imgurl: xss(ex.imgurl), videourl: xss(ex.videourl)});
    }
    catch(err) { next(err); }
  })

  .patch(async (req, res, next) => {
    const { user_ex_id } = req.params;
    const {add_note, frequency, duration} = req.body;
    const newData = {};
    if (add_note) newData['add_note'] = add_note;
    if (frequency) newData['frequency'] = frequency;
    if (duration) newData['duration'] = duration;
 

    try {
      const updated = await ClientMgmtService.updateUserExercise(req.app.get('db'), user_ex_id, newData);
      
      if (!updated) return res.status(404).json({
        error: 'Exercise not found'
      });
      else return res.status(201).json(updated);
    }
    catch (error) { next(error); };
  })
  .delete(checkRestrictedAccess, async (req, res, next) => {
    const { user_ex_id } = req.params;

    try {
      const ex = await ClientMgmtService.getUserExercise(req.app.get('db'), user_ex_id, null, true);
      if (!ex) return res.status(404).json({
        error: 'Exercise not found'
      });

      const deleted = await ClientMgmtService.deleteUserExercise(req.app.get('db'), ex.id);
      if (!deleted) return res.status(400).json({
        error: 'Exercise not deleted'
      });

      else return res.status(204).end();
    }
    catch (error) { next(error); };
  });

clientMgmtRouter
  .route('/goal')
  .post(async (req, res, next) => {
    const { goal_text, user_id } = req.body;
    const newGoal = { user_id, goal_text };

    for (const [key, value] of Object.entries(newGoal)) {
      if (value == null) {
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
      }
    } 
    
    try {
      const goal = await ClientMgmtService.getUserGoal(req.app.get('db'), user_id);
      if (goal) return res.status(400).json({
        error: 'Client goal already exists'
      });

      const newG = await ClientMgmtService.createUserGoal(req.app.get('db'), newGoal);
      if (!newG) return res.status(400).json({
        error: 'Goal not created! Please try again.'
      });
      else return res.status(201).json(newG);
    }
    catch(error) { next(error); }
  });

clientMgmtRouter
  .route('/goal/:user_id')
  .patch(checkRestrictedAccess, async (req, res, next) => {
    const { user_id } = req.params;
    const newData = req.body;

    try {
      const updated = await ClientMgmtService.updateUserGoal(req.app.get('db'), user_id, newData);
      
      if (!updated) return res.status(404).json({
        error: 'Goal not updated'
      });
      else return res.status(201).json(updated);
    }
    catch (error) { next(error); };
  });

module.exports = clientMgmtRouter;