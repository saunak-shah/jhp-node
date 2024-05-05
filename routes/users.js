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
} = require("../services/user");
const { sendEmail } = require("../helpers/sendEmail");
const { signJwt } = require("../helpers/jwt");
const { userMiddleware } = require("../middlewares/middleware");
require("dotenv").config();

module.exports = function () {
  // Check unique Id if present in db or not.
  router.get("/users/check_unique_id/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const isUniqueIdPresent = await findUserByUniqueId(id);
      if (isUniqueIdPresent) {
        res
          .status(500)
          .json({ message: "Unique Id already present.", value: false });
      } else {
        res.status(200).json({ message: "Id is unique", value: true });
      }
    } catch (error) {
      console.error("Error while checking unique id:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Get user by unique Id.
  router.get("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await findUserByUniqueId(id);
      if (user) {
        res.status(200).json({ message: "User found", user });
      } else {
        res.status(400).json({ message: "User not found", value: true });
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
        firstName,
        lastName,
        middleName,
        fatherName,
        motherName,
        phoneNumber,
        whatsappNumber,
        email,
        password,
        birthDate,
        gender,
        uniqueId,
        orgId,
      } = req.body;

      if (
        !firstName ||
        !lastName ||
        !middleName ||
        !fatherName ||
        !motherName ||
        !phoneNumber ||
        !whatsappNumber ||
        !email ||
        !password ||
        !birthDate ||
        !gender ||
        !uniqueId ||
        !orgId
      ) {
        res.status(500).json({ message: "Fill all the fields properly" });
        return;
      }

      const isUniqueIdPresent = await findUserByUniqueId(uniqueId);
      if (isUniqueIdPresent) {
        res
          .status(500)
          .json({ message: "Unique Id already present.", value: false });
          return
      } 

      if (password.length <= 4 || password.length >= 12) {
        res.send("Password length should be between 4 to 12 characters.");
        return;
      }

      // hash password
      let encPassword = bcrypt.createHash(password);

      const user = await createUser({
        firstName,
        lastName,
        middleName,
        fatherName,
        motherName,
        phoneNumber,
        whatsappNumber,
        email,
        password: encPassword,
        birthDate,
        gender,
        uniqueId,
        orgId,
      });
      if (user) {
        // Sending mail
        const subject = `Welcome to JHP Family`;
        const text = `Your registration is successful\n Your Unique Id : ${uniqueId}.\n Your password is : ${password} \n Use this unique id to login `;
        const isMailSent = await sendEmail(email, subject, text);
        if (!isMailSent) {
          console.error(`Unable to send mail`);
        } else {
          res.status(200).json({ message: "Signup successful", user });
        }
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
    const { uniqueId, password } = req.body;
    if (!uniqueId || !password) {
      res.status(400).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      const user = await findUserByUniqueId(uniqueId);
      if (user) {
        const isValidPassword = bcrypt.isValidPassword(user.password, password);
        if (isValidPassword) {
          const token = signJwt(user);
          if (token) {
            res.status(200).json({
              message: `Login successful for user with unique Id - ${uniqueId}`,
              token,
            });
          } else {
            res.status(500).json({
              message: `Internal Server Error while creating jwt token`,
            });
            return;
          }
        } else {
          res
            .status(403)
            .json({ message: `Invalid password for uniqueId - ${uniqueId}` });
          return;
        }
      } else {
        res
          .status(403)
          .json({ message: `User does not exist with uniqueId - ${uniqueId}` });
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
      const updatedUser = await updateUser({ uniqueId: user.uniqueId }, data);
      if (updatedUser) {
        const data = (({ password, ...o }) => o)(updatedUser);
        res.status(200).json({
          message: `User profile updated successfully.`,
          user: data,
        });
      } else {
        res.status(500).json({
          message: `Failed to update profile.`,
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
      res.status(400).json({
        message: `Fill all the fields properly`,
      });
      return;
    }
    try {
      if (bcrypt.isValidPassword(user.password, oldPassword)) {
        if (newPassword.length <= 4 || newPassword.length >= 12) {
          res.send("New Password length should be between 4 to 12 characters.");
          return;
        }
        const newEncPassword = bcrypt.createHash(newPassword);
        const updatedUser = await updateUser(
          { uniqueId: user.uniqueId },
          {
            password: newEncPassword,
          }
        );
        if (updatedUser) {
          const data = (({ password, ...o }) => o)(updatedUser);
          res.status(200).json({
            message: `User's password changed successfully.`,
            user: data,
          });
        } else {
          res.status(500).json({
            message: `Failed to update password.`,
          });
        }
      } else {
        res.status(403).json({
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
    const { uniqueId, email } = req.body;
    try {
      const userByUniqueId = await findUserByUniqueId(uniqueId);
      if (
        userByUniqueId &&
        userByUniqueId.email.toLowerCase() == email.toLowerCase()
      ) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedUser = await updateUser(
          { uniqueId },
          {
            resetPasswordToken: token,
            resetPasswordTokenExpiration: new Date(
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
        res.status(403).json({
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
          .status(400)
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
      const { password, uniqueId } = req.body;
      if (password.length <= 4 || password.length >= 12) {
        res.send("Password length should be between 4 to 12 characters.");
        return;
      }
      const userData = await findUserByResetPasswordToken(token);
      if (!userData) {
        res.status(400).send("Password reset token is invalid or has expired");
        return;
      }
      
      // Update user's password here
      const updatedUser = await updateUser(
        { 
          resetPasswordToken: token,
          uniqueId 
        },
        {
          password: bcrypt.createHash(password),
          resetPasswordToken: "",
          resetPasswordTokenExpiration: new Date(Date.now()).toISOString(),
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

  // Email reset
  router.post("/users/reset/email", userMiddleware, async (req, res) => {
    const { user } = req.body;
    try {
      const userByUniqueId = await findUserByUniqueId(user.uniqueId);
      if (userByUniqueId) {
        const token = crypto.randomBytes(20).toString("hex");
        const updatedUser = await updateUser(
          { uniqueId: user.uniqueId },
          {
            resetEmailToken: token,
            resetEmailTokenExpiration: new Date(
              Date.now() + 300000
            ).toISOString(), // 5 minutes
          }
        );

        if (!updatedUser) {
          res.status(500).json({
            message: `User not updated for reset token.`,
          });
          return;
        }

        const to = user.email.toLowerCase();
        const subject = "Email Reset";
        const text =
          `You are receiving this because you (or someone else) have requested the reset of the email for your account.\n\n` +
          `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
          `${process.env.BASE_URL}/users/reset/email/${token}\n\n` +
          `If you did not request this, please ignore this email and your password will remain unchanged.\n`;
        const isMailSent = await sendEmail(to, subject, text);
        if (isMailSent) {
          res.status(200).json({
            message: `Email reset link sent on old email.`,
          });
          return;
        } else {
          res.status(500).json({
            message: `Password reset link sending failed.`,
          });
        }
      } else {
        res.status(403).json({
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

  // Email reset form
  router.get("/users/reset/email/:token", userMiddleware, async (req, res) => {
    try {
      const { user } = req.body;
      const token = req.params.token;
      const userData = await findUserByResetEmailToken(user.uniqueId, token);
      if (!userData) {
        return res
          .status(400)
          .send("Email reset token is invalid or has expired");
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

  // Email reset
  router.put("/users/reset/email/:token", userMiddleware, async (req, res) => {
    try {
      const token = req.params.token;
      const { email, user } = req.body;
      if (!email) {
        res.status(400).json({
          message: `Fill all the fields properly`,
        });
        return;
      }
      const userData = await findUserByResetEmailToken(user.uniqueId, token);
      if (!userData) {
        res.status(400).send("Email reset token is invalid or has expired");
        return;
      }

      // Update user's Email here
      const updatedUser = await updateUser(
        { 
          uniqueId: user.uniqueId,
          resetEmailToken: token
        },
        {
          email,
          resetEmailToken: "",
          resetEmailTokenExpiration: new Date(Date.now()).toISOString(),
        }
      );

      if (!updatedUser) {
        res.status(500).json({ message: `User not updated.` });
        return;
      }

      res.status(200).json({ message: "Email has been reset successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Delete user by unique Id.
  router.delete("/users/:id", userMiddleware, async (req, res) => {
    try {
      const { id } = req.params;
      const { user } = req.body;
      if (user) {
        const deletedUser = await deleteUser({ uniqueId: id });
        if (deletedUser) {
          res.status(200).json({ message: "User deleted", user: deletedUser });
        } else {
          res.status(500).json({ message: "Unable to delete user" });
        }
      } else {
        res.status(400).json({ message: "User not found" });
      }
    } catch (error) {
      console.error("Error while getting user with unique id:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  return router;
};
