const express = require("express");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const qr = require("qr-image");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const {
  createProgram,
  getAllProgramScheduleCount,
  getAllProgramSchedule,
  findProgramByScheduleId,
  updateProgramScheduled,
  deleteScheduledProgram,
  getAllProgramScheduleForStudent,
  findProgramScheduleByScheduleIdForReceipt,
  getAllProgramScheduleForStudentCount,
} = require("../services/programSchedule");
const { userMiddleware } = require("../middlewares/middleware");
const { ExamScheduleStatus } = require("@prisma/client");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // student generate receipt
  router.get("/program/receipt/:id", userMiddleware, async (req, res) => {
    const { student, teacher } = req.body;
    const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

    const organizationId = student
      ? student.organization_id
      : teacher.organization_id;

    const scheduleId = parseInt(req.params.id);

    const programScheduleData = await findProgramScheduleByScheduleIdForReceipt(
      scheduleId
    );

    let programData = programScheduleData.program_schedule;

    const studentData = {
      reg_id: programScheduleData.reg_id,
      student: programScheduleData.student,
    };

    let response = { ...programData, ...studentData };
    const qrPayload = JSON.stringify(programData);
    const qrBuffer = qr.imageSync(qrPayload, { type: "png" });
    const qrBase64 = qrBuffer.toString("base64");

    const html = await ejs.renderFile(
      path.join(__dirname, "../templates/receipt.ejs"),
      { ...response, qrCodeBase64: qrBase64 }
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // 👉 Important: No other middleware should write to response after this
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=program_receipt.pdf"
    );
    // res.send(pdfBuffer); // This should work correctly

    res.end(pdfBuffer);
  });

  // Get all programs od programs for admin
  router.get("/program/schedule/:id", userMiddleware, async (req, res) => {
    try {
      const programId = req.params.id;
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder, is_program_active } =
        req.query;

      const isProgramActive = is_program_active === "true";

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;

      // const result = await findResultByRegistrationId(id);
      const filterObj = {
        organization_id: organizationId,
        program_id: programId,
        is_program_active: isProgramActive,
      };
      const programCount = await getAllProgramScheduleCount(
        filterObj,
        searchKey
      );
      const programs = await getAllProgramSchedule(
        searchKey,
        sortBy,
        filterObj,
        sortOrder,
        !limit || limit == "null" || limit == "undefined"
          ? programCount
          : limit,
        offset
      );
      if (programs) {
        res.status(200).json({
          message: `Fetched all programs`,
          data: { programs, offset, totalCount: programCount },
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

  // onlyAdmin
  // Schedule Program for program
  router.post("/program/schedule/", userMiddleware, async (req, res) => {
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
        program_id,
        program_starting_date,
        program_ending_date,
        registration_starting_date,
        registration_closing_date,
        program_location,
        is_program_active,
      } = req.body;

      if (
        !teacher ||
        !program_id ||
        !program_starting_date ||
        !program_ending_date ||
        !registration_starting_date ||
        !registration_closing_date ||
        !is_program_active ||
        !program_location
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }
      // get date of country from timezone
      const mIST = moment.tz(
        req.body.registration_closing_date,
        "Asia/Kolkata"
      );
      const regClosingDate = moment(mIST, "YYYY/MM/DD").endOf("day").format();
      console.log("regClosingDate", regClosingDate);

      const data = {
        registration_starting_date: req.body.registration_starting_date,
        registration_closing_date: regClosingDate,
        program_starting_date: req.body.program_starting_date,
        program_ending_date: req.body.program_ending_date,
        program_id: parseInt(req.body.program_id),
        program_location: req.body.program_location,
        is_program_active: req.body.is_program_active,
      };
      const program = await findProgramByScheduleId(schedule_id);
      if (program) {
        const updatedProgram = await updateProgramScheduled(
          { schedule_id },
          data
        );
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
        message: `Error while creating program : ${error}`,
      });
      return;
    }
  });

  router.put(
    "/program/schedule/:scheduleId",
    userMiddleware,
    async (req, res) => {
      const scheduleId = parseInt(req.params.scheduleId);
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
          program_starting_date,
          program_ending_date,
          registration_starting_date,
          registration_closing_date,
          program_location,
          is_program_active,
        } = req.body;
        if (
          !teacher ||
          !program_starting_date ||
          !program_ending_date ||
          !registration_starting_date ||
          !registration_closing_date ||
          !is_program_active ||
          !program_location
        ) {
          res.status(422).json({
            message: `Fill all the fields`,
          });
          return;
        }
        const programData = await updateProgramScheduled(
          {
            schedule_id: scheduleId,
          },
          {
            program_starting_date,
            program_ending_date,
            registration_starting_date,
            registration_closing_date,
            program_location,
            is_program_active,
          }
        );

        if (programData) {
          res.status(200).json({
            message: `Program Schedule updated successfully`,
            data: programData,
          });
          return;
        } else {
          res.status(500).json({
            message: `Unable to update program schedule.`,
          });
        }
      } catch (error) {
        res.status(500).json({
          message: `Error while updating program schedule : ${error}`,
        });
        return;
      }
    }
  );

  // only Admin
  // Delete program
  router.delete("/program/schedule/:id", userMiddleware, async (req, res) => {
    const { admin, student } = req.body;
    const id = parseInt(req.params.id);

    if (!admin) {
      res.status(403).json({
        message: `You are not authorize to perform this action.`,
      });
      return;
    }
    try {
      const deletedProgram = await deleteScheduledProgram({ schedule_id: id });
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

  router.get("/program/schedule/", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;

      const filterObj = {
        organization_id: organizationId,
        is_program_active: true,
      };
      const programCount = await getAllProgramScheduleForStudentCount(
        searchKey,
        filterObj
      );

      const programs = await getAllProgramScheduleForStudent(
        searchKey,
        sortBy,
        filterObj,
        sortOrder,
        !limit || limit == "null" || limit == "undefined"
          ? programCount ?? 0
          : limit,
        offset
      );
      if (programs) {
        res.status(200).json({
          message: `Fetched all programs`,
          data: { programs, offset },
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

  // Get all programs schedule by program Id
  router.get(
    "/program/schedule/program/:id",
    userMiddleware,
    async (req, res) => {
      try {
        const programId = req.params.id;
        const { student, teacher } = req.body;
        const {
          limit,
          offset,
          searchKey,
          sortBy,
          sortOrder,
          is_program_active,
        } = req.query;

        const isProgramActive = is_program_active === "true";

        const organizationId = student
          ? student.organization_id
          : teacher.organization_id;

        // const result = await findResultByRegistrationId(id);
        const filterObj = {
          organization_id: organizationId,
          program_id: programId,
          is_program_active: isProgramActive,
        };
        const programCount = await getAllProgramScheduleCount(
          filterObj,
          searchKey
        );
        const programs = await getAllProgramSchedule(
          searchKey,
          sortBy,
          filterObj,
          sortOrder,
          !limit || limit == "null" || limit == "undefined"
            ? programCount
            : limit,
          offset
        );
        if (programs) {
          res.status(200).json({
            message: `Fetched all programs`,
            data: { programs, offset, totalCount: programCount },
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
    }
  );
  return router;
};
