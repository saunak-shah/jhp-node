const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const { findCourseByCourseId } = require("../services/course");
const { getAllApplicationsCount, getAllApplications, getAllApplicationsByUserIdAndExamId, findApplicationByRegistrationId, getAllApplicationsByUserIdCount, getAllApplicationsByUserId, getAllApplicationsByExamIdCount, getAllApplicationsByExamId, getAllApplicationsByExamIdToDownload, applyForExam, deleteApplication, getAllApplicationsByScheduleId, getAllApplicationsByScheduleIdCount, getAllApplicationsByScheduleIdToDownload } = require("../services/applyForExam");
const { getOrganization } = require("../services/organization");
const { findExamScheduleById } = require("../services/exam");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all applications
  router.get("/exam_registrations", userMiddleware, async (req, res) => {
    try {
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
      const totalRegistrationCount = await getAllApplicationsCount(searchKey);
      const registrations = await getAllApplications(
        searchKey,
        sortBy,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched all registrations`,
          data: { registrations, offset, totalCount: totalRegistrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registrations: ${error}`,
      });
    }
  });

  // Get application by applicationId
  router.get("/exam_registrations/check", userMiddleware, async (req, res) => {
    try {
      const { courseId, studentId } = req.query;
      const registration = await getAllApplicationsByUserIdAndExamId(
        parseInt(studentId),
        parseInt(courseId)
      );
      if (registration) {
        res.status(200).json({
          message: `Fetched registration`,
          data: registration,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registration`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting registration: ${error}`,
      });
    }
  });

  // Get application by applicationId
  router.get("/exam_registrations/:id", userMiddleware, async (req, res) => {
    try {
      const registration = await findApplicationByRegistrationId(req.params.id);
      console.log("🚀 ~ router.get ~ registration:", registration)
      if (registration) {
        res.status(200).json({
          message: `Fetched registration`,
          data: registration,
        });
      } else {
        res.status(422).json({
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
  router.get(
    "/students/exam_registrations/:id",
    userMiddleware,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
        const registrationCount = await getAllApplicationsByUserIdCount(id, searchKey);
        const registrations = await getAllApplicationsByUserId(
          searchKey,
          sortBy,
          id,
          sortOrder,
          limit,
          offset
        );
        if (registrations) {
          res.status(200).json({
            message: `Fetched registrations`,
            data: { registrations, totalCount: registrationCount, offset },
          });
        } else {
          res.status(422).json({
            message: `Unable to fetch applications`,
          });
        }
      } catch (error) {
        res.status(500).json({
          message: `Internal Server Error while getting applications: ${error}`,
        });
      }
    }
  );

  // Get application by examId
  router.get("/exams/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByScheduleIdCount(id, searchKey);
      const registrations = await getAllApplicationsByScheduleId(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched registrations`,
          data: { registrations, offset, totalCount: registrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Get application by examId
  router.get("/download/exams/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByScheduleIdCount(id, searchKey);
      const registrations = await getAllApplicationsByScheduleIdToDownload(
        searchKey,
        sortBy,
        id,
        sortOrder,
        limit,
        offset
      );
      if (registrations) {
        res.status(200).json({
          message: `Fetched registrations`,
          data: { registrations, offset, totalCount: registrationCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch registrations`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting applications: ${error}`,
      });
    }
  });

  // Apply for exam
  router.post("/exam_schedule/apply/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);
      const { student, attemptNo, teacher } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const exam = await findExamScheduleById(id);
      if (
        !exam ||
        exam.registration_starting_date < new Date(Date.now()).toISOString() ||
        exam.registration_closing_date > new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Exam registration cannot be done`,
        });
      }

      const organization = await getOrganization(
        student.organization_id || teacher.organization_id
      );
      const date = moment(student.birth_date).format("DD");
      const month = moment(student.birth_date).format("MM");
      const randomNo = Number(Date.now().toString().slice(-2));

      let register_no =
        organization.name.slice(0, 3) +
        student.first_name[0] +
        student.last_name[0] +
        date +
        month +
        randomNo;

      const application = await applyForExam({
        student_id: student.student_id,
        schedule_id: id,
        exam_attempt: attemptNo,
        reg_id: register_no,
      });

      if (application) {
        res.status(200).json({
          message: `Applied successfully for exam`,
          data: application,
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

  // Delete exam registration
  router.delete("/exam_registrations/:id", userMiddleware, async (req, res) => {
    const { student } = req.body;
    console.log("🚀 ~ router.delete ~ student:", student)
    try {
      const registration = await findApplicationByRegistrationId(req.params.id);
      console.log("🚀 ~ router.delete ~ registration:", registration)
      if (registration) {
        if (registration.student_id != student.student_id) {
          res.status(403).json({
            message: `Unauthorized to update registration.`,
          });
          return;
        }
        const deletedApplication = await deleteApplication({
          reg_id: req.params.id,
        });
        console.log("🚀 ~ router.delete ~ deletedApplication:", deletedApplication)
        if (!deletedApplication) {
          res.status(500).json({
            message: `Unable to delete application.`,
          });
          return;
        }
        res.status(200).json({
          message: `Application deleted successfully`,
          data: deletedApplication,
        });
      } else {
        res.status(204).json({
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
