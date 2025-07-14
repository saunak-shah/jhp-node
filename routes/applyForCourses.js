const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllApplications,
  findApplicationByRegistrationId,
  findApplicationByApplicantId,
  applyForCourse,
  getAllApplicationsByUserIdAndCourseId,
  deleteApplication,
  getAllApplicationsByUserId,
  getAllApplicationsByCourseId,
  getAllApplicationsCount,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByCourseIdCount,
  getAllApplicationsByCourseIdToDownload,
} = require("../services/applyForCourse");
const { findCourseByCourseId } = require("../services/course");
const { findExamByScheduleId } = require("../services/examScheduleService");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all applications
  router.get("/registrations", userMiddleware, async (req, res) => {
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
  router.get("/registrations/check", userMiddleware, async (req, res) => {
    try {
      const { courseId, studentId } = req.query;
      const registration = await getAllApplicationsByUserIdAndCourseId(
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
  router.get("/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(parseInt(req.params.id));
      const registration = await findApplicationByRegistrationId(id);
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
    "/students/registrations/:id",
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

  // Admin - Get application by exam schedule id
  router.get("/courses/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(parseInt(req.params.id));
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByCourseIdCount(id, searchKey);
      const registrations = await getAllApplicationsByCourseId(
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
  router.get("/download/courses/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByCourseIdCount(id, searchKey);
      const registrations = await getAllApplicationsByCourseIdToDownload(
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
  router.post("/register/", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const { course_id, schedule_id, student } = req.body;

      if (!course_id || !schedule_id) {
        res.status(422).json({
          message: `Invalid data.`,
        });
        return;
      }

      // Get course schedule info
      const course = await findExamByScheduleId(schedule_id);
      const now = new Date();

      let errorMessage = "";
      if (!course) {
        errorMessage = "Course not found.";
      } else if (new Date(course.registration_starting_date) > now) {
        errorMessage = "Registration has not started yet.";
      } else if (new Date(course.registration_closing_date) < now) {
        errorMessage = "Registration is closed.";
      }

      if (errorMessage) {
        return res.status(422).json({ message: errorMessage });
      }


      const existingApplications = await getAllApplicationsByUserIdAndCourseId(
        student.student_id,
        course_id,
        schedule_id
      );
      console.log("existingApplications=======", existingApplications)
      
      if (existingApplications.length > 0) {
        const score = existingApplications[0]?.result[0]?.score;
        const passingScore = existingApplications[0]?.result[0]?.course_passing_score;
        if (score !== undefined && passingScore !== undefined) {
          if (score >= passingScore) {
            return res.status(422).json({
              message: `You have already passed this exam and cannot reapply.`,
            });
          }
          // If score < passingScore → allow reapply
        } else {
          return res.status(422).json({
            message: `You have already applied for this exam.`,
          });
        }
      }  
      const registrationId = uuidv4().replace(/-/g, '').slice(0, 10);
      const data = {
        reg_id: registrationId,
        student: {
          connect: { student_id: student.student_id }
        },
        course: {
          connect: { course_id: course_id }
        },
        exam_schedule: {
          connect: { schedule_id: schedule_id }
        }
      }

      const registration = await applyForCourse(data);
      console.log("registration========", registration)

      if (registration) {
        res.status(200).json({
          message: `registration filled successfully`,
          data: registration,
        });
      } else {
        res.status(500).json({
          message: `Unable to register for exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating registration: ${error}`,
      });
    }
  });

  // Update Application
  // router.put("/registration/:id", userMiddleware, async (req, res) => {
  //   const { student } = req.body;
  //   const id = parseInt(req.params.id);
  //   try {
  //     const { data } = req.body;
  //     const registration = await findApplicationByRegistrationId(
  //       id
  //     );
  //     if (registration) {
  //       if (registration?.user_id != student?.id) {
  //         res.status(403).json({
  //           message: `Unauthorized to update application.`,
  //         });
  //         return;
  //       }
  //       const updatedApplication = await updateApplication(
  //         { id },
  //         data
  //       );
  //       if (!updatedApplication) {
  //         res.status(500).json({
  //           message: `Unable to update exam registration.`,
  //         });
  //         return;
  //       }
  //       res.status(200).json({
  //         message: `Application updated successfully`,
  //         data: updatedApplication
  //       });
  //     } else {
  //       res.status(500).json({
  //         message: `Unable to find application`,
  //       });
  //     }
  //   } catch (error) {
  //     res.status(500).json({
  //       message: `Error while updating result: ${error}`,
  //     });
  //   }
  // });

  // Delete exam
  router.delete("/exam/registration/:id", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const studentApplyId = parseInt(req.params.id);
    try {
      const registration = await findApplicationByApplicantId(studentApplyId);
      if (registration) {
        if (registration.student_id != student.student_id) {
          res.status(403).json({
            message: `Unauthorized to update registration.`,
          });
          return;
        }
        const deletedApplication = await deleteApplication({
          student_apply_course_id: studentApplyId,
        });
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
