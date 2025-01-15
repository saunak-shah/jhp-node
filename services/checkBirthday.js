const { prisma } = require("../prisma/client");

const getPeopleWithTodayBirthdays = async () => {
    // const today = new Date();

    // const todayUTCDate = today.getUTCDate();
    // const todayUTCMonth = today.getUTCMonth() + 1;

    const org_timezone = 'Asia/Kolkata';
    const students = await prisma.$queryRaw`
        SELECT student_id, first_name, last_name, email
        FROM student
        WHERE TO_CHAR(
            birth_date AT TIME ZONE 'UTC' AT TIME ZONE '${org_timezone}', 'MM-DD'
        ) = TO_CHAR(
            NOW() AT TIME ZONE '${org_timezone}', 'MM-DD'
        );`;

    const teachers = await prisma.$queryRaw`
        SELECT teacher_id, teacher_first_name
        FROM teacher
        WHERE TO_CHAR(
            teacher_birth_date AT TIME ZONE 'UTC' AT TIME ZONE '${org_timezone}', 'MM-DD'
        ) = TO_CHAR(
            NOW() AT TIME ZONE '${org_timezone}', 'MM-DD'
        );`;

    return [...students, ...teachers];
};

module.exports = {
    getPeopleWithTodayBirthdays,
};
