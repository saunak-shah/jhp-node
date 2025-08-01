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
  getAllResultsByCourseIdCount,
  getAllResultsByUserIdCount,
  getAllResultsByCourseIdToDownload,
  findResultByRegistrationId,
} = require("../services/result");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get Result by ResultId
  router.get("/result/:id", userMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    try {
      const result = await findResultByResultId(id);
      if (!result) {
        res.status(422).json({
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

  // student exam result check
  router.post("/student/exam/result", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const studentId = student?.student_id;
    try {
      // Extract necessary data from request body
      const {
        reg_id,
      } = req.body;

      if (
        !student ||
        !reg_id
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }

      const result = await findResultByRegistrationId(reg_id);
      if(!result){
        res.status(422).json({
          message: `Invalid registration number..`,
        });
        return;
      }

      // apply student and request student should same log
      if((result.student_apply_course?.student_id) !== parseInt(studentId)){
        res.status(422).json({
          message: `Invalid information provided.`,
        });
        return;
      }

      if (!result) {
        res.status(422).json({
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
        message: `Error while creating course : ${error}`,
      });
      return;
    }
  });


  router.get("/application/result/:id", userMiddleware, async (req, res) => {
    const id = req.params.id;
    try {
      const result = await findResultByRegistrationId(id);
      if (!result) {
        res.status(200).json({
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
  router.get("/courses/result/:id", userMiddleware, async (req, res) => {
    const { id } = req.params;
    const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

    try {
      const resultCount = await getAllResultsByCourseIdCount(id);
      const result = await getAllResultsByCourseId(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );

      if (!result) {
        res.status(422).json({
          message: `No Result found`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: {
          result,
          offset,
          totalCount: resultCount,
        },
      });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({
        message: `Error while listing result - ${id}`,
      });
    }
  });

  // Get Result By Courses
  router.get(
    "/download/courses/result/:id",
    userMiddleware,
    async (req, res) => {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      try {
        const resultCount = await getAllResultsByCourseIdCount(id);
        const result = await getAllResultsByCourseIdToDownload(
          searchKey,
          sortBy,
          id,
          sortOrder,
          limit,
          offset
        );

        if (!result) {
          res.status(422).json({
            message: `No Result found`,
          });
          return;
        }
        res.status(200).json({
          message: `Result found`,
          data: {
            result,
            offset,
            totalCount: resultCount,
          },
        });
      } catch (error) {
        console.error("Error getting results:", error);
        res.status(500).json({
          message: `Error while listing result - ${id}`,
        });
      }
    }
  );

  // Get Result By User Id
  router.get("/students/result/:id", userMiddleware, async (req, res) => {
    const { id } = req.params;
    const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

    try {
      const resultCount = await getAllResultsByUserIdCount(id);
      const results = await getAllResultsByUserId(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );
      if (!results) {
        res.status(422).json({
          message: `No Result found`,
        });
        return;
      }
      res.status(200).json({
        message: `Result found`,
        data: {
          results,
          offset,
          totalCount: resultCount,
        },
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
    const { admin, student, teacher } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      
      const { data } = req.body;
      if (!data) {
        throw new Error(`Unable to find data`);
      }
      const { student_apply_course_id, score } = data;
      if (!student_apply_course_id || !score) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const courseScores = await getCourseScore(
        parseInt(student_apply_course_id)
      );
      if (!courseScores) {
        res.status(422).json({
          message: `Invalid application id`,
        });
        return;
      }

      const result = await createResult({
        reg_id: courseScores.reg_id,
        score: parseInt(score),
        creator_id: parseInt(teacher.teacher_id),
        course_score: parseInt(courseScores.total_marks),
        course_passing_score: parseInt(courseScores.passing_score),
      });

      if (result) {
        res.status(200).json({
          message: `Result updated successfully`,
          data: result,
        });
      } else {
        res.status(500).json({
          message: `Unable to update result`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating result: ${error}`,
      });
    }
  });

  // only Admin
  // Update Result
  router.post("/result/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const reg_id = req.params.id;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const { data } = req.body;
      const result = await findResultByRegistrationId(reg_id);
      if (result) {
        const updatedResult = await updateResult({ reg_id }, data);
        if (!updatedResult) {
          res.status(500).json({
            message: `Unable to update result.`,
          });
          return;
        }
        res.status(200).json({
          message: `Result updated successfully`,
          data: updatedResult,
        });
      } else {
        res.status(422).json({
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
    const resultId = parseInt(req.params.id);
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const deletedResult = await deleteResult({ result_id: resultId });
      if (!deletedResult) {
        res.status(500).json({
          message: `Unable to delete result.`,
        });
        return;
      }
      res.status(200).json({
        message: `Result deleted successfully`,
        data: deletedResult,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting result: ${error}`,
      });
    }
  });

  return router;
};
