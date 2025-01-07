const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const { createGroup, getAllGroups, getAllCoursesCount, findGroupById, updateGroup, deleteGroup } = require("../services/groupService");
const { updateTeacherData, findTeacherById } = require("../services/teacher");
const router = express.Router();

module.exports = function () {
  // group list
  router.get("/group", userMiddleware, async (req, res) => {
    try {
        const { student, teacher } = req.body;
        const { limit, offset, searchKey, sortBy, sortOrder } = req.query;
  
        const organizationId = student
          ? student.organization_id
          : teacher.organization_id;
        const groups = await getAllGroups(
            searchKey,
            sortBy,
            organizationId,
            sortOrder,
            !limit || limit == "null" || limit == "undefined" ? courseCount: limit,
            offset
          );
        const groupsCount = await getAllCoursesCount(organizationId, searchKey);

        if (groups) {
          res.status(200).json({
            message: `Fetched all courses`,
            data: { groups, offset, totalCount: groupsCount },
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

  // group add
  router.post("/group", userMiddleware, async (req, res) => {
    const {group_name, teacher_assignee} = req.body;

    // validation
    if(!group_name || (!teacher_assignee || (teacher_assignee && teacher_assignee.length <= 0))){
        res.status(422).json({
            message: `Fill all the fields`,
          });
        return;
    }

    const groupData = await createGroup({group_name, teacher_ids: teacher_assignee});
    // update group_ id in respective teachers
    const group_id = groupData.group_id;
    teacher_assignee.map(async (teacherId)=>{
      const updatedTeacher = await updateTeacherData(
        { teacher_id: teacherId },
        {group_ids: [group_id]}
      );
    })
    

    if (groupData) {
        res.status(200).json({
          message: `Group created successfully`,
          data: groupData,
        });
        return;
      } else {
        res.status(500).json({
          message: `Unable to create group`,
        });
      }
  });

  // Update Course
  router.post("/group/:id", userMiddleware, async (req, res) => {
    const groupId = parseInt(req.params.id);
    const {group_name, teacher_assignee} = req.body;

    // validation
    if(!group_name || (!teacher_assignee || (teacher_assignee && teacher_assignee.length <= 0))){
        res.status(422).json({
            message: `Fill all the fields`,
          });
        return;
    }

    const { admin, student } = req.body;
    if (!admin) {
      res.status(403).json({
        message: `Only admin can update exam course.`,
      });
      return;
    }
    try {
      const data = {
        group_name: req.body.group_name,
        teacher_ids: req.body.teacher_assignee,
      };

      const groupData = await findGroupById(groupId);
      const teacherIds = groupData.teacher_ids;
      const newTeacherIds = teacherData.group_ids;

      // check if any teacher removes, If remove then need to remove group id from that teacher

      // teacher data
      if (groupData) {

        teacher_assignee.map(async (teacherId)=>{
          // teacher find and bind group_ids with new group
          const teacherData = await findTeacherById(teacherId);
          
          if(!teacherData.group_ids.includes(teacherId)){
            const groupIds = [...teacherData.group_ids, groupId]

            const updatedTeacher = await updateTeacherData(
              { teacher_id: teacherId },
              {group_ids: groupIds}
            );
          }
        })

        const updatedCourse = await updateGroup({ group_id: groupId }, data);


        if (!updatedCourse) {
          res.status(500).json({
            message: `Unable to update group.`,
          });
          return;
        }
        res.status(200).json({
          message: `Group updated successfully`,
          data: updatedCourse,
        });
      } else {
        res.status(422).json({
          message: `Unable to find group`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Error while updating group: ${error}`,
      });
    }
  });

  // only Admin
  // Delete course
  router.delete("/group/:id", userMiddleware, async (req, res) => {
    const { admin, student } = req.body;
    const id = parseInt(req.params.id);

    if (!admin) {
      res.status(403).json({
        message: `You are not authorize to perform this action.`,
      });
      return;
    }
    try {
      const course = await findGroupById(id);
      const deletedCourse = await deleteGroup({ group_id: id });
      if (!deletedCourse) {
        res.status(500).json({
          message: `Unable to delete group.`,
        });
        return;
      }
      res.status(200).json({
        message: `Group deleted successfully`,
        data: deletedCourse,
      });
    } catch (error) {
      res.status(500).json({
        message: `Error while deleting course: ${error}`,
      });
    }
  });

  return router;
}