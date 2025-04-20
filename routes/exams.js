const express = require("express");
const {
  createExam,
  getAllExams,
  findExamByExamId,
  updateExam,
  deleteExam,
  getAllExamsCount,
} = require("../services/exam");
const { userMiddleware } = require("../middlewares/middleware");
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

  return router;
};
