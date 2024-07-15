const { verifyJwt } = require("../helpers/jwt");
const { isAdmin, findStudentByUsername } = require("../services/user");

async function userMiddleware(req, res, next) {
  const jwtToken = req.get("Authorization");
  if (jwtToken) {
    const tokenData = verifyJwt(jwtToken);
    if (tokenData) {
      const student = await findStudentByUsername(tokenData.username);
      if (!student) {
        res.status(500).json({ message: `Not admin` });
        return;
      }
      const isUserAdmin = await isAdmin(student.student_id);
      if (student) {
        req.body = {
          token: "",
          student,
          ...req.body,
          admin: Boolean(isUserAdmin),
        };
        next();
      } else {
        res.status(403).json({ message: `Invalid student` });
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
