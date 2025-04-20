const express = require("express");
const {
  findExamByExamId,
  scheduleExam,
  findExamsScheduleByExamId,
  findExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
  getAllPendingExamsCount,
  getAllPendingExams,
} = require("../services/exam");
const { userMiddleware } = require("../middlewares/middleware");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () { 
 // Get all scheduled exams
  router.get("/exam_schedule", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;
      const examCount = await getAllPendingExamsCount(organizationId, searchKey);
      const exams = await getAllPendingExams(
        searchKey,
        sortBy,
        organizationId,
        sortOrder,
        !limit || limit == "null" || limit == "undefined" ? examCount : limit,
        offset
      );
      if (exams) {
        res.status(200).json({
          message: `Fetched all exams`,
          data: { exams, offset, totalCount: examCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch exams`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting exams: ${error}`,
      });
    }
  });

  // Get scheduled exam by schedule id
  router.get("/exam_schedule/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await findExamScheduleById(id);
      if (exam) {
        res.status(200).json({
          message: `Fetched exam schedule`,
          data: exam,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting exam: ${error}`,
      });
    }
  });

   // Get scheduled exam by schedule exam id
   router.get("/exam_schedule/exam/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await findExamsScheduleByExamId(id);
      if (exam) {
        res.status(200).json({
          message: `Fetched exam schedule`,
          data: exam,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting exam: ${error}`,
      });
    }
  });

  // Create Schedule exams
  router.post("/exams/schedule/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);
      const {
        teacher,
        exam_date,
        start_time,
        end_time,
        registration_starting_date,
        registration_closing_date,
        seats_available,
        exam_location,
        total_marks,
        passing_marks,
        is_retake,
      } = req.body;


      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const exam = await findExamByExamId(id);
      if (
        !exam ||
        registration_starting_date < new Date(Date.now()).toISOString() ||
        registration_starting_date > exam_date ||
        registration_closing_date > exam_date ||
        registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Exam registration cannot be done`,});
      }

      const scheduledData = await scheduleExam({
        exam_id: id,
        exam_date,
        start_time,
        end_time,
        registration_closing_date,
        registration_starting_date,
        seats_available,
        exam_location,
        total_marks,
        passing_marks,
        is_retake: is_retake || false,
        scheduled_by: teacher.teacher_id,
      });

      if (scheduledData) {
        res.status(200).json({
          message: `Exam scheduled successfully`,
          data: scheduledData,
        });
      } else {
        res.status(500).json({
          message: `Unable to fill the scheduledData`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating scheduledData: ${error}`,
      });
    }
  });

  // Update schedule exams
  router.put("/exam_schedule/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);
      const {
        teacher,
        exam_date,
        start_time,
        end_time,
        registration_starting_date,
        registration_closing_date,
        seats_available,
        exam_location,
        total_marks,
        passing_marks,
        is_retake,
      } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const scheduledData = await findExamScheduleById(id);
      if (!scheduledData) {
        res.status(422).json({
          message: `Unable to update the scheduled exam`,
        });
      }

      if (
        !scheduledData ||
        registration_starting_date < new Date(Date.now()).toISOString() ||
        registration_starting_date > exam_date ||
        registration_closing_date > exam_date ||
        registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Exam registration cannot be done`,});
      }

      const updatedData = await updateExamSchedule(
        { schedule_id: id },
        {
          exam_date,
          start_time,
          end_time,
          registration_closing_date,
          registration_starting_date,
          seats_available,
          exam_location,
          total_marks,
          passing_marks,
          is_retake: is_retake || false,
        }
      );

      if (updatedData) {
        res.status(200).json({
          message: `Updated schedule for exam`,
          data: updatedData,
        });
      } else {
        res.status(500).json({
          message: `Unable to update the schedule`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating schedule: ${error}`,
      });
    }
  });

  // Delete schedule exams
  router.delete("/exam_schedule/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const scheduledData = await findExamScheduleById(id);
      if (!scheduledData) {
        res.status(422).json({
          message: `Unable to delete the scheduled exam`,
        });
      }

      const deletedData = await deleteExamSchedule({ schedule_id: id });

      if (deletedData) {
        res.status(200).json({
          message: `Deleted schedule for exam`,
          data: deletedData,
        });
      } else {
        res.status(500).json({
          message: `Unable to delete the schedule`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting schedule: ${error}`,
      });
    }
  });

  return router;
};
