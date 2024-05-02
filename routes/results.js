const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllResultsByExamId,
  getAllResultsByUserId,
  findResultByResultId,
  createResult,
  getExamScore,
  updateResult,
  deleteResult,
} = require("../services/result");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get Result by ResultId
  router.get("/result/:id", async (req, res) => {
    const resultId = req.params.id;
    try {
      const result = await findResultByResultId(resultId);
      if (!result) {
        res.status(400).json({
          message: `No Result found for this resultId - ${resultId}`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while listing result - ${resultId}`,
      });
    }
  });

  // Get Result By Exams
  router.get("/exams/result/:id", async (req, res) => {
    const examId = req.params.id;
    try {
      const result = await getAllResultsByExamId(examId);
      if (!result) {
        res.status(400).json({
          message: `No Result found for this exam Id - ${examId}`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        result,
      });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({
        message: `Error while listing result - ${examId}`,
      });
    }
  });

  // Get Result By Users
  router.get("/users/result/:id", async (req, res) => {
    const userId = req.params.id;
    try {
      const result = await getAllResultsByUserId(userId);
      if (!result) {
        res.status(400).json({
          message: `No Result found for this user Id - ${userId}`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        result,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while listing result - ${userId}: ${error}`,
      });
    }
  });

  // only Admin
  // Create Result
  router.post("/result", userMiddleware, async (req, res) => {
    const { admin, user } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const { registrationId, score } = req.body;
      if (!registrationId || !score) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const examScore = await getExamScore(registrationId);

      const result = await createResult({
        registrationId,
        score,
        percentage: parseFloat(parseFloat((score * 100) / examScore).toFixed(2)),
        creatorId: user.userId,
      });

      if (result) {
        res.status(200).json({
          message: `Result created successfully with resultId: ${result.resultId}`,
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
        const updatedResult = await updateResult({ resultId }, data);
        if (!updatedResult) {
          res.status(500).json({
            message: `Unable to update result.`,
          });
          return;
        }
        res.status(200).json({
          message: `Result updated successfully with resultId: ${result.resultId}`,
        });
      } else {
        res.status(500).json({
          message: `Unable to find result with id: ${resultId}`,
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
      const deletedResult = await deleteResult({ resultId });
      if (!deletedResult) {
        res.status(500).json({
          message: `Unable to delete result.`,
        });
        return;
      }
      res.status(200).json({
        message: `Result deleted successfully with resultId: ${deletedResult.resultId}`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting result: ${error}`,
      });
    }
  });

  return router;
};
