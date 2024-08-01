const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");

const {
  getStudentAttendance,
  getAllStudentsAttendance,
  createAttendance,
  deleteAttendance,
  getAttendanceCountByMonth,
} = require("../services/attendance");

const { findStudentById } = require("../services/user");

const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get a student attendance data
  router.get("/attendance/student/:student_id", userMiddleware, async (req, res) => {
    const { teacher, lowerDateLimit, upperDateLimit  } = req.body;
    const student_id = parseInt(req.params.student_id)
    try {
      const studentData = await findStudentById(student_id);
      if (
        studentData.assignedTo &&
        studentData.assignedTo != teacher.teacher_id
      ) {
        res.status(403).json({
          message: `Only assigned teacher can fetch the attendance`,
        });
      }
      const attendance = await getStudentAttendance(student_id, lowerDateLimit, upperDateLimit);
      if (!attendance) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `Attendance found`,
        data: attendance,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while giving attendance - ${error}`,
      });
    }
  });

  // Get the attendance of all students assigned to some teacher_id
  router.get("/attendance", userMiddleware, async (req, res) => {
    const { teacher, lowerDateLimit, upperDateLimit } = req.body;
    try {
      const attendance = await getAllStudentsAttendance(
        teacher.teacher_id,
        lowerDateLimit,
        upperDateLimit
      );
      if (!attendance) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `attendance found`,
        data: attendance,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  router.get("/attendance-summary", userMiddleware, async (req, res) => {
    const {student} = req.body;
    try {
      const attendance = await getAttendanceCountByMonth(student.student_id);
      if (!attendance) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `attendance found`,
        data: attendance,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  // Create attendance
  router.post("/attendance", userMiddleware, async (req, res) => {
    const { teacher, attendance } = req.body;
    if (!teacher) {
      res.status(403).json({
        message: `Only teacher can create attendance`,
      });
      return;
    }
    try {
      if (!attendance) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const attendanceData = await createAttendance(teacher.teacher_id, attendance);

      if (attendanceData) {
        res.status(200).json({
          message: `Attendance created successfully`,
          data: attendanceData,
        });
      } else {
        res.status(500).json({
          message: `Unable to fill attendanceData`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while filling attendanceData: ${error}`,
      });
    }
  });

  // only Admin
  // Delete Result
  router.delete("/attendance", userMiddleware, async (req, res) => {
    const { teacher, attendance } = req.body;
    if (!teacher) {
      res.status(403).json({
        message: `Only teacher can delete the attendance`,
      });
      return;
    }
    try {
      if (!attendance) {
        res.status(400).json({
          message: `Fill all the fields properly.`,
        });
        return;
      }

      const attendanceData = await deleteAttendance(teacher.teacher_id, attendance);

      if (attendanceData) {
        res.status(200).json({
          message: `Attendance deleted successfully`,
          data: attendanceData,
        });
      } else {
        res.status(500).json({
          message: `Unable to delete attendance`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting attendance: ${error}`,
      });
    }
  });

  return router;
};
