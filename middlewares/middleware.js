const { verifyJwt } = require("../helpers/jwt");
const { isAdmin, findStudentByUsername } = require("../services/user");

async function userMiddleware(req, res, next) {
  const jwtToken = req.get("Authorization");
  if (jwtToken) {
    const tokenData = verifyJwt(jwtToken);
    if (tokenData) {
      const student = await findStudentByUsername(tokenData.username);
      let teacher = null;
      if (!student) {
        teacher = await findTeacherByUsername(tokenData.username);
        if (!teacher) {
          res.status(500).json({ message: `Not valid user` });
          return;
        }
      }
      const isUserAdmin = await isAdmin(
        student.student_id || teacher.teacher_id,
        student.organization_id || teacher.organization_id
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
