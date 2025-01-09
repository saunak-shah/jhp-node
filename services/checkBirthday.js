const { prisma } = require("../prisma/client");

const getPeopleWithTodayBirthdays = async () => {
    const today = new Date();

    const todayUTCDate = today.getUTCDate();
    const todayUTCMonth = today.getUTCMonth() + 1;

    const students = await prisma.student.findMany({});
    const studentsWithBirthdays = students.filter((student) => {
        const birthDate = new Date(student.birth_date);
        return (
            birthDate.getUTCDate() === todayUTCDate &&
            birthDate.getUTCMonth() + 1 === todayUTCMonth
        );
    });

    const teachers = await prisma.teacher.findMany({});
    const teachersWithBirthdays = teachers.filter((teacher) => {
        const birthDate = new Date(teacher.teacher_birth_date);
        return (
            birthDate.getUTCDate() === todayUTCDate &&
            birthDate.getUTCMonth() + 1 === todayUTCMonth
        );
    });

    return [...studentsWithBirthdays, ...teachersWithBirthdays];
};

module.exports = {
    getPeopleWithTodayBirthdays,
};
