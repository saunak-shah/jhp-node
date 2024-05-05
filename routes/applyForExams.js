const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllApplications,
  findApplicationByRegistrationId,
  createApplication,
  updateApplication,
  deleteApplication,
  getAllApplicationsByUserId,
  getAllApplicationsByExamId,
} = require("../services/applyForExam");
const { findExamByExamId } = require("../services/exam");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all applications
  router.get("/registrations/", async (req, res) => {
    try {
      const applications = await getAllApplications();
      if (applications) {
        res.status(200).json({
          message: `Fetched all applications`,
          applications,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch applications`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Get application by applicationId
  router.get("/registrations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const registration = await findApplicationByRegistrationId(id);
      if (registration) {
        res.status(200).json({
          message: `Fetched registration with id: ${id}`,
          registration,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch registration`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registration: ${error}`,
      });
    }
  });

  // Get application by userId
  router.get("/users/registrations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const applications = await getAllApplicationsByUserId(id);
      if (applications) {
        res.status(200).json({
          message: `Fetched applications with id: ${id}`,
          applications,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch applications`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Get application by examId
  router.get("/exams/registrations/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const applications = await getAllApplicationsByExamId(id);
      if (applications) {
        res.status(200).json({
          message: `Fetched applications with id: ${id}`,
          applications,
        });
      } else {
        res.status(500).json({
          message: `Unable to fetch applications`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Apply for exam
  router.post("/register/", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const { examId, user } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const exam = await findExamByExamId(examId);
      if (
        !exam ||
        exam.registrationStartingDate > new Date(Date.now()).toISOString() ||
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

  // Update Application
  router.put("/registration/:id", userMiddleware, async (req, res) => {
    const { user } = req.body;
    const registerationId = req.params.id;
    try {
      const { data } = req.body;
      const application = await findApplicationByRegistrationId(
        registerationId
      );
      if (application) {
        if (application?.userId != user?.userId) {
          res.status(403).json({
            message: `Unauthorized to update application.`,
          });
          return;
        }
        const updatedApplication = await updateApplication(
          { registrationId: registerationId },
          data
        );
        if (!updatedApplication) {
          res.status(500).json({
            message: `Unable to update application.`,
          });
          return;
        }
        res.status(200).json({
          message: `Result updated successfully with resultId: ${registerationId}`,
        });
      } else {
        res.status(500).json({
          message: `Unable to find result with id: ${registerationId}`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating result: ${error}`,
      });
    }
  });

  // Delete exam
  router.delete("/registration/:id", userMiddleware, async (req, res) => {
    const { user } = req.body;
    const registrationId = req.params.id;
    try {
      const application = await findApplicationByRegistrationId(registrationId);
      if (application) {
        if (application.userId != user.userId) {
          res.status(403).json({
            message: `Unauthorized to update application.`,
          });
          return;
        }
        const deletedApplication = await deleteApplication({ registrationId });
        if (!deletedApplication) {
          res.status(500).json({
            message: `Unable to delete application.`,
          });
          return;
        }
        res.status(200).json({
          message: `Application deleted successfully with applicationId: ${registrationId}`,
        });
      } else {
        res.status(500).json({
          message: `Application not found`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting application: ${error}`,
      });
    }
  });

  return router;
};
