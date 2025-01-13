const { Prisma } = require("@prisma/client");
const { prisma } = require("../prisma/client");
const { findStudentById } = require("./user");
const moment = require("moment");

const attendanceOutputData = {
  attendance_id: true,
  date: true,
  student_id: true,
  teacher_id: true,
  created_at: true,
  updated_at: true,
  student: {
    select: {
      student_id: true,
      first_name: true,
      last_name: true,
      father_name: true,
      phone_number: true,
      address: true,
      email: true,
      username: true,
      register_no: true,
    },
  },
};

async function createAttendance(teacher_id, attendance) {
  const attendances = [];
  for (let i = 0; i < attendance.length; i++) {
    const student_id = attendance[i].student_id;
    const attendanceDates = attendance[i].checked_dates;

    if (attendanceDates && attendanceDates.length > 0) {
      for (let j = 0; j < attendanceDates.length; j++) {
        const attendanceDate = attendanceDates[j];
        let startDate = moment(attendanceDate, "DD/MM/YYYY")
          .startOf("day")
          .format();
        let endDate = moment(attendanceDate, "DD/MM/YYYY")
          .endOf("day")
          .format();

        // check with date and student_id if data exist then ignore it.
        const studentDate = await getAttendanceDateForStudent(
          student_id,
          startDate,
          endDate
        );

        if (studentDate && studentDate.length <= 0) {
          const formateDate = moment(attendanceDate, "DD/MM/YYYY").format();
          const attendance = await prisma.attendance.create({
            data: {
              student_id,
              teacher_id,
              date: formateDate,
            },
            select: attendanceOutputData,
          });
          attendances.push(attendance);
        }
      }
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
    const attendanceDate = attendance[i].date;

    const student = await findStudentById(student_id);
    /* if (student.assigned_to != teacher_id) {
      throw new error("Only assigned teacher can delete the attendance");
    } */
    if (attendanceDate && attendanceDate.length > 0) {
      const formateDate = moment(attendanceDate, "DD/MM/YYYY").format();
      const attendanceData = await prisma.attendance.deleteMany({
        where: {
          student_id,
          teacher_id,
          date: formateDate,
        },
      });
      if (attendanceData.count > 0) {
        attendances.push(attendance[i]);
      }
    }

    /* for (let j = 0; j < attendanceDates.length; j++) {
      const attendanceDate = attendanceDates[j];
      const attendanceData = await prisma.attendance.deleteMany({
        where: {
          student_id,
          teacher_id,
          date: attendanceDate.toString(),
        },
      });

      if (attendanceData.count > 0) {
        attendances.push(attendance[i]);
      }
    } */
  }

  return attendances;
}

async function getAttendanceDateForStudent(student_id, startDate, endDate) {
  const attendance = await prisma.attendance.findMany({
    where: {
      student_id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: attendanceOutputData,
  });

  return attendance;
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

async function getAllStudentsAttendanceData(
  teacher,
  lowerDateLimit = new Date(Date.now - 7 * 24 * 60 * 60 * 1000),
  upperDateLimit = new Date(Date.now),
  studentIds
) {
  /* let teacher_id = undefined;
  if(teacher.master_role_id === 2){
    teacher_id = teacher.teacher_id;
  } */
  const attendance = await prisma.attendance.findMany({
    where: {
      /* teacher_id, */
      date: {
        gte: lowerDateLimit,
        lte: upperDateLimit,
      },
      student_id: {
        in: studentIds,
      },
    },
    select: attendanceOutputData,
  });

  const groupedByStudent = attendance.reduce((acc, { date, student }) => {
    const { student_id, first_name, last_name } = student;
    const fullName = `${first_name} ${last_name}`;
    if (!acc[student_id]) {
      acc[student_id] = {
        student_id,
        name: fullName,
        checked_dates: [],
      };
    }
    acc[student_id].checked_dates.push(moment(date).format("DD/MM/YYYY"));
    return acc;
  }, {});

  const result = {
    staff: Object.values(groupedByStudent),
  };
  return result;
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

  /* if (attendance) {
    const attendances = {};

    for(let i = 0; i < attendance.length; i++) {
      const attendanceData = attendance[i];
      attendances[attendanceData.student_id] = attendances[attendanceData.student_id] ? attendances[attendanceData.student_id] + "," + new Date(attendanceData.date).toISOString() : new Date(attendanceData.date).toISOString()
    }

    Object.keys(attendances).map((key) => attendances[key] = attendances[key].split(','))
    return attendances;
  } */
  const groupedByStudent = attendance.reduce((acc, { date, student }) => {
    const { student_id, first_name, last_name } = student;
    const fullName = `${first_name} ${last_name}`;
    if (!acc[student_id]) {
      acc[student_id] = {
        student_id,
        name: fullName,
        checked_dates: [],
      };
    }
    acc[student_id].checked_dates.push(moment(date).format("DD/MM/YYYY"));
    return acc;
  }, {});

  const result = {
    staff: Object.values(groupedByStudent),
  };
  return result;
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

async function getAttendanceCountByMonth(
  studentId,
  lowerDateLimit,
  upperDateLimit
) {
  lowerDateLimit = moment().subtract(5, "month").startOf("month").format();
  upperDateLimit = moment().format();
  // Count data grouped by month
  const dataByMonth = await prisma.$queryRaw`
    SELECT
      DATE_TRUNC('month', "date") AS month,
      COUNT(*) AS attendance_count
    FROM
      "attendance"
    WHERE
      "student_id" = ${studentId}
      AND "date" BETWEEN CAST(${lowerDateLimit} AS timestamp) AND CAST(${upperDateLimit} AS timestamp) 
    GROUP BY
      month
    ORDER BY
      month DESC;
  `;

  for (let i = 0; i < dataByMonth.length; i++) {
    dataByMonth[i].month = moment(dataByMonth[i].month).format("MMM YYYY");
    dataByMonth[i].monthNumber = new Date(dataByMonth[i].month).getMonth() + 1;
    dataByMonth[i].attendance_count = Number(dataByMonth[i].attendance_count);
  }

  return dataByMonth;
}

async function getAttendanceCountByAnyMonth(
  formatDate,
  teacher,
  searchKey,
  lowerDateLimit,
  upperDateLimit
) {
  let dataByMonth;
  const params = [formatDate];
  const query = [
    `SELECT 
        CONCAT(s.first_name, ' ', s.father_name, ' ', s.last_name) as full_name,
        COUNT(*)::integer AS attendance_count
      FROM
        attendance as a
      LEFT JOIN student s on s.student_id = a.student_id
      WHERE 
        date_trunc('month', a.date) = date_trunc('month', $${params.length}::date)`,
  ];

  if (lowerDateLimit) {
    params.push(moment(lowerDateLimit).format("YYYY-MM-DD"));
    query.push(`AND a.date >= $${params.length}::date`);
  }

  if (upperDateLimit) {
    params.push(moment(upperDateLimit).format("YYYY-MM-DD"));
    query.push(`AND a.date <= $${params.length}::date`);
  }

  if (teacher && teacher.master_role_id === 2) {
    params.push(teacher.teacher_id);
    query.push(`AND teacher_id = $${params.length}`);
  }

  if (searchKey) {
    params.push(`%${searchKey}%`);
    query.push(
      `AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.father_name ILIKE $${params.length})`
    );
  }

  query.push(`GROUP BY a.student_id, s.first_name, s.last_name, s.father_name`);

  dataByMonth = await prisma.$queryRawUnsafe(query.join(" "), ...params);

  return dataByMonth.length;
}

async function getAttendanceDataByAnyMonth(
  searchKey,
  sortBy,
  sortOrder,
  formatDate,
  teacher,
  limit,
  offset,
  lowerDateLimit,
  upperDateLimit
) {
  let dataByMonth;
  const params = [formatDate];

  let query = [
    `
      SELECT 
        CONCAT(s.first_name, ' ', s.father_name, ' ', s.last_name) as full_name,
        COUNT(*)::integer as attendance_count
      FROM
        attendance as a
      LEFT JOIN student s on s.student_id = a.student_id
      WHERE 
        date_trunc('month', a.date) = date_trunc('month', $${params.length}::date)
        `,
  ];

  if (lowerDateLimit) {
    params.push(moment(lowerDateLimit).format("YYYY-MM-DD"));
    query.push(
      `AND a.date::date >= ($${params.length}::timestamptz AT TIME ZONE 'UTC')::date`
    );
  }

  if (upperDateLimit) {
    params.push(moment(upperDateLimit).format("YYYY-MM-DD"));
    query.push(
      `AND a.date::date <= ($${params.length}::timestamptz AT TIME ZONE 'UTC')::date`
    );
  }

  if (teacher && teacher.master_role_id === 2) {
    params.push(teacher.teacher_id);
    query.push(`AND teacher_id = $${params.length}`);
  }

  if (searchKey) {
    params.push(`%${searchKey}%`);
    query.push(
     `AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.father_name ILIKE $${params.length})`
    );
  }

  query.push(`GROUP BY a.student_id, s.first_name, s.last_name, s.father_name`);

  if (sortBy && sortOrder) {
    query.push(`ORDER BY ${sortBy} ${sortOrder}`);
  } else {
    query.push(`ORDER BY attendance_count desc`);
  }
  params.push(Number(limit), Number(offset));
  query.push(`LIMIT $${params.length - 1} OFFSET $${params.length}`);

  dataByMonth = await prisma.$queryRawUnsafe(query.join(" "), ...params);

  return dataByMonth;
}

async function getAttendanceCountByAnyDate(formatDate, teacher) {
  // Fetch all the group_ids from the teacher table
  const teachers = await prisma.teacher.findUnique({
    where: {
      teacher_id: teacher.teacher_id,
    },
    select: {
      group_ids: true,
    },
  });

  // Extract unique group_ids from the teacher table
  const groupIds = teachers?.group_ids ?? [];

  // Fetch all the teacher_ids from the groups table for the filtered groupIds
  const groups = await prisma.groups.findMany({
    where: {
      group_id: {
        in: groupIds,
      },
    },
    select: {
      teacher_ids: true,
    },
  });

  // Flatten and deduplicate teacher_ids from the groups table
  const teacherIds = [...new Set(groups.flatMap((group) => group.teacher_ids))];

  let dataByDate;
  const params = [formatDate, teacher.organization_id];
  /* let query = [
    `SELECT * FROM attendance a LEFT JOIN teacher t ON a.teacher_id = t.teacher_id
        WHERE DATE(a.date) = ($${
          params.length - 1
        }::timestamptz AT TIME ZONE 'UTC')::date
        AND t.organization_id = $${params.length}`,
  ];
  if (teacher && teacher.master_role_id === 2) {
    params.push(Prisma.sql`${teacherIds}`);
    query.push(`AND t.teacher_id = ANY($${params.length})`);
  } */
  let query = [
    `SELECT * FROM attendance a LEFT JOIN teacher t ON a.teacher_id = t.teacher_id
      WHERE DATE(a.date) = ($1::date) 
      AND t.organization_id = $${params.length}`,
  ];
    
  if (teacher && teacher.master_role_id === 2) {
    params.push(teacherIds); // Push the array as a parameter
    query.push(`AND t.teacher_id = ANY(ARRAY[$${params.length}])`);
  }
  dataByDate = await prisma.$queryRawUnsafe(query.join(" "), ...params);
  return dataByDate ? dataByDate.length : 0;
}

async function getAttendanceCountForGraph(lowerDateLimit, upperDateLimit) {
  // Fetch grouped attendance data from the database
  const attendance = await prisma.attendance.groupBy({
    by: ["date"],
    where: {
      date: {
        gte: lowerDateLimit,
        lte: upperDateLimit,
      },
    },
    _count: {
      _all: true,
    },
  });

  // Create a map of attendance data for quick lookup
  const attendanceMap = attendance.reduce((acc, item) => {
    acc[moment(item.date).format("YYYY-MM-DD")] = item._count._all;
    return acc;
  }, {});

  // Generate the full range of dates between lowerDateLimit and upperDateLimit
  const fullDateRange = [];
  let currentDate = moment(lowerDateLimit);
  const endDate = moment(upperDateLimit);

  while (currentDate.isSameOrBefore(endDate)) {
    fullDateRange.push(currentDate.format("YYYY-MM-DD"));
    currentDate.add(1, "day");
  }

  // Populate the attendance count for each date in the range
  const attendanceDate = [];
  const attendanceCount = [];

  fullDateRange.forEach((date) => {
    attendanceDate.push(moment(date).format("DD-MM-YYYY"));
    attendanceCount.push(attendanceMap[date] || 0); // Default to 0 if no attendance
  });

  return { attendanceCount, attendanceDate };
}

module.exports = {
  createAttendance,
  deleteAttendance,
  isStudentPresentOnDate,
  getStudentAttendance,
  getAllStudentsAttendance,
  getAttendanceCountByMonth,
  getAllStudentsAttendanceData,
  getAttendanceCountByAnyMonth,
  getAttendanceCountByAnyDate,
  getAttendanceDateForStudent,
  getAttendanceDataByAnyMonth,
  getAttendanceCountForGraph,
};
