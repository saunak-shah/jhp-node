const express = require("express");
const {
  createExam,
  getAllExams,
  findExamByExamId,
  updateExam,
  deleteExam,
  getAllExamsCount,
  scheduleExam,
  findExamScheduleByExamId,
  findExamScheduleById,
  updateExamSchedule,
  deleteExamSchedule,
} = require("../services/exam");
const { userMiddleware } = require("../middlewares/middleware");
const { applyForExam } = require("../services/applyForExam");
const { getOrganization } = require("../services/organization");
const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all courses
  router.get("/exams", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;
      const examCount = await getAllExamsCount(organizationId, searchKey);
      const exams = await getAllExams(
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

  // Get exam by courseId
  router.get("/exams/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exam = await findExamByExamId(id);
      if (exam) {
        res.status(200).json({
          message: `Fetched exam`,
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

  // onlyAdmin
  // Create Exams
  router.post("/exams/", userMiddleware, async (req, res) => {
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
        exam_name,
        exam_description,
        is_active,
        exam_course_url,
      } = req.body;

      if (
        !teacher ||
        !exam_name ||
        !exam_description ||
        !is_active ||
        !exam_course_url
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }

      const examData = await createExam({
        exam_name,
        exam_course_url,
        exam_description,
        is_active,
        created_by: teacher.teacher_id,
        organization_id: teacher.organization_id,
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

  // only Admin
  // Update Exams
  router.post("/exams/:id", userMiddleware, async (req, res) => {
    const {
      admin,
      teacher,
      exam_name,
      exam_description,
      exam_course_url,
      is_active,
    } = req.body;
    const id = parseInt(req.params.id);
    if (!admin) {
      res.status(403).json({
        message: `Only admin can update exam exam.`,
      });
      return;
    }
    try {
      const data = {
        exam_name,
        exam_course_url,
        exam_description,
        is_active,
      };
      const exam = await findExamByExamId(id);
      /* if (exam?.created_by != student?.student_id) {
        res.status(403).json({
          message: `Unable to update exam while creator and updator is not same`,
        });
        return;
      } */
      if (exam) {
        const updatedExam = await updateExam({ exam_id: id }, data);
        if (!updatedExam) {
          res.status(500).json({
            message: `Unable to update exam.`,
          });
          return;
        }
        res.status(200).json({
          message: `Exam updated successfully`,
          data: updatedExam,
        });
      } else {
        res.status(422).json({
          message: `Unable to find exam`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating exam: ${error}`,
      });
    }
  });

  // only Admin
  // Delete exams
  router.delete("/exams/:id", userMiddleware, async (req, res) => {
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
      const exam = await findExamByExamId(id);
      if (!exam) {
        res.status(422).json({
          message: `Unable to find exam`,
        });
      }
      /* if (exam.created_by != student.student_id) {
        res.status(403).json({
          message: `Unable to update exam while creator and updator is not same`,
        });
        return;
      } */
      const deletedExam = await deleteExam({ exam_id: id });
      if (!deletedExam) {
        res.status(500).json({
          message: `Unable to delete exam.`,
        });
        return;
      }
      res.status(200).json({
        message: `Exam deleted successfully`,
        data: deletedExam,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting exam: ${error}`,
      });
    }
  });

  // Apply for exam
  router.post("/exams_schedule/apply/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);
      const { student, attempNo } = req.body;

      // select the exam which you want to give
      // after select the exam need to show information about exam like
      // generate unique exam id
      // check if already apply or not for requested exam

      const exam = await findExamByExamId(id);
      if (
        !exam ||
        exam.registration_starting_date > new Date(Date.now()).toISOString() ||
        exam.registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Exam registration cannot be done`,
        });
      }

      const organization = await getOrganization(student.organization_id);
      const date = moment(birth_date).format("DD");
      const month = moment(birth_date).format("MM");
      const randomNo = Number(Date.now().toString().slice(-2));

      let register_no =
        organization.name.slice(0, 3) +
        student.first_name[0] +
        student.last_name[0] +
        date +
        month +
        randomNo;

      const application = await applyForExam({
        student_id: user.id,
        shcedule_id: id,
        exam_attempt: attempNo,
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
        registration_starting_date > new Date(Date.now()).toISOString() ||
        registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Exam registration cannot be done`,
        });
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
          message: `Applied successfully for exam`,
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
          message: `Unable to update the scheduled exam`,
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
