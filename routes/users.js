const express = require("express");
const router = express.Router();
const bcrypt = require("../helpers/bcrypt");
const crypto = require("crypto");

const {
  findStudentByUsername,
  createStudentData,
  updateStudentData,
  findStudentByResetPasswordToken,
  findStudentByResetEmailToken,
  deleteStudentData,
  getAllStudents,
  findStudentById,
} = require("../services/user");

const { sendEmail } = require("../helpers/sendEmail");
const { signJwt } = require("../helpers/jwt");
const { userMiddleware } = require("../middlewares/middleware");
require("dotenv").config();

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
      const isUsernamePresent = await findStudentByUsername(username);
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
  router.get("/students", async (req, res) => {
    try {
      const { limit, offset } = req.body;
      const users = await getAllStudents(limit, offset);
      if (users && users.length > 0) {
        res.status(200).json({ message: "Users found", data: users });
      } else {
        res.status(422).json({ message: "User not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting users:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Get student by username.
  router.get("/students/:username", userMiddleware, async (req, res) => {
    try {
      const { username } = req.params;
      const user = await findStudentByUsername(username);
      if (user) {
        res.status(200).json({ message: "User found", data: user });
      } else {
        res.status(422).json({ message: "User not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting user with unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  // Get student by id.
  router.get("/students/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await findStudentById(id);
      if (user) {
        res.status(200).json({ message: "User found", data: user });
      } else {
        res.status(422).json({ message: "User not found", data: null });
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
      const {
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

      const isUsernamePresent = await findStudentByUsername(username);
      if (isUsernamePresent) {
        res
          .status(422)
          .json({ message: "Username already present.", data: false });
        return;
      }

      if (password.length <= 4 || password.length >= 12) {
        res
          .status(422)
          .send("Password length should be between 4 to 12 characters.");
        return;
      }

      if (!validateEmail(email) || !validatePhoneNumber(phone_number)) {
        res.status(422).send("Invalid data");
        return;
      }

      // hash password
      let encPassword = bcrypt.createHash(password);

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
      });
      if (student) {
        //   // Sending mail
        // const subject = `Welcome to JHP Family`;
        // const text = `Your registration is successful\n Your Unique Id : ${unique_id}.\n Your password is : ${password} \n Use this unique id to login `;
        // const isMailSent = await sendEmail(email, subject, text);
        // if (!isMailSent) {
        //   console.error(`Unable to send mail`);
        // } else {
        res.status(200).json({ message: "Signup successful", data: student });
        // }
      } else {
        res.status(500).send("Internal Server Error");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Login route
  router.post("/students/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      const student = await findStudentByUsername(username);
      if (student) {
        const isValidPassword = bcrypt.isValidPassword(
          student.password,
          password
        );
        if (isValidPassword) {
          const token = signJwt(student);
          if (token) {
            res.status(200).json({
              message: `Login successful for student`,
              data: token,
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

  // Update profile route
  router.post("/students/update_profile", userMiddleware, async (req, res) => {
    const { student, data } = req.body;
    try {
      const updatedStudent = await updateStudentData(
        { username: student.username },
        data
      );
      if (updatedStudent) {
        const data = (({ password, student_id, username, ...o }) => o)(
          updatedStudent
        );
        res.status(200).json({
          message: `User profile updated successfully.`,
          data: {
            user: data,
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
        if (newPassword.length <= 4 || newPassword.length >= 12) {
          res
            .status(422)
            .send("New Password length should be between 4 to 12 characters.");
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
      const studentByUsername = await findStudentByUsername(username);
      if (
        studentByUsername &&
        studentByUsername.email.toLowerCase() == email.toLowerCase()
      ) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedStudent = await updateStudentData(
          { username },
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
        const text =
          `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${process.env.BASE_URL}/users/reset/${token}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`;
        const isMailSent = await sendEmail(to, subject, text);
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

  // Password reset form
  router.get("/students/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const studentData = await findStudentByResetPasswordToken(token);
      if (!studentData) {
        return res
          .status(422)
          .send("Password reset token is invalid or has expired");
      } else {
        res.status(200).json({
          message: `Correct Student.`,
        });
      }
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Password reset
  router.post("/students/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const { password, username } = req.body;
      if (password.length <= 4 || password.length >= 12) {
        res
          .status(422)
          .send("Password length should be between 4 to 12 characters.");
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
          username,
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
      const { student } = req.body;
      if (student && student.student_id == id) {
        const deletedStudent = await deleteStudentData({ student_id: id });
        if (deletedStudent) {
          res
            .status(200)
            .json({
              message: "Student deleted",
              data: { student: deletedStudent },
            });
        } else {
          res.status(500).json({ message: "Unable to delete student" });
        }
      } else {
        res.status(422).json({ message: "Student not found" });
      }
    } catch (error) {
      console.error("Error while getting student with unique id:", error);
      res.status(500).send(`Internal Server Error: ${error}`);
    }
  });

  return router;
};
