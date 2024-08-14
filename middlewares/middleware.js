const { verifyJwt } = require("../helpers/jwt");
const { findTeacherByUsername, isAdmin } = require("../services/teacher");
const { findStudentByUsername } = require("../services/user");

async function userMiddleware(req, res, next) {
  const jwtToken = req.get("Authorization");
  if (jwtToken) {
    const tokenData = verifyJwt(jwtToken);
    if (tokenData) {
      let student, teacher;
      try {
        student = await findStudentByUsername(tokenData.username);

        if (!student) {
          res.status(500).json({ message: `Not student` });
          return;
        }
      } catch (e) {
        teacher = await findTeacherByUsername(tokenData.teacher_username);
        if (!teacher) {
          res.status(500).json({ message: `Not teacher` });
          return;
        }
      }

      const isUserAdmin = await isAdmin(
        student?.student_id || teacher?.teacher_id
      );
      
      if (student || teacher) {
        req.body = {
          token: "",
          student,
          teacher,
          ...req.body,
          admin: Boolean(isUserAdmin),
        };
        next();
      } else {
        res.status(403).json({ message: `Invalid user` });
        return;
      }
    } else {
      res.status(403).json({ message: `Invalid token` });
      return;
    }
  }
}

module.exports = {
  userMiddleware,
};
