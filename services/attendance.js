const { prisma } = require("../prisma/client");
const { findStudentById } = require("./user");

const attendanceOutputData = {
  attendance_id: true,
  date: true,
  student_id: true,
  teacher_id: true,
  created_at: true,
  updated_at: true,
};

async function createAttendance(data) {
  const attendances = [];
  const teacher_id = data.teacher_id;
  for (let i = 0; i < data.attendance.length; i++) {
    const student_id = data.attendance[i].student_id;
    const attendanceDates = data.attendance[i].checked_dates;

    const student = await findStudentById(student_id);

    if (student.assignedTo != teacher_id) {
      throw new error("Only assigned teacher can fill the attendance");
    }

    for (let j = 0; j < attendanceDates.length; j++) {
      const attendanceDate = attendanceDates[i];

      const attendance = await prisma.attendance.create({
        data: {
          student_id,
          teacher_id,
          date: attendanceDate,
        },
        select: attendanceOutputData,
      });

      attendances.push(attendance);
    }
  }

  if (attendances && attendances.length > 0) {
    return attendances;
  }
  return;
}

async function deleteAttendance(data) {
  const attendances = [];
  const teacher_id = data.teacher_id;
  for (let i = 0; i < data.attendance.length; i++) {
    const student_id = data.attendance[i].student_id;
    const attendanceDates = data.attendance[i].checked_dates;

    const student = await findStudentById(student_id);

    if (student.assignedTo != teacher_id) {
      throw new error("Only assigned teacher can delete the attendance");
    }

    for (let j = 0; j < attendanceDates.length; j++) {
      const attendanceDate = attendanceDates[i];

      const attendance = await prisma.attendance.delete({
        where: {
          student_id,
          teacher_id,
          date: attendanceDate,
        },
        select: attendanceOutputData,
      });

      attendances.push(attendance);
    }
  }

  if (attendances && attendances.length > 0) {
    return attendances;
  }
  return;
}

async function getStudentAttendance(student_id, days = 7) {
  const day = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const attendance = await prisma.attendance.findMany({
    where: {
      student_id,
      date: {
        gte: day,
      },
    },
    select: attendanceOutputData,
  });

  if (attendance) {
    const attendanceDates = [];
    attendance.map((attendanceData) =>
      attendanceDates.push(attendanceData.date)
    );
    return {
      student_id,
      attendance: attendanceDates,
    };
  }
  return;
}

async function getAllStudentsAttendance(teacher_id, days = 7) {
  const day = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const attendance = await prisma.attendance.findMany({
    where: {
      teacher_id,
      date: {
        gte: day,
      },
    },
    select: attendanceOutputData,
  });

  if (attendance) {
    const attendances = {};
    attendance.map((attendanceData) => {
      const attendanceDataOfStudent =
        attendances[attendanceData.student_id] || [];
      attendances[attendanceData.student_id] = attendanceDataOfStudent.push(
        attendanceData.date
      );
    });
    return attendances;
  }
  return;
}

async function isStudentPresentOnDate(student_id, date) {
  const attendances = await prisma.attendance.findUnique({
    where: {
      student_id,
      date,
    },
    select: attendanceOutputData,
    orderBy: {
      created_at: "asc",
    },
  });

  if (attendances) {
    return true;
  }
  return false;
}

module.exports = {
  createAttendance,
  deleteAttendance,
  isStudentPresentOnDate,
  getStudentAttendance,
  getAllStudentsAttendance,
};
