const express = require("express");
const xss = require("xss");
const { requireAuth } = require("../middleware/jwt-auth");
const ClientMgmtService = require("../Services/client-mgmt-service");
const CommentsService = require("../Services/comments-service");

const commentsRouter = express.Router();

commentsRouter
  .use(requireAuth);

const checkUserEx = async (req, res, next) => {
  const { is_admin, is_provider, id } = req.user;
  const { user_ex_id } = req.params;

  try {
    const ex = await ClientMgmtService.getUserExercise(req.app.get('db'), user_ex_id, null, true);

    if (!ex) return res.status(404).json({
      error: 'Exercise not found'
    });
    else if ( !is_admin && !is_provider && ex.user_id !== id) 
      return res.status(401).json({
        error: 'Unauthorized request'
      });

    req.userEx = ex;
    next();
  }
  catch(error) { next(error); }
};

commentsRouter
  .route('/:user_ex_id')
  .get(checkUserEx, async (req, res, next) => {
    const { id } = req.userEx;

    try {
      const comments = await CommentsService.getAllComments(req.app.get('db'), id);
      const cleanComments = await comments.map(el => {
        return {...el, comment_text: xss(el.comment_text)};
      });

      return res.status(200).json(cleanComments);
    }
    catch (error) { next(error); }
  })
  .post(checkUserEx, async (req, res, next) => {
    const { id } = req.userEx;
    const { comment_text } = req.body;
    const newComment = { user_exercise_id:id, user_id:req.user.id, comment_text };

    for (const [key, value] of Object.entries(newComment)) {
      if (value == null ) {
        return res.status(400).json({
          error: `Must have ${key} field in request body`
        });
      }
    }

    try {
      const newC = await CommentsService.createComment(req.app.get('db'), newComment);

      if (!newC) return res.status(400).json({
        error: 'Comment not created! Please try again.'
      });
      else return res.status(201).json(newC);
    }
    catch(error) { next(error); }
  });

const checkUserComment = async (req, res, next) => {
  const { is_admin, is_provider, id } = req.user;
  const { comment_id } = req.params;
  
  try {
    const comment = await CommentsService.getComment(req.app.get('db'), comment_id);

    if (!comment) return res.status(404).json({
      error: 'Exercise not found'
    });
    else if ( !is_admin && !is_provider && comment.user_id !== id) 
      return res.status(401).json({
        error: 'Unauthorized request'
      });
  
    req.comment = comment;
    next();
  }
  catch(error) { next(error); }
};

commentsRouter
  .route('/:comment_id')
  .patch(checkUserComment, async (req, res, next) => {
    const { id } = req.comment;
    const newData = req.body;

    try {
      const updated = await CommentsService.updateComment(req.app.get('db'), id, newData);
      
      if (!updated) return res.status(404).json({
        error: 'Comment not updated'
      });
      else return res.status(201).json(updated);
    }
    catch (error) { next(error); };
  })
  .delete(checkUserComment, async (req, res, next) => {
    const { id } = req.comment;

    try {
      const deleted = await CommentsService.deleteComment(req.app.get('db'), id);
      if (!deleted) return res.status(400).json({
        error: 'Comment not deleted'
      });

      else return res.status(204).end();
    }
    catch (error) { next(error); };
  });

module.exports = commentsRouter;