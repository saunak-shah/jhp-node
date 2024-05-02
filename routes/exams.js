const express = require("express");
const {
  createExam,
  getAllExams,
  findExamByExamId,
  updateExam,
  deleteExam,
} = require("../services/exam");
const { userMiddleware } = require("../middlewares/middleware");
const { createApplication } = require("../services/applyForExam");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all exams
  router.get("/exams/", async (req, res) => {
    try {
      const exams = await getAllExams();
      if (exams) {
        res.status(200).json({
          message: `Fetched all exams`,
          exams,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch exams`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting exams: ${error}`,
      });
    }
  });

  // Get exam by examId
  router.get("/exams/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const exam = await findExamByExamId(id);
      if (exam) {
        res.status(200).json({
          message: `Fetched exam with id: ${id}`,
          exam,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting exam: ${error}`,
      });
    }
  });
  
  // Apply for exam
  router.post("/exams/apply/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const examId = req.params.id;
      const { user } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const exam = await findExamByExamId(examId);
      if (
        !exam ||
        exam.registrationStartingDate >
          new Date(Date.now()).toISOString() ||
        exam.registrationClosingDate < new Date(Date.now()).toISOString()
      ) {
        res.status(400).json({
          message: `Exam registration cannot be done`,
        });
      }

      const application = await createApplication({
        userId: user.userId,
        examId,
      });

      if (application) {
        res.status(200).json({
          message: `Application filled successfully`,
          application,
        });
      } else {
        res.status(500).json({
          message: `Unable to fill the application`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating application: ${error}`,
      });
    }
  });

  // onlyAdmin
  // Create Exam
  router.post("/exams/", userMiddleware, async (req, res) => {
    const {admin} = req.body;
    if(!admin){
      res.status(403).json({
        message: `Only admin`
      })
      return
    }
    try {
      // Extract necessary data from request body
      const {
        user,
        examName,
        fileUrl,
        examDate,
        examDurationInHours,
        examDescription,
        examScore,
        examLocation,
        examStatus,
        examPassingScore,
        examMaxAttemps,
        isActive,
        category,
        standard,
        registrationStartingDate,
        registrationClosingDate,
      } = req.body;

      if (
        !user ||
        !examName ||
        !fileUrl ||
        !examDate ||
        !examDurationInHours ||
        !examDescription ||
        !examScore ||
        !examLocation ||
        !examStatus ||
        !examPassingScore ||
        !examMaxAttemps ||
        !isActive ||
        !category ||
        !standard ||
        !registrationStartingDate ||
        !registrationClosingDate
      ) {
        res.status(400).json({
          message: `Fill all the fields`,
        });
        return;
      }

      if (examDate < new Date(Date.now()).toISOString()) {
        res.status(400).json({
          message: `Exam Date should be greater than today's date.`,
        });
        return;
      }
      const examData = await createExam({
        examName,
        fileUrl,
        examDate,
        examDurationInHours,
        examDescription,
        examScore,
        examLocation,
        examStatus,
        examPassingScore,
        examMaxAttemps,
        isActive,
        registrationStartingDate,
        registrationClosingDate,
        category,
        standard,
        createdBy: user.uniqueId,
      });

      if (examData) {
        res.status(200).json({
          message: `Exam created successfully`,
          examData,
        });
        return;
      } else {
        res.status(500).json({
          message: `Unable to create exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating exam : ${error}`,
      });
      return;
    }
  });

  // only Admin
  // Update Exam
  router.put("/exams/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const examId = req.params.id;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const { data } = req.body;
      const exam = await findExamByExamId(examId);
      if (exam) {
        const updatedExam = await updateExam({ examId }, data);
        if (!updatedExam) {
          res.status(500).json({
            message: `Unable to update exam.`,
          });
          return;
        }
        res.status(200).json({
          message: `Result updated successfully with resultId: ${examId}`,
        });
      } else {
        res.status(500).json({
          message: `Unable to find result with id: ${examId}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating result: ${error}`,
      });
    }
  });

  // only Admin
  // Delete exam
  router.delete("/exams/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const examId = req.params.id;
    if (!admin) {
      res.status(403).json({
        message: `Only admin`,
      });
      return;
    }
    try {
      const deletedExam = await deleteExam({ examId });
      if (!deletedExam) {
        res.status(500).json({
          message: `Unable to delete exam.`,
        });
        return;
      }
      res.status(200).json({
        message: `Exam deleted successfully with examId: ${examId}`,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting exam: ${error}`,
      });
    }
  });

  return router;
};
