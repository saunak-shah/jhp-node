const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllResultsByCourseId,
  getAllResultsByUserId,
  findResultByResultId,
  createResult,
  getCourseScore,
  updateResult,
  deleteResult,
} = require("../services/result");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get Result by ResultId
  router.get("/result/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await findResultByResultId(id);
      if (!result) {
        res.status(400).json({
          message: `No Result found`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while listing result - ${id}`,
      });
    }
  });

  // Get Result By Courses
  router.get("/courses/result/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await getAllResultsByCourseId(id);
      if (!result) {
        res.status(400).json({
          message: `No Result found`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: result,
      });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({
        message: `Error while listing result - ${id}`,
      });
    }
  });

  // Get Result By Users
  router.get("/users/result/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const result = await getAllResultsByUserId(id);
      if (!result) {
        res.status(400).json({
          message: `No Result found`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while listing result - ${id}: ${error}`,
      });
    }
  });

  // only Admin
  // Create Result
  router.post("/result", userMiddleware, async (req, res) => {
    const { admin, user } = req.body;
    ("🚀 ~ file: results.js:87 ~ router.post ~ admin, user:", admin, user)
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const { registration_id, score } = req.body;
      if (!registration_id || !score) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const courseScores = await getCourseScore(registration_id);

      const result = await createResult({
        registration_id,
        score,
        creator_id: user.id,
        course_score: courseScores.course_score,
        course_passing_score: parseInt(courseScores.course_passing_score)
      });

      if (result) {
        res.status(200).json({
          message: `Result created successfully`,
          data: result
        });
      } else {
        res.status(500).json({
          message: `Unable to create result`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating result: ${error}`,
      });
    }
  });

  // only Admin
  // Update Result
  router.put("/result/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const resultId = req.params.id;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const { data } = req.body;
      const result = await findResultByResultId(resultId);
      if (result) {
        const updatedResult = await updateResult({ id: resultId }, data);
        if (!updatedResult) {
          res.status(500).json({
            message: `Unable to update result.`,
          });
          return;
        }
        res.status(200).json({
          message: `Result updated successfully`,
          data: updatedResult
        });
      } else {
        res.status(500).json({
          message: `Unable to find result`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating result: ${error}`,
      });
    }
  });

  // only Admin
  // Delete Result
  router.delete("/result/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const resultId = req.params.id;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const deletedResult = await deleteResult({ id: resultId });
      if (!deletedResult) {
        res.status(500).json({
          message: `Unable to delete result.`,
        });
        return;
      }
      res.status(200).json({
        message: `Result deleted successfully`,
        data: deletedResult
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting result: ${error}`,
      });
    }
  });

  return router;
};
