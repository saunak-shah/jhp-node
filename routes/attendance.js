const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");

const {
  getStudentAttendance,
  getAllStudentsAttendance,
  createAttendance,
  deleteAttendance,
  getAttendanceCountByMonth,
  getAllStudentsAttendanceData,
  getAttendanceCountByAnyMonth,
  getAttendanceCountByAnyDate,
  getAttendanceDataByAnyMonth,
  getAttendanceCountForGraph,
} = require("../services/attendance");
const {
  findStudentsAssignedToTeacherId,
  findStudentsAssignedToTeacherIdCount,
  getTotalStudentsCount,
} = require("../services/user");
const { findGroupById } = require("../services/groupService");
const moment = require("moment");

const { findStudentById, getAllStudents } = require("../services/user");

const router = express.Router();

// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get a student attendance data
  router.get(
    "/attendance/student/:student_id",
    userMiddleware,
    async (req, res) => {
      const { teacher } = req.body;
      const { student_id } = req.params;
      const { lowerDateLimit, upperDateLimit } = req.query;

      try {
        const studentData = await findStudentById(parseInt(student_id));
        if (
          studentData.assigned_to &&
          studentData.assigned_to != teacher.teacher_id
        ) {
          res.status(403).json({
            message: `Only assigned teacher can fetch the attendance`,
          });
        }
        const attendance = await getStudentAttendance(
          parseInt(student_id),
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
          message: `Attendance found`,
          data: attendance,
        });
      } catch (error) {
        res.status(500).json({
          message: `Error while giving attendance - ${error}`,
        });
      }
    }
  );

  // Get the attendance of all students assigned to some teacher_id
  router.get("/attendance", userMiddleware, async (req, res) => {
    const { student, teacher } = req.body;
    const {
      lowerDateLimit,
      upperDateLimit,
      limit,
      searchKey,
      offset,
      sortBy,
      sortOrder,
      teacherId,
      group_ids,
    } = req.query;

    try {
      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;

      let users = [];
      let totalCount = 0;
      // teacher login
      if (teacher.master_role_id === 2) {
        if (teacher.group_ids && teacher.group_ids.length > 0) {
          // get teacher ids from group_ids
          const teachers = await findGroupById(teacher.group_ids[0]);
          totalCount = await findStudentsAssignedToTeacherIdCount(
            organization_id,
            searchKey,
            teachers.teacher_ids
          );

          users = await findStudentsAssignedToTeacherId(
            organization_id,
            searchKey,
            sortBy,
            teachers.teacher_ids,
            sortOrder,
            limit,
            offset
          );
        } else {
          totalCount = await findStudentsAssignedToTeacherIdCount(
            organization_id,
            searchKey,
            teacher.teacher_id
          );

          users = await findStudentsAssignedToTeacherId(
            organization_id,
            searchKey,
            sortBy,
            teacher.teacher_id,
            sortOrder,
            limit,
            offset
          );
        }
      } else {
        totalCount = await getTotalStudentsCount(
          organization_id,
          searchKey,
          teacherId
        );

        users = await getAllStudents(
          searchKey,
          sortBy,
          organization_id,
          sortOrder,
          limit,
          offset,
          teacherId
        );
      }

      users = users.map((user) => ({
        ...user,
        checked_dates: [],
      }));

      const studentIds = users.map((e) => e.student_id);

      const attendanceData = await getAllStudentsAttendanceData(
        teacher,
        lowerDateLimit,
        upperDateLimit,
        studentIds
      );

      users.forEach((user) => {
        user.name = user.first_name + " " + user.last_name;
        // Find the matching staff member based on student_id
        if (attendanceData.staff && attendanceData.staff.length > 0) {
          let staffMember = attendanceData.staff.find(
            (staff) => staff.student_id === user.student_id
          );
          if (staffMember) {
            // If found, push all dates from staffMember.checked_dates into user.checked_dates
            user.checked_dates.push(...staffMember.checked_dates);
          }
        }
      });
      return res.status(200).json({
        message: `attendance found`,
        data: {
          users,
          offset,
          totalCount,
        },
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  // This api shows the six months attendance count to student.
  router.get("/attendance-summary", userMiddleware, async (req, res) => {
    const { student } = req.body;
    const { lowerDateLimit, upperDateLimit } = req.query;

    try {
      let result = [];
      let current = moment(); // Setting to September 2024 for the given scenario

      for (let i = 0; i < 7; i++) {
        const monthName = current.format("MMM YYYY");
        const monthNumber = current.month() + 1; // moment.js month is zero-indexed, add 1 for a 1-indexed result
        result.push({
          month: monthName,
          attendance_count: 0,
          monthNumber: monthNumber,
        });
        // Move to the previous month
        current.subtract(1, "months");
      }

      result.reverse();

      const attendance = await getAttendanceCountByMonth(
        student.student_id,
        lowerDateLimit,
        upperDateLimit
      );
      // Loop through the result array
      result.forEach((resultItem) => {
        // Find if there's a corresponding month in the attendance array
        const attendanceItem = attendance.find(
          (item) => item.month === resultItem.month
        );

        // If found, update the attendance_count of the result item
        if (attendanceItem) {
          resultItem.attendance_count = attendanceItem.attendance_count;
        }
      });
      result.reverse();

      if (!result) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `attendance found`,
        data: result,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  // This api shows attendance count of student in admin report
  router.post("/attendance_report", userMiddleware, async (req, res) => {
    const { teacher, date } = req.body;
    let {
      limit,
      offset,
      searchKey,
      sortBy,
      sortOrder,
      lowerDateLimit,
      upperDateLimit,
      teacherId,
      gender,
    } = req.query;
    let formatDate = moment(req.query.lowerDateLimit).format("YYYY-MM-DD");

    lowerDateLimit = moment.utc(`${req.query.lowerDateLimit}`).toISOString();
    upperDateLimit = moment.utc(`${req.query.upperDateLimit}`).toISOString();

    console.log("lowerDateLimit========", lowerDateLimit)
    console.log("upperDateLimit========", upperDateLimit)
    try {
      const totalAttendanceCount = await getAttendanceCountByAnyMonth(
        formatDate,
        teacher,
        searchKey,
        lowerDateLimit,
        upperDateLimit,
        teacherId,
        gender
      );

      const attendance = await getAttendanceDataByAnyMonth(
        searchKey,
        sortBy,
        sortOrder,
        formatDate,
        teacher,
        limit,
        offset,
        lowerDateLimit,
        upperDateLimit,
        teacherId,
        gender
      );

      if (!attendance) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }

      if (attendance && attendance.length > 0) {
        res.status(200).json({
          message: "Attendance found",
          data: {
            attendance,
            offset,
            totalCount: totalAttendanceCount,
          },
        });
      } else {
        res.status(200).json({
          message: `No attendance found`,
          data: {
            attendance: [],
            offset,
            totalCount: totalAttendanceCount,
          },
        });
        return;
      }
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  // Create attendance
  router.post("/attendance", userMiddleware, async (req, res) => {
    const { teacher, attendance, removals } = req.body;
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

      
      const attendanceData = await createAttendance(
        teacher.teacher_id,
        teacher.master_role_id,
        attendance
      );

      // removal attendance
      if (removals && removals.length > 0) {
        const removalData = await deleteAttendance(
          teacher.teacher_id,
          removals
        );
      }

      res.status(200).json({
        message: `Attendance filled successfully`,
        data: attendanceData,
      });
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

      const attendanceData = await deleteAttendance(
        teacher.teacher_id,
        attendance
      );

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

  // This api shows the attendance dates to student
  router.get("/attendance-dates", userMiddleware, async (req, res) => {
    const { student } = req.body;
    let { lowerDateLimit, upperDateLimit } = req.query;

    try {
      let studentIds = (student && Object.keys(student).length > 0) ? [student?.student_id] : [parseInt(req.query?.selectedStudent)];
      
      lowerDateLimit = moment(lowerDateLimit, "YYYY/MM/DD")
          .startOf("day")
          .format();
      upperDateLimit = moment(upperDateLimit, "YYYY/MM/DD")
          .endOf("day")
          .format();

      const attendanceData = await getAllStudentsAttendanceData(
        student,
        lowerDateLimit,
        upperDateLimit,
        studentIds
      );

      if (!attendanceData) {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }
      res.status(200).json({
        message: `attendance found`,
        data: attendanceData,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  router.post("/attendance_report_by_day", userMiddleware, async (req, res) => {
    const { teacher, date } = req.body;

    let formatDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

    try {
      let attendanceCount = await getAttendanceCountByAnyDate(
        formatDate,
        teacher
      );

      if (!attendanceCount && attendanceCount.toString() != "0") {
        res.status(422).json({
          message: `No attendance found`,
        });
        return;
      }

      res.status(200).json({
        message: `attendance found`,
        data: attendanceCount,
      });
    } catch (error) {
      console.error("Error getting attendance:", error);
      res.status(500).json({
        message: `Error while fetching attendance - ${error}`,
      });
    }
  });

  router.get(
    "/attendance_report_for_graph/:lowerDateLimit/:upperDateLimit",
    userMiddleware,
    async (req, res) => {
      try {
        const { admin } = req.body;
        /* if (!admin) {
          res.status(422).json({
            message: `Only Admin`,
          });
          return;
        } */

        let lowerDateLimit = moment.utc(`${req.params.lowerDateLimit}`).toISOString();
        let upperDateLimit = moment.utc(`${req.params.upperDateLimit}`).toISOString();

        const data = await getAttendanceCountForGraph(
          lowerDateLimit,
          upperDateLimit
        );

        res.status(200).json({
          message: `attendance found`,
          data,
        });
      } catch (error) {
        console.error("Error getting attendance:", error);
        res.status(500).json({
          message: `Error while fetching attendance - ${error}`,
        });
      }
    }
  );

  return router;
};
