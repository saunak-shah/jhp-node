const express = require("express");
const router = express.Router();
const bcrypt = require("../helpers/bcrypt");
const crypto = require("crypto");
const moment = require("moment");

const {
  findStudentByUsername,
  createStudentData,
  updateStudentData,
  findStudentByResetPasswordToken,
  findStudentByResetEmailToken,
  deleteStudentData,
  getAllStudents,
  findStudentById,
  findStudentByRegisterNumber,
  getTotalStudentsCount,
  findStudentsAssignedToTeacherData,
  findStudentsByGenderGroup,
  findStudentsByAgeGroup,
  findStudentByUserInfo,
} = require("../services/user");

const { sendEmail } = require("../helpers/sendEmail");
const { signJwt } = require("../helpers/jwt");
const { userMiddleware } = require("../middlewares/middleware");
const { getOrganization } = require("../services/organization");
require("dotenv").config();
const { USER_STATUS } = require("../helpers/constant");


// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone number validation regex (simple international format)
const phoneRegex = /^\d{10}$/;

// Function to validate email
function validateEmail(email) {
  return emailRegex.test(email);
}

// Function to validate phone number, defaulting to +91 if no prefix is provided
function validatePhoneNumber(phone_number) {
  return phoneRegex.test(phone_number);
}

module.exports = function () {
  // Check unique Id if present in db or not.
  router.get("/students/check_username/:username", async (req, res) => {
    try {
      const { username } = req.params;
      const isUsernamePresent = await findStudentByUsername(
        username.toLowerCase()
      );
      if (isUsernamePresent) {
        res
          .status(422)
          .json({ message: "Username already present.", data: false });
      } else {
        res.status(200).json({ message: "Username not present", data: true });
      }
    } catch (error) {
      console.error("Error while checking unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Get users.
  router.get("/students", userMiddleware, async (req, res) => {
    try {
      const { student, teacher } = req.body;
      const status = req.query?.status === "Pending" ? USER_STATUS.PENDING : USER_STATUS.APPROVE;
      let {
        limit,
        offset,
        searchKey,
        sortBy,
        sortOrder,
        gender,
        fromDate,
        toDate,
      } = req.query;

      const organization_id =
        student && student?.organization_id
          ? student?.organization_id
          : teacher?.organization_id;

      let teacherId = teacher.teacher_id;
      // Admin role
      if (Number(teacher.master_role_id) === 1) {
        teacherId = undefined;
      }
      if(fromDate){
        fromDate = moment(fromDate).format();
      }
      if(toDate){
        toDate = moment(toDate).format();
      }
      
      const totalUserCount = await getTotalStudentsCount(
        organization_id,
        searchKey,
        teacherId,
        gender,
        fromDate,
        toDate,
        status
      );

      const users = await getAllStudents(
        searchKey,
        sortBy,
        organization_id,
        sortOrder,
        !limit || limit == "null" || limit == "undefined"
          ? totalUserCount
          : limit,
        offset,
        teacherId,
        gender,
        fromDate,
        toDate,
        status
      );

      res.status(200).json({
        data: {
          users,
          offset,
          totalCount: totalUserCount,
        },
      });
    } catch (error) {
      console.error("Error while getting users:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });
       

  // Get student by username.
  router.get(
    "/students/username/:username",
    userMiddleware,
    async (req, res) => {
      try {
        const { username } = req.params;
        const user = await findStudentByUsername(username.toLowerCase());
        if (user) {
          res.status(200).json({ message: "User found", data: user });
        } else {
          res.status(422).json({ message: "User not found", data: null });
        }
      } catch (error) {
        console.error("Error while getting user with unique id:", error);
        res.status(500).send(`Internal Server Error: ${error}`);
      }
    }
  );

  // Get student by id.
  router.get("/students/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await findStudentById(parseInt(id));
      if (user) {
        res.status(200).json({ message: "User found", data: user });
      } else {
        res.status(204).json({ message: "User not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting user with unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Signup route
  router.post("/students/signup", async (req, res) => {
    try {
      // Extract necessary data from request body
      let {
        first_name,
        last_name,
        father_name,
        phone_number,
        address,
        email,
        password,
        birth_date,
        gender,
        username,
        organization_id,
      } = req.body;

      if (
        !first_name ||
        !last_name ||
        !father_name ||
        !phone_number ||
        !email ||
        !password ||
        !birth_date ||
        !gender ||
        !username ||
        !organization_id ||
        !address
      ) {
        res
          .status(422)
          .json({ message: "Fill all the fields properly", data: null });
        return;
      }

      // trim username
      username = username.trim();

      const isUsernamePresent = await findStudentByUsername(
        username.toLowerCase()
      );
      if (isUsernamePresent) {
        res
          .status(422)
          .json({ message: "Username already present.", data: false });
        return;
      }
      // user exists with same firstname, lastname, fathername, mobile no
      const isUserExists = await findStudentByUserInfo(
        {first_name, last_name, father_name, phone_number }
      );
      if (isUserExists) {
        res
          .status(422)
          .json({ message: "User already present.", data: false });
        return;
      }


      if (password.length <= 4) {
        res.status(422).json({
          message: "Password length should be greater then 4 characters.",
          data: false,
        });
        return;
      }

      if (!validateEmail(email)) {
        res.status(422).json({ message: "Email is invalid.", data: false });
        return;
      }
      if (!validatePhoneNumber(phone_number)) {
        res
          .status(422)
          .json({ message: "Phone number is invalid.", data: false });
        return;
      }

      // hash password
      let encPassword = bcrypt.createHash(password);

      const organization = await getOrganization(organization_id);
      const date = moment(birth_date).format("DD");
      const month = moment(birth_date).format("MM");
      const randomNo = Number(Date.now().toString().slice(-2));

      let register_no =
        organization.name.slice(0, 3) +
        first_name[0] +
        last_name[0] +
        date +
        month +
        randomNo;

      while (true) {
        const isStudentExists = await findStudentByRegisterNumber(register_no);
        if (isStudentExists) {
          register_no =
            organization.name.slice(0, 3) +
            first_name[0] +
            father_name[0] +
            last_name[0] +
            date +
            month;
        } else {
          break;
        }
      }

      const student = await createStudentData({
        first_name,
        last_name,
        father_name,
        phone_number,
        email,
        address,
        password: encPassword,
        birth_date,
        gender,
        username,
        organization_id,
        register_no: register_no.toLocaleUpperCase(),
        status: USER_STATUS.PENDING
      });

      if (student) {
        const token = signJwt(student);
        if (token) {
          res.status(200).json({
            message: `Signup successful for student`,
            data: {
              student_id: student.student_id,
              username: student.username.toLowerCase(),
              first_name: student.first_name,
              last_name: student.last_name,
              register_no: student.register_no,
              assigned_to: student.assigned_to,
              token: token,
            },
          });
        } else {
          res.status(500).json({
            message: `Internal Server Error while creating jwt token`,
          });
          return;
        }
        // Sending mail
        const subject = `Welcome to JHP Family`;
        const text = `
          <html>
            <body>
              <pre>
Hello ${student.first_name}
                
Thank you for registering with us. Below are your login details. Please keep them secure and do not share them with anyone.

<b>Username:</b> ${student.username.toLowerCase()} 
<b>Password:</b> ${password} 
                
You can log in using the below link: 
                
<a href="https://software.jhpparivar.in">https://software.jhpparivar.in</a>
                </pre>
            </body>
          </html>`;
        const isMailSent = await sendEmail(email, subject, text);
        if (!isMailSent) {
          console.error(`Unable to send mail`);
        }
      } else {
        return res.status(500).json({
          message: "An error occurred during signup. Please try again later",
        });
      }
    } catch (error) {
      console.error("Error during signup:", error);
      return res
        .status(500)
        .json({ message: "There is some error. Please try again." });
    }
  });

  // Login route
  router.post("/students/login", async (req, res) => {
    let { username, password } = req.body;
    if (!username || !password) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      // trim username
      username = username.trim();
      const student = await findStudentByUsername(username.toLowerCase());
      if (student) {
        if(parseInt(student.status) === USER_STATUS.PENDING){
          res.status(403).json({
            message: `Your account is pending approval. Please wait for admin approval.`,
          });
          return;
        }
        const isValidPassword = bcrypt.isValidPassword(
          student.password,
          password
        );
        if (isValidPassword) {
          const token = signJwt(student);
          if (token) {
            res.status(200).json({
              message: `Login successful for student`,
              data: {
                student_id: student.student_id,
                username: student.username.toLowerCase(),
                first_name: student.first_name,
                last_name: student.last_name,
                register_no: student.register_no,
                assigned_to: student.assigned_to,
                token: token,
              },
            });
          } else {
            res.status(500).json({
              message: `Internal Server Error while creating jwt token`,
            });
            return;
          }
        } else {
          res.status(422).json({ message: `Invalid username or password` });
          return;
        }
      } else {
        res.status(422).json({ message: `User does not exist` });
        return;
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Update profile route from student portal
  router.post("/students/update_profile", userMiddleware, async (req, res) => {
    const { student, data, student_id, teacher } = req.body;
    let targetStudentId;
    // If request is from student (student portal)
    if (student && !student_id) {
      targetStudentId = student.student_id;
    }
    // If request is from admin (admin portal)
    if (teacher && data.student_id) {
      targetStudentId = data.student_id;
    }
    const updateData = (({ password, student_id, username, ...o }) => o)(data);
    if (!targetStudentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    try {
      updateData.updated_at = new Date().toISOString();
      const updatedStudent = await updateStudentData(
        { student_id: targetStudentId },
        updateData
      );

      if (updatedStudent) {
        res.status(200).json({
          message: `User profile updated successfully.`,
          data: {
            user: {
              student_id: updatedStudent.student_id,
              first_name: updatedStudent.first_name,
              last_name: updatedStudent.last_name,
              father_name: updatedStudent.father_name,
              email: updatedStudent.email,
              phone_number: updatedStudent.phone_number,
              address: updatedStudent.address,
              birth_date: updatedStudent.birth_date,
              register_no: updatedStudent.register_no,
            },
          },
        });
      } else {
        res.status(422).json({
          message: `Invalid data`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Change password
  router.post("/students/change_password", userMiddleware, async (req, res) => {
    const { student, oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      if (bcrypt.isValidPassword(student.password, oldPassword)) {
        if (newPassword.length <= 4) {
          res
            .status(422)
            .send("New password length should be greater then 4 characters.");
          return;
        }
        const newEncPassword = bcrypt.createHash(newPassword);
        const updatedUser = await updateStudentData(
          { student_id: student.student_id },
          {
            password: newEncPassword,
          }
        );
        if (updatedUser) {
          res.status(200).json({
            message: `User's password changed successfully.`,
          });
        } else {
          res.status(500).json({
            message: `Failed to update password.`,
          });
        }
      } else {
        res.status(422).json({
          message: `Invalid Password provided.`,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: `Internal Server Error: ${error}`,
      });
    }
  });

  // Forgot password
  router.post("/students/forgot_password", async (req, res) => {
    const { username, email } = req.body;
    try {
      if (!validateEmail(email)) {
        res.status(422).json({ message: "Email is invalid.", data: false });
        return;
      }
      const studentByUsername = await findStudentByUsername(
        username.toLowerCase()
      );
      if (
        studentByUsername &&
        studentByUsername.email.toLowerCase() == email.toLowerCase()
      ) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedStudent = await updateStudentData(
          { username: username.toLowerCase() },
          {
            reset_password_token: token,
            reset_password_token_expiration: new Date(
              Date.now() + 3600000
            ).toISOString(), // 10 minutes
          }
        );

        if (!updatedStudent) {
          res.status(500).json({
            message: `User not updated for reset token.`,
          });
          return;
        }

        const to = email.toLowerCase();
        const subject = "Password Reset";

        const html = `
          <html>
            <body>
              <pre>
Hello ${studentByUsername.first_name} ${studentByUsername.last_name} 
                
You are receiving this because you (or someone else) have requested the reset of the password for your account.

<p>Please click on the following link, or paste this into your browser to complete the process:</p>
<p><a href="${process.env.BASE_URL}/reset_password/${token}" target="_blank">${process.env.BASE_URL}/reset_password/${token}</a></p>
<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>         
You can log in using the below link:     
<a href="https://software.jhpparivar.in">https://software.jhpparivar.in</a>
                </pre>
            </body>
          </html>`;

        const isMailSent = await sendEmail(to, subject, html);
        console.log("isMailSent=========", isMailSent)

        if (isMailSent) {
          res.status(200).json({
            message: `Password reset link sent on email.`,
          });
          return;
        } else {
          res.status(500).json({
            message: `Password reset link sending failed.`,
          });
        }
      } else {
        res.status(422).json({
          message: `Invalid unique Id`,
        });
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while forgot password: ${error}` });
      return;
    }
  });

  // Password reset
  router.post("/students/reset_password/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const { password, cpassword } = req.body;
      if (password !== cpassword) {
        res.status(422).json({
          message: "Password and confirm password should be same.",
          data: false,
        });
        return;
      }

      if (password.length <= 4) {
        res.status(422).json({
          message: "Password length should be greater then 4 characters.",
          data: false,
        });
        return;
      }
      const studentData = await findStudentByResetPasswordToken(token);
      if (!studentData) {
        res.status(422).send("Password reset token is invalid or has expired");
        return;
      }

      // Update user's password here
      const updatedStudent = await updateStudentData(
        {
          reset_password_token: token,
          username: studentData.username.toLowerCase(),
        },
        {
          password: bcrypt.createHash(password),
          reset_password_token: "",
          reset_password_token_expiration: new Date(Date.now()).toISOString(),
        }
      );

      if (!updatedStudent) {
        res.status(500).json({ message: `Student not updated` });
        return;
      }

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // // Email reset
  // router.post("/users/reset/email", userMiddleware, async (req, res) => {
  //   const { user } = req.body;
  //   try {
  //     const userByUniqueId = await findUserByUniqueId(user.unique_id);
  //     if (userByUniqueId) {
  //       const token = crypto.randomBytes(20).toString("hex");
  //       const updatedUser = await updateUser(
  //         { unique_id: user.unique_id },
  //         {
  //           reset_email_token: token,
  //           reset_email_token_expiration: new Date(
  //             Date.now() + 300000
  //           ).toISOString(), // 5 minutes
  //         }
  //       );

  //       if (!updatedUser) {
  //         res.status(500).json({
  //           message: `User not updated for reset token.`,
  //         });
  //         return;
  //       }

  //       const to = user.email.toLowerCase();
  //       const subject = "Email Reset";
  //       const text =
  //         `You are receiving this because you (or someone else) have requested the reset of the email for your account.\n\n` +
  //         `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
  //         `${process.env.BASE_URL}/users/reset/email/${token}\n\n` +
  //         `If you did not request this, please ignore this email and your password will remain unchanged.\n`;
  //       const isMailSent = await sendEmail(to, subject, text);
  //       if (isMailSent) {
  //         res.status(200).json({
  //           message: `Email reset link sent on old email.`,
  //         });
  //         return;
  //       } else {
  //         res.status(500).json({
  //           message: `Password reset link sending failed.`,
  //         });
  //       }
  //     } else {
  //       res.status(422).json({
  //         message: `Invalid unique Id`,
  //       });
  //       return;
  //     }
  //   } catch (error) {
  //     res
  //       .status(500)
  //       .json({ message: `Error while forgot password: ${error}` });
  //     return;
  //   }
  // });

  // // Email reset form
  // router.get("/users/reset/email/:token", userMiddleware, async (req, res) => {
  //   try {
  //     const { user } = req.body;
  //     const token = req.params.token;
  //     const userData = await findUserByResetEmailToken(user.unique_id, token);
  //     if (!userData) {
  //       return res
  //         .status(422)
  //         .send("Email reset token is invalid or has expired");
  //     } else {
  //       res.status(200).json({
  //         message: `Correct User.`,
  //       });
  //     }
  //     return;
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Internal Server Error");
  //   }
  // });

  // // Email reset
  // router.put("/users/reset/email/:token", userMiddleware, async (req, res) => {
  //   try {
  //     const token = req.params.token;
  //     const { email, user } = req.body;
  //     if (!email) {
  //       res.status(422).json({
  //         message: `Fill all the fields properly`,
  //       });
  //       return;
  //     }
  //     const userData = await findUserByResetEmailToken(user.unique_id, token);
  //     if (!userData) {
  //       res.status(422).send("Email reset token is invalid or has expired");
  //       return;
  //     }

  //     // Update user's Email here
  //     const updatedUser = await updateUser(
  //       {
  //         unique_id: user.unique_id,
  //         reset_email_token: token,
  //       },
  //       {
  //         email,
  //         reset_email_token: "",
  //         reset_email_token_expiration: new Date(Date.now()).toISOString(),
  //       }
  //     );

  //     if (!updatedUser) {
  //       res.status(500).json({ message: `User not updated.` });
  //       return;
  //     }

  //     res.status(200).json({ message: "Email has been reset successfully" });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Internal Server Error");
  //   }
  // });

  // Delete user by unique Id.
  router.delete("/students/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      // const { student } = req.body;
      // if (student && student.student_id == id) {

      const deletedStudent = await deleteStudentData({
        student_id: parseInt(id),
      });

      if (deletedStudent) {
        res.status(200).json({
          message: "Student deleted",
          data: { student: deletedStudent },
        });
      } else {
        res.status(500).json({ message: "Unable to delete student" });
      }
      // } else {
      //   res.status(204).json({ message: "Student not found" });
      // }
    } catch (error) {
      console.error("Error while getting student with unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  router.get(
    "/students-assign-graph-data",
    userMiddleware,
    async (req, res) => {
      const { admin, teacher } = req.body;
      /* if (!admin) {
        throw new Error("Only admin");
      } */

      const data = await findStudentsAssignedToTeacherData(
        teacher?.organization_id
      );

      const teachers = [];
      const studentCount = [];

      for (let i = 0; i < data.length; i++) {
        teachers.push(data[i].teachers);
        studentCount.push(parseInt(data[i].student_count));
      }
      res.status(200).json({
        message: `Data fetched successfully`,
        data: {
          teachers,
          studentCount,
        },
      });
    }
  );

  router.get("/students-age-group-data", userMiddleware, async (req, res) => {
    const { admin, teacher } = req.body;
    /* if (!admin) {
        throw new Error("Only admin");
      } */

    const data = await findStudentsByAgeGroup(teacher?.organization_id);

    const ageGroup = [];
    const studentCount = [];

    for (let i = 0; i < data.length; i++) {
      ageGroup.push(data[i].age_range);
      studentCount.push(parseInt(data[i].student_count));
    }

    res.status(200).json({
      message: `Data fetched successfully`,
      data: {
        ageGroup,
        studentCount,
      },
    });
  });

  router.get(
    "/students-gender-group-data",
    userMiddleware,
    async (req, res) => {
      const { admin, teacher } = req.body;
      /* if (!admin) {
        throw new Error("Only admin");
      } */

      const data = await findStudentsByGenderGroup(teacher?.organization_id);

      const genderGroup = [];
      const studentCount = [];

      for (let i = 0; i < data.length; i++) {
        genderGroup.push(data[i].gender);
        studentCount.push(parseInt(data[i].student_count));
      }

      res.status(200).json({
        message: `Data fetched successfully`,
        data: {
          genderGroup,
          studentCount,
        },
      });
    }
  );

  // Forgot password
  router.put("/students/approve", async (req, res) => {
    const { id } = req.body;
    try {
      
      const studentData = await findStudentById(
        parseInt(id)
      );
      if (studentData) {
        const updatedStudent = await updateStudentData(
          { student_id: id },
          {
            status: USER_STATUS.APPROVE,
            updated_at: new Date().toISOString()
          }
        );

        if (!updatedStudent) {
          res.status(500).json({
            message: `User not approved.`,
          });
          return;
        }

        res.status(200).json({
          message: `Student approved successfully.`,
        });

        const to = studentData.email;
        const subject = "You are approved.";

        const html = `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <p>Hello ${studentData.first_name} ${studentData.last_name},</p>
              
              <p>You have been approved successfully.</p>

              <p>Please click on the following link, or paste it into your browser to complete the process:</p>

              <p>You can log in using the link below and assign your respective teacher:</p>

              <p><a href="https://software.jhpparivar.in" style="color: #007bff; text-decoration: none;">Login Here</a></p>

              <p>Best regards,</p>
              <p>JHP Team</p>
            </body>
          </html>
        `;

        const isMailSent = await sendEmail(to, subject, html);
        if (!isMailSent) {
          console.log("There is some issue to send an email.")
          return;
        }
      } else {
        res.status(422).json({
          message: `Student not found.`,
        });
        return;
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error while approved student: ${error}` });
      return;
    }
  });

  return router;
};
