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

async function createAttendance(teacher_id, attendance) {
  const attendances = [];
  for (let i = 0; i < attendance.length; i++) {
    const student_id = attendance[i].student_id;
    const attendanceDates = attendance[i].checked_dates;

    const student = await findStudentById(student_id);

    if (student.assignedTo != teacher_id) {
      throw new Error("Only assigned teacher can fill the attendance");
    }

    for (let j = 0; j < attendanceDates.length; j++) {
      const attendanceDate = attendanceDates[j];
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

async function deleteAttendance(teacher_id, attendance) {
  let attendances = [];
  for (let i = 0; i < attendance.length; i++) {
    const student_id = attendance[i].student_id;
    const attendanceDates = attendance[i].checked_dates;

    const student = await findStudentById(student_id);

    if (student.assignedTo != teacher_id) {
      throw new error("Only assigned teacher can delete the attendance");
    }

    for (let j = 0; j < attendanceDates.length; j++) {
      const attendanceDate = attendanceDates[j];

      const attendanceData = await prisma.attendance.deleteMany({
        where: {
          student_id,
          teacher_id,
          date: attendanceDate.toString(),
        },
      });

      if(attendanceData.count > 0){
        attendances.push(attendance[i])
      }
    }
  }

  return attendances;
}

async function getStudentAttendance(
  student_id,
  lowerDateLimit = new Date(Date.now - 7 * 24 * 60 * 60 * 1000),
  upperDateLimit = new Date(Date.now)
) {
  const attendance = await prisma.attendance.findMany({
    where: {
      student_id,
      date: {
        gte: lowerDateLimit,
        lte: upperDateLimit,
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

async function getAllStudentsAttendance(
  teacher_id,
  lowerDateLimit = new Date(Date.now - 7 * 24 * 60 * 60 * 1000),
  upperDateLimit = new Date(Date.now)
) {
  const attendance = await prisma.attendance.findMany({
    where: {
      teacher_id,
      date: {
        gte: lowerDateLimit,
        lte: upperDateLimit,
      },
    },
    select: attendanceOutputData,
  });

  if (attendance) {
    const attendances = {};

    for(let i = 0; i < attendance.length; i++) {
      const attendanceData = attendance[i];
      attendances[attendanceData.student_id] = attendances[attendanceData.student_id] ? attendances[attendanceData.student_id] + "," + new Date(attendanceData.date).toISOString() : new Date(attendanceData.date).toISOString()
    }

    Object.keys(attendances).map((key) => attendances[key] = attendances[key].split(','))
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
