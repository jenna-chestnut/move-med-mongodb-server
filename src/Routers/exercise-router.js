const express = require("express");
const ExerciseService = require("../Services/exercise-service");
const checkRestrictedAccess = require("../middleware/restricted-access");
const { requireAuth } = require("../middleware/jwt-auth");
const ClientMgmtService = require("../Services/client-mgmt-service");
const xss = require("xss");

const Exercises = require('../models/exercises')

const exercisesRouter = express.Router();

exercisesRouter
  .use(requireAuth);

exercisesRouter
  .route('/')
  .get(async (req, res, next) => {
    const { is_admin, is_provider, id } = req.user;

    Exercises.find({}, (err, companies) => {
      if (err) { next(err) }
      else return res.status(200).json(exercises)
     }
    )
  }

    // try {
    //   let exc = [];

    //   if (is_admin || is_provider) {
    //     let exercises = await ExerciseService
    //       .getAllExercises(req.app.get('db'));

    //     exercises = exercises.map(el => {
    //       return {
    //         ...el, 
    //         imgurl: xss(el.imgurl), 
    //         videourl: xss(el.videourl)};
    //     });
        
    //     // merge our categories into an array for each exercise
    //     exercises.forEach((e, idx) => {
    //       if (exercises[idx - 1]
    //         && exercises[idx - 1].id === e.id) {
    //         let len = exc.length - 1;
    //         exc[len] = {
    //           ...exc[len],
    //           body_part: 
    //             typeof exc[len].body_part !== 'string' 
    //               ? [e.body_part, ...exc[len].body_part] 
    //               : [e.body_part, exc[len].body_part]
    //         };
    //       }
    //       else exc.push(e);
    //     });
    //   }

    //   else {
    //     exc = await ClientMgmtService
    //       .getAllUserExercises(req.app.get('db'), id);
    //     const goal = await ClientMgmtService.getUserGoal(req.app.get('db'), id);

    //     exc = exc.map(el => {
    //       return {
    //         ...el, 
    //         imgurl: xss(el.imgurl), 
    //         videourl: xss(el.videourl)};
    //     });

    //     exc = {exercises: exc, goal};
    //   }

    //   if (!exc) return res.status(400).json({
    //     error: 'Exercises not found'
    //   });
    //   else return res.status(200).json(exc);
    // }
    // catch (error) {
    //   next(error);
    // }
  })
  .post(checkRestrictedAccess, async (req, res, next) => {
    const { exercise_name, imgurl, videourl } = req.body;
    const newExercise = { exercise_name, imgurl, videourl };

    for (const [key, value] of Object.entries(newExercise)) {
      if (value == null ) {
        return res.status(400).json({
          error: `Must have ${key} field in request body`
        });
      }
    }

    try {
      const newE = await ExerciseService.createExercise(req.app.get('db'), newExercise);

      if (!newE) return res.status(400).json({
        error: 'Exercise not created! Please try again.'
      });
      else return res.status(201).json(newE);
    }
    catch(error) { next(error); }
  });

exercisesRouter
  .route('/:ex_id')
  .get(async (req, res, next) => {
    const { is_admin, is_provider, id } = req.user;
    const { ex_id } = req.params;
    let exercise;

    try {
      if (is_admin || is_provider) {
        exercise = await ExerciseService.getExercise(req.app.get('db'), ex_id);
      }
      else {
        exercise = await ClientMgmtService.getUserExercise(req.app.get('db'), ex_id, id);
      }

      if (!exercise) return res.status(404).json({
        error: 'Exercise not found'
      });
      else return res.status(200).json({...exercise, imgurl: xss(exercise.imgurl), videourl: xss(exercise.videourl)});
    }
    catch (error) { next(error); }
  })
  .patch(checkRestrictedAccess, async (req, res, next) => {
    const { ex_id } = req.params;
    const newData = req.body;

    try {
      const updated = await ExerciseService.updateExercise(req.app.get('db'), ex_id, newData);
      
      if (!updated) return res.status(404).json({
        error: 'Exercise not found'
      });
      else return res.status(201).json(updated);
    }
    catch (error) { next(error); };
  })
  .delete(checkRestrictedAccess, async (req, res, next) => {
    const { ex_id } = req.params;

    try {
      const ex = await ExerciseService.getExercise(req.app.get('db'), ex_id);
      if (!ex) return res.status(404).json({
        error: 'Exercise not found'
      });

      const deleted = await ExerciseService.deleteExercise(req.app.get('db'), ex.id);
      if (!deleted) return res.status(400).json({
        error: 'Exercise not deleted'
      });

      else return res.status(204).end();
    }
    catch (error) { next(error); };
  });

module.exports = exercisesRouter;