const express = require("express");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const qr = require("qr-image");
const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");

const {
  createExam,
  getAllExamScheduleCount,
  getAllExamSchedule,
  findExamByCourseId,
  findExamByScheduleId,
  updateExamScheduled,
  deleteScheduledExam,
  getAllExamScheduleForStudent,
  findExamByScheduleIdForReceipt,
} = require("../services/examSchedule");
const { userMiddleware } = require("../middlewares/middleware");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {

  // student generate receipt
  router.get("/exam/receipt/:id", userMiddleware, async (req, res) => {
    const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
      
      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;

    const examId = parseInt(req.params.id);
    const examScheduleData = await findExamByScheduleIdForReceipt(examId, student.student_id);
    let examData = examScheduleData.exam_schedule;
    examData.start_time = moment(examData.start_time).tz("Asia/Kolkata").format("lll")
    examData.end_time = moment(examData.end_time).tz("Asia/Kolkata").format("lll")
    
    const studentData = {
      reg_id: examScheduleData.reg_id,
      student: examScheduleData.student,
    };

    let response = {...examData, ...studentData};
    const qrPayload = JSON.stringify(examData);
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
    res.setHeader("Content-Disposition", "attachment; filename=exam_receipt.pdf");
    // res.send(pdfBuffer); // This should work correctly

    res.end(pdfBuffer); 
  });
  
  // Get all exams od courses for admin
  router.get("/exam/schedule/:id", userMiddleware, async (req, res) => {
    try {
      const courseId = req.params.id;
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder, is_exam_active } =
        req.query;

      const isExamActive = is_exam_active === "true";

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;

      // const result = await findResultByRegistrationId(id);
      const filterObj = {
        organization_id: organizationId,
        course_id: courseId,
        is_exam_active: isExamActive
      }
      const courseCount = await getAllExamScheduleCount(filterObj, searchKey);
      const courses = await getAllExamSchedule(
        searchKey,
        sortBy,
        filterObj,
        sortOrder,
        !limit || limit == "null" || limit == "undefined" ? courseCount: limit,
        offset
      );
      if (courses) {
        res.status(200).json({
          message: `Fetched all courses`,
          data: { courses, offset, totalCount: courseCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch courses`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting courses: ${error}`,
      });
    }
  });


  // onlyAdmin
  // Schedule Exam for course
  router.post("/exam/schedule/", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `You dont have access to add Exam. Please contact to admin.`,
      });
      return;
    }
    try {
      // Extract necessary data from request body
      const {
        teacher,
        schedule_id,
        course_id,
        registration_starting_date,
        registration_closing_date,
        location,
        start_time,
        end_time,
        total_marks,
        passing_score,
        exam_name,
      } = req.body;

      if (
        !teacher ||
        !schedule_id,
        !course_id,
        !registration_starting_date,
        !registration_closing_date,
        !location,
        !start_time,
        !end_time,
        !total_marks,
        !passing_score,
        !exam_name
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }
      // get date of country from timezone
      const mIST = moment.tz(req.body.registration_closing_date, "Asia/Kolkata");
      const regClosingDate = moment(mIST, "YYYY/MM/DD")
      .endOf("day")
      .format();
      console.log("regClosingDate", regClosingDate)

      const data = {
        registration_starting_date: req.body.registration_starting_date,
        registration_closing_date: regClosingDate,
        location: req.body.location,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        total_marks: req.body.total_marks,
        passing_score: req.body.passing_score,
        exam_name: req.body.exam_name,
        is_exam_active: req.body.is_exam_active
      };
      const course = await findExamByScheduleId(schedule_id);
      if (course) {
        const updatedCourse = await updateExamScheduled({ schedule_id }, data);
        if (!updatedCourse) {
          res.status(500).json({
            message: `Unable to update course.`,
          });
          return;
        }
        res.status(200).json({
          message: `Course updated successfully`,
          data: updatedCourse,
        });
      } else {
        res.status(422).json({
          message: `Unable to find course`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating exam : ${error}`,
      });
      return;
    }
  });

  router.put("/exam/schedule/", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `You dont have access to add Exam. Please contact to admin.`,
      });
      return;
    }
    try {
      // Extract necessary data from request body
      const {
        teacher,
        course_id,
        registration_starting_date,
        registration_closing_date,
        location,
        start_time,
        end_time,
        total_marks,
        passing_score,
        exam_name,
        is_exam_active
      } = req.body;
      if (
        !teacher ||
        !course_id,
        !registration_starting_date,
        !registration_closing_date,
        !location,
        !start_time,
        !end_time,
        !total_marks,
        !passing_score,
        !exam_name
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }

      const examData = await createExam({
        course_id,
        registration_starting_date,
        registration_closing_date,
        location,
        start_time,
        end_time,
        total_marks,
        passing_score,
        exam_name,
        is_exam_active
      });

      if (examData) {
        res.status(200).json({
          message: `Exam created successfully`,
          data: examData,
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

  // Publish exam result
  router.put("/exam/result/publish", userMiddleware, async (req, res) => {
    const { admin, teacher, is_result_publish, schedule_id } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `You dont have access to add Exam. Please contact to admin.`,
      });
      return;
    }
    // Validate required fields
    if (!teacher || !schedule_id || typeof is_result_publish !== "boolean") {
      return res.status(422).json({
        message: "Fill all the required fields and ensure is_result_publish is true/false.",
      });
    }

    try {
      // Update exam schedule publish status
      const updatedCourse = await updateExamScheduled(
        { schedule_id },
        { is_result_publish }
      );
      if (!updatedCourse) {
        res.status(500).json({
          message: `Unable to update course.`,
        });
        return;
      }

      return res.status(200).json({
        message: `Exam result ${is_result_publish ? "published" : "unpublished"} successfully.`,
        data: updatedCourse,
      });  
    } catch (error) {
      console.error("Error while publishing exam result:", error);
      return res.status(500).json({
        message: `Error while publishing exam result: ${error.message || error}`,
      });  
    }
  });

  // only Admin
  // Delete exam
  router.delete("/exam/schedule/:id", userMiddleware, async (req, res) => {
    const { admin, student } = req.body;
    const id = parseInt(req.params.id);

    if (!admin) {
      res.status(403).json({
        message: `You are not authorize to perform this action.`,
      });
      return;
    }
    try {
      const course = await findExamByScheduleId(id);
      const deletedCourse = await deleteScheduledExam({ schedule_id: id });
      if (!deletedCourse) {
        res.status(500).json({
          message: `Unable to delete exam.`,
        });
        return;
      }
      res.status(200).json({
        message: `Exam deleted successfully`,
        data: deletedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting exam: ${error}`,
      });
    }
  });

  router.get("/course/exam/schedule/", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      console.log("student=========", student)
      // const courseId = 1;
      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;

      const filterObj = {
        organization_id: organizationId,
        is_exam_active: true
      }
      const courses = await getAllExamScheduleForStudent(
        searchKey,
        sortBy,
        filterObj,
        sortOrder,
        !limit || limit == "null" || limit == "undefined" ? courseCount: limit,
        offset,
        student.student_id
      );
      if (courses) {
        res.status(200).json({
          message: `Fetched all courses`,
          data: { courses, offset},
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch courses`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting courses: ${error}`,
      });
    }
  });

  
  
  return router;
};
