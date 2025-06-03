const express = require("express");
const router = express.Router();

const { getTeachersCount } = require("../services/teacher");
const { getTotalStudentsCount } = require("../services/user");
const { userMiddleware } = require("../middlewares/middleware");
const { USER_STATUS } = require("../helpers/constant");
require("dotenv").config();

module.exports = function () {
  // Get teachers.
  router.get("/dashboard/teachers/count", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;

      const { searchKey } = req.query;

      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;

      const totalTeacherCount = await getTeachersCount(
        organization_id,
        searchKey
      );

      res.status(200).json({
        message: "Teachers found",
        data: {
          totalCount: totalTeacherCount,
        },
      });
    } catch (error) {
      console.error("Error while getting teachers data:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  router.get("/dashboard/students/count", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { searchKey } = req.query;

      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;
      const totalUserCount = await getTotalStudentsCount(
        organization_id,
        searchKey,
        gender = undefined,
        fromDate = undefined,
        toDate = undefined,
        status = USER_STATUS.APPROVE
      );

      res.status(200).json({
        message: "Users found",
        data: {
          totalCount: totalUserCount,
        },
      });
    } catch (error) {
      console.error("Error while getting teachers data:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  return router;
};
