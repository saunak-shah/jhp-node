const express = require("express");
const router = express.Router();
const bcrypt = require("../helpers/bcrypt");
const crypto = require("crypto");
const {
  findUserByUniqueId,
  createUser,
  updateUser,
  findUserByResetPasswordToken,
  findUserByResetEmailToken,
  deleteUser,
  getAllUsers,
  findUserById,
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
  router.get("/users/check_unique_id/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const isunique_idPresent = await findUserByUniqueId(id);
      if (isunique_idPresent) {
        res
          .status(422)
          .json({ message: "Unique Id already present.", data: false });
      } else {
        res.status(200).json({ message: "Id is unique", data: true });
      }
    } catch (error) {
      console.error("Error while checking unique id:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Get users.
  router.get("/users", userMiddleware, async (req, res) => {
    try {
      const { limit, offset, nameFilter } = req.body;
      const users = await getAllUsers(limit, offset, nameFilter);
      if (users && users.length > 0) {
        res.status(200).json({ message: "Users found", data: users });
      } else {
        res.status(422).json({ message: "User not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting users:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Get user by unique Id.
  router.get("/users/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await findUserById(id);
      if (user) {
        res.status(200).json({ message: "User found", data: user });
      } else {
        res.status(422).json({ message: "User not found", data: null });
      }
    } catch (error) {
      console.error("Error while getting user with unique id:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Signup route
  router.post("/users/signup", async (req, res) => {
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
        unique_id,
        org_id,
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
        !unique_id ||
        !org_id ||
        !address
      ) {
        res
          .status(422)
          .json({ message: "Fill all the fields properly", data: null });
        return;
      }

      const isUniqueIdPresent = await findUserByUniqueId(unique_id);
      if (isUniqueIdPresent) {
        res
          .status(422)
          .json({ message: "Unique Id already present.", data: false });
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

      const user = await createUser({
        first_name,
        last_name,
        father_name,
        phone_number,
        email,
        address,
        password: encPassword,
        birth_date,
        gender,
        unique_id,
        org_id,
      });
      if (user) {
        //   // Sending mail
        // const subject = `Welcome to JHP Family`;
        // const text = `Your registration is successful\n Your Unique Id : ${unique_id}.\n Your password is : ${password} \n Use this unique id to login `;
        // const isMailSent = await sendEmail(email, subject, text);
        // if (!isMailSent) {
        //   console.error(`Unable to send mail`);
        // } else {
        res.status(200).json({ message: "Signup successful", data: user });
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
  router.post("/users/login", async (req, res) => {
    const { unique_id, password } = req.body;
    if (!unique_id || !password) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      const user = await findUserByUniqueId(unique_id);
      if (user) {
        const isValidPassword = bcrypt.isValidPassword(user.password, password);
        if (isValidPassword) {
          const token = signJwt(user);
          if (token) {
            res.status(200).json({
              message: `Login successful for user`,
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
  router.put("/users/update_profile", userMiddleware, async (req, res) => {
    const { user, data } = req.body;
    try {
      const updatedUser = await updateUser({ unique_id: user.unique_id }, data);
      if (updatedUser) {
        const data = (({ password, ...o }) => o)(updatedUser);
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
  router.put("/users/change_password", userMiddleware, async (req, res) => {
    const { user, oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(422).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      if (bcrypt.isValidPassword(user.password, oldPassword)) {
        if (newPassword.length <= 4 || newPassword.length >= 12) {
          res
            .status(422)
            .send("New Password length should be between 4 to 12 characters.");
          return;
        }
        const newEncPassword = bcrypt.createHash(newPassword);
        const updatedUser = await updateUser(
          { unique_id: user.unique_id },
          {
            password: newEncPassword,
          }
        );
        if (updatedUser) {
          // const data = (({ password, ...o }) => o)(updatedUser);
          res.status(200).json({
            message: `User's password changed successfully.`,
            // data: {
            //   user: data,
            // },
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
  router.post("/users/forgot_password", async (req, res) => {
    const { unique_id, email } = req.body;
    try {
      const userByUniqueId = await findUserByUniqueId(unique_id);
      if (
        userByUniqueId &&
        userByUniqueId.email.toLowerCase() == email.toLowerCase()
      ) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedUser = await updateUser(
          { unique_id },
          {
            reset_password_token: token,
            reset_password_token_expiration: new Date(
              Date.now() + 3600000
            ).toISOString(), // 10 minutes
          }
        );

        if (!updatedUser) {
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
  router.get("/users/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const userData = await findUserByResetPasswordToken(token);
      if (!userData) {
        return res
          .status(422)
          .send("Password reset token is invalid or has expired");
      } else {
        res.status(200).json({
          message: `Correct User.`,
        });
      }
      return;
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Password reset
  router.put("/users/reset/:token", async (req, res) => {
    try {
      const token = req.params.token;
      const { password, unique_id } = req.body;
      if (password.length <= 4 || password.length >= 12) {
        res
          .status(422)
          .send("Password length should be between 4 to 12 characters.");
        return;
      }
      const userData = await findUserByResetPasswordToken(token);
      if (!userData) {
        res.status(422).send("Password reset token is invalid or has expired");
        return;
      }

      // Update user's password here
      const updatedUser = await updateUser(
        {
          reset_password_token: token,
          unique_id,
        },
        {
          password: bcrypt.createHash(password),
          reset_password_token: "",
          reset_password_token_expiration: new Date(Date.now()).toISOString(),
        }
      );

      if (!updatedUser) {
        res.status(500).json({ message: `User not updated` });
        return;
      }

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
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
  router.delete("/users/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body;
      if (user && user.unique_id == id) {
        const deletedUser = await deleteUser({ unique_id: id });
        if (deletedUser) {
          res
            .status(200)
            .json({ message: "User deleted", data: { user: deletedUser } });
        } else {
          res.status(500).json({ message: "Unable to delete user" });
        }
      } else {
        res.status(422).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error while getting user with unique id:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
