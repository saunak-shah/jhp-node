const { verifyJwt } = require("../helpers/jwt");
const { findUserByUniqueId, isAdmin } = require("../services/user");

async function userMiddleware(req, res, next) {
  const jwtToken = req.get("Authorization");
  if (jwtToken) {
    const tokenData = verifyJwt(jwtToken);
    if (tokenData) {
      const user = await findUserByUniqueId(tokenData.uniqueId);
      const admin = await isAdmin(user.userId);
      if (user) {
        req.body = {
          token: "",
          user,
          ...req.body,
          admin: Boolean(admin),
        };
        next();
      } else {
        res.status(500).json({ message: `Invalid user` });
        return;
      }
    } else {
      res.status(500).json({ message: `Invalid token` });
      return;
    }
  }
}

module.exports = {
  userMiddleware,
};
