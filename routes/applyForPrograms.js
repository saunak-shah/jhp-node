const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const {
  getAllApplications,
  findApplicationByRegistrationId,
  applyForProgram,
  getAllApplicationsByUserIdAndProgramId,
  deleteApplication,
  getAllApplicationsByUserId,
  getAllApplicationsByProgramId,
  getAllApplicationsCount,
  getAllApplicationsByUserIdCount,
  getAllApplicationsByProgramIdCount,
  getAllApplicationsByProgramIdToDownload,
} = require("../services/applyForProgram");
const { findProgramByProgramId } = require("../services/program");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all applications
  router.get("/programs/registrations", userMiddleware, async (req, res) => {
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
  router.get("/programs/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const id = req.params.id;
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
    "/programs/registrations/students/:id",
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

  // Get application by programId
  router.get("/registrations/programs/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByProgramIdCount(id, searchKey);
      const registrations = await getAllApplicationsByProgramId(
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

  // Get application by programId
  router.get("/download/programs/registrations/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const registrationCount = await getAllApplicationsByProgramIdCount(id, searchKey);
      const registrations = await getAllApplicationsByProgramIdToDownload(
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

  // Apply for program
  router.post("/programs/register/", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const { program_id, student, teacher, student_id } = req.body;
      if (!student && !teacher) {
        res.status(403).json({
          message: `Unauthorized to register for program.`,
        });
        return;
      }
      if(teacher && !student_id) {
        res.status(403).json({
          message: `Teacher registration requires student_id.`,
        });
        return;
      }

      const studentId = student ? student.student_id : student_id;

      if (!program_id) {
        res.status(422).json({
          message: `Program Id not valid.`,
        });
        return;
      }

      const program = await findProgramByProgramId(program_id);
      if (
        !program ||
        program.registration_starting_date >
          new Date(Date.now()).toISOString() ||
          program.registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Program registration cannot be done`,
        });
      }

      const isRegistered = await getAllApplicationsByUserIdAndProgramId(
        studentId,
        program_id
      );
      if (isRegistered && isRegistered.length > 0) {
        res.status(422).json({
          message: `Already registered`,
        });
        return;
      }

      const registrationId = "JHP" + Date.now()

      const registration = await applyForProgram({
        student_id: studentId,
        program_id,
        reg_id: registrationId
      });

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
  router.delete("/programs/registration/:id", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const id = req.params.id;
    try {
      const registration = await findApplicationByRegistrationId(id);
      if (registration) {
        if (registration.student_id != student.student_id) {
          res.status(403).json({
            message: `Unauthorized to update registration.`,
          });
          return;
        }
        const deletedApplication = await deleteApplication({
          student_apply_program_id: registration.student_apply_program_id,
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
        res.status(400).json({
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
