const express = require("express");
const AWS = require('aws-sdk');
const {
  createCourse,
  getAllCourses,
  findCourseByCourseId,
  updateCourse,
  deleteCourse,
  getAllCoursesCount,
} = require("../services/course");
const { userMiddleware } = require("../middlewares/middleware");
const { createApplication } = require("../services/applyForCourse");
const router = express.Router();

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require("dotenv").config();

const s3 = new AWS.S3({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});


// Export a function that accepts the database pool as a parameter
module.exports = function () {
  // Get all courses
  router.get("/courses", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const { limit, offset, searchKey, sortBy, sortOrder } = req.query;

      const organizationId = student
        ? student.organization_id
        : teacher.organization_id;
      const courseCount = await getAllCoursesCount(organizationId, searchKey);
      const courses = await getAllCourses(
        searchKey,
        sortBy,
        organizationId,
        sortOrder,
        !limit || limit == "null" || limit == "undefined" ? courseCount: limit,
        offset
      );
      if (courses) {
        res.status(200).json({
          message: `Fetched all courses`,
          data: { courses, offset, totalCount: courseCount },
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch courses`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting courses: ${error}`,
      });
    }
  });

  // Get course by courseId
  router.get("/courses/:id", userMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await findCourseByCourseId(id);
      if (course) {
        res.status(200).json({
          message: `Fetched course`,
          data: course,
        });
      } else {
        res.status(422).json({
          message: `Unable to fetch course`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error while getting course: ${error}`,
      });
    }
  });

  // Apply for course
  router.post("/courses/apply/:id", userMiddleware, async (req, res) => {
    try {
      // Extract necessary data from request body
      const id = parseInt(req.params.id);
      const { user } = req.body;

      // select the course which you want to give
      // after select the course need to show information about course like
      // generate unique course id
      // check if already apply or not for requested course

      const course = await findCourseByCourseId(id);
      if (
        !course ||
        course.registration_starting_date >
          new Date(Date.now()).toISOString() ||
        course.registration_closing_date < new Date(Date.now()).toISOString()
      ) {
        res.status(422).json({
          message: `Course registration cannot be done`,
        });
      }

      const application = await createApplication({
        userId: user.id,
        courseId: id,
      });

      if (application) {
        res.status(200).json({
          message: `Applied successfully for course`,
          data: application,
        });
      } else {
        res.status(500).json({
          message: `Unable to fill the application`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating application: ${error}`,
      });
    }
  });

  // onlyAdmin
  // Create Course
  router.post("/courses/", userMiddleware, async (req, res) => {
    const { admin } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `You dont have access to add Exam. Please contact to admin.`,
      });
      return;
    }
    try {
      // Extract necessary data from request body
      const {
        teacher,
        course_name,
        file_url,
        course_description,
        is_active,
      } = req.body;

      if (
        !teacher ||
        !course_name ||
        !file_url ||
        !course_description ||
        !is_active
      ) {
        res.status(422).json({
          message: `Fill all the fields`,
        });
        return;
      }

      const courseData = await createCourse({
        course_name,
        file_url,
        course_description,
        is_active,
        created_by: teacher.teacher_id,
        organization_id: teacher.organization_id,
      });

      if (courseData) {
        res.status(200).json({
          message: `Course created successfully`,
          data: courseData,
        });
        return;
      } else {
        res.status(500).json({
          message: `Unable to create course`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while creating course : ${error}`,
      });
      return;
    }
  });

  router.get("/generate-presigned-url", async (req, res) => {
    try {
      const { fileName, fileType } = req.query;
      console.log("filename", fileName)
      console.log("fileType", fileType)
      const sanitizedFileName = fileName.replace(/\s+/g, '_');
      const key = `uploads/${Date.now()}-${sanitizedFileName}`;
      const params = {
        Bucket: "attachment.jhpparivar.in",
        Key: key,
        Expires: 300, // 5 minutes
        ContentType: fileType,
      };
  
      const uploadURL = await s3.getSignedUrlPromise("putObject", params);
      // console.log("connect============", uploadURL);
      const url = decodeURIComponent(uploadURL);
      // console.log("url==================", url)
      res.status(200).json({ uploadURL: url, key: params.Key });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate URL", error });
    }
  });

  // only Admin
  // Update Course
  router.post("/courses/:id", userMiddleware, async (req, res) => {
    const { admin, student } = req.body;
    const id = parseInt(req.params.id);
    if (!admin) {
      res.status(403).json({
        message: `Only admin can update exam course.`,
      });
      return;
    }
    try {
      const data = {
        course_name: req.body.course_name,
        file_url: req.body.file_url,
        course_description: req.body.course_description,
      };
      const course = await findCourseByCourseId(id);
      /* if (course?.created_by != student?.student_id) {
        res.status(403).json({
          message: `Unable to update course while creator and updator is not same`,
        });
        return;
      } */
      if (course) {
        const updatedCourse = await updateCourse({ course_id: id }, data);
        if (!updatedCourse) {
          res.status(500).json({
            message: `Unable to update course.`,
          });
          return;
        }
        res.status(200).json({
          message: `Course updated successfully`,
          data: updatedCourse,
        });
      } else {
        res.status(422).json({
          message: `Unable to find course`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating course: ${error}`,
      });
    }
  });

  // only Admin
  // Delete course
  router.delete("/courses/:id", userMiddleware, async (req, res) => {
    const { admin, student } = req.body;
    const id = parseInt(req.params.id);
    console.log("admin", admin)

    if (!admin) {
      res.status(403).json({
        message: `You are not authorize to perform this action.`,
      });
      return;
    }
    try {
      const course = await findCourseByCourseId(id);
      /* if (course.created_by != student.student_id) {
        res.status(403).json({
          message: `Unable to update course while creator and updator is not same`,
        });
        return;
      } */
      const deletedCourse = await deleteCourse({ course_id: id });
      if (!deletedCourse) {
        res.status(500).json({
          message: `Unable to delete course.`,
        });
        return;
      }
      res.status(200).json({
        message: `Course deleted successfully`,
        data: deletedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting course: ${error}`,
      });
    }
  });

  return router;
};
