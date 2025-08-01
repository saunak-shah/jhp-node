const express = require("express");
const {
  createProgram,
  getAllPrograms,
  findProgramByProgramId,
  updateProgram,
  deleteProgram,
  getAllProgramsCount,
} = require("../services/program");
const { userMiddleware } = require("../middlewares/middleware");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all programs
  router.get("/programs", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder, is_program_active, fetch_for_student } = req.query;

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;
      const programsCount = await getAllProgramsCount(
        organizationId,
        searchKey,
        is_program_active,
        fetch_for_student
      );
      const programs = await getAllPrograms(
        searchKey,
        sortBy,
        organizationId,
        student?.student_id,
        sortOrder,
        !limit || limit == "null" || limit == "undefined"
          ? programsCount
          : limit,
        offset,
        is_program_active,
        fetch_for_student
      );
      if (programs) {
        res.status(200).json({
          message: `Fetched all programs`,
          data: { programs, offset, totalCount: programsCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch programs`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting programs: ${error}`,
      });
    }
  });

  // Get program by programId
  router.get("/programs/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const program = await findProgramByProgramId(id);
      if (program) {
        res.status(200).json({
          message: `Fetched program`,
          data: program,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch program`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting program: ${error}`,
      });
    }
  });

  // onlyAdmin
  // Create Program
  router.post("/programs/", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `You dont have access to add Program. Please contact to admin.`,
      });
      return;
    }
    try {
      // Extract necessary data from request body
      const {
        teacher,
        program_name,
        file_url,
        program_description,
        registration_starting_date,
        registration_closing_date,
        program_location,
        program_starting_date,
        program_ending_date,
        is_program_active,
      } = req.body;

      if (
        !teacher || 
        !program_name || 
        !file_url || 
        !program_description ||
        !registration_starting_date ||
        !registration_closing_date ||
        !program_location ||
        !program_starting_date ||
        !program_ending_date ||
        !is_program_active
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }

      // check regsitration starting date and registration ending date is greater than todays date and ending greate than starting
      const currentDate = new Date();
      const registrationStartingDate = new Date(registration_starting_date);
      const registrationClosingDate = new Date(registration_closing_date);
      const programStartingDate = new Date(program_starting_date);
      const programEndingDate = new Date(program_ending_date);
      if (
        registrationStartingDate < currentDate ||
        registrationClosingDate < currentDate ||
        programStartingDate < currentDate ||
        programEndingDate < currentDate
      ) {
        res.status(422).json({
          message: `Registration starting date, registration closing date, program starting date, program ending date must be greater than today's date`,
        });
        return;
      }
      if (registrationStartingDate > registrationClosingDate) {
        res.status(422).json({
          message: `Registration starting date must be less than registration closing date`,
        });
        return;
      }
      if (programStartingDate > programEndingDate) {
        res.status(422).json({
          message: `Program starting date must be less than program ending date`,
        });
        return;
      }

      const programData = await createProgram({
        program_name,
        file_url,
        program_description,
        registration_starting_date,
        registration_closing_date,
        program_location,
        program_starting_date,
        program_ending_date,
        is_program_active,
        created_by: teacher.teacher_id,
        organization_id: teacher.organization_id,
      });

      if (programData) {
        res.status(200).json({
          message: `Program created successfully`,
          data: programData,
        });
        return;
      } else {
        res.status(500).json({
          message: `Unable to create program`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating program : ${error}`,
      });
      return;
    }
  });

  // only Admin
  // Update Program
  router.post("/programs/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const id = parseInt(req.params.id);
    if (!admin) {
      res.status(403).json({
        message: `Only admin can update exam program.`,
      });
      return;
    }

    const program = await findProgramByProgramId(id);
    if (!program) {
      res.status(404).json({
        message: `Program not found`,
      });
      return;
    }

    const {
      teacher,
      program_name,
      file_url,
      program_description,
      registration_starting_date,
      registration_closing_date,
      program_location,
      program_starting_date,
      program_ending_date,
      is_program_active,
    } = req.body;

    const new_file_url = file_url || program.file_url;

    if (
      !teacher || 
      !program_name || 
      // !file_url || 
      !program_description ||
      !registration_starting_date ||
      !registration_closing_date ||
      !program_location ||
      !program_starting_date ||
      !program_ending_date
    ) {
      res.status(422).json({
        message: `Fill all the fields`,
      });
      return;
    }

    try {
      const data = {
        program_name,
        file_url: new_file_url,
        program_description,
        registration_starting_date,
        registration_closing_date,
        program_location,
        program_starting_date,
        program_ending_date,
        is_program_active,
      };
      const program = await findProgramByProgramId(id);
      /* if (program?.created_by != student?.student_id) {
        res.status(403).json({
          message: `Unable to update program while creator and updator is not same`,
        });
        return;
        } */
       if (program) {
         const updatedProgram = await updateProgram({ program_id: id }, data);
        if (!updatedProgram) {
          res.status(500).json({
            message: `Unable to update program.`,
          });
          return;
        }
        res.status(200).json({
          message: `Program updated successfully`,
          data: updatedProgram,
        });
      } else {
        res.status(422).json({
          message: `Unable to find program`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating program: ${error}`,
      });
    }
  });

  // only Admin
  // Delete program
  router.delete("/programs/:id", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    const id = parseInt(req.params.id);
    console.log("admin", admin);

    if (!admin) {
      res.status(403).json({
        message: `You are not authorize to perform this action.`,
      });
      return;
    }
    try {
      const program = await findProgramByProgramId(id);
      if (!program) {
        res.status(422).json({
          message: `Unable to find program`,
        });
        return;
      }
      /* if (program.created_by != student.student_id) {
        res.status(403).json({
          message: `Unable to update program while creator and updator is not same`,
        });
        return;
      } */
      const deletedProgram = await deleteProgram({ program_id: id });
      if (!deletedProgram) {
        res.status(500).json({
          message: `Unable to delete program.`,
        });
        return;
      }
      res.status(200).json({
        message: `Program deleted successfully`,
        data: deletedProgram,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting program: ${error}`,
      });
    }
  });

  return router;
};
