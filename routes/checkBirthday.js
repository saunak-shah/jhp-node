const express = require("express");
const { userMiddleware } = require("../middlewares/middleware");
const { getPeopleWithTodayBirthdays } = require("../services/checkBirthday");
const { sendEmail } = require("../helpers/sendEmail");

const router = express.Router();

module.exports = function () {
    router.get("/send-birthday-email", async (req, res) => {
        try {
            const { admin } = req.body;
            /* if (!admin) {
                res.status(400).json({
                    message: `Only Admin`,
                });
            } */
            const peopleWithBirthdays = await getPeopleWithTodayBirthdays();
            /* const peopleWithBirthdays = [{
                first_name: "saunak",
                last_name: "shah",
                email: 'saunakpshah@gmail.com'
            }] */
            console.log("peopleWithBirthdays", peopleWithBirthdays)
            if (peopleWithBirthdays.length > 0) {
                await Promise.all(
                    peopleWithBirthdays.map(async (person) => {
                        const to = person.email || person.teacher_email;
                        const subject = `Happy Birthday, ${person.first_name || person.teacher_first_name
                            }!`;

                            /* const text = `
                              <html>
                                <body>
                                  <pre>
                                        Dear ${person.first_name || person.teacher_first_name},
                                                        
                                        Wishing you a very Happy Birthday!. Have a wonderful day filled with joy and happiness.
                                        
                                        <b>Best wishes</b>
                                        <b>JHP Team</b> 
                                                        
                                        <a href="https://software.jhpparivar.in">https://software.jhpparivar.in</a>
                                                        </pre>
                                                    </body>
                                                </html>`; */

                                                const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f2f6fa;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 200px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
      padding: 40px 20px;
      text-align: center;
      color: #fff;
    }
    .header h1 {
      font-size: 28px;
      margin: 0;
    }
    .content {
      padding: 30px 40px;
      text-align: center;
    }
    .content p {
      font-size: 16px;
      line-height: 1.6;
      margin: 15px 0;
    }
    .button {
      display: inline-block;
      margin-top: 25px;
      padding: 12px 24px;
      background-color: #ff6f61;
      color: #fff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      transition: background 0.3s ease;
    }
    .button:hover {
      background-color: #e85b50;
    }
    .footer {
      background: #f2f6fa;
      padding: 15px;
      text-align: center;
      font-size: 13px;
      color: #888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Happy Birthday, ${person.first_name || person.teacher_first_name}!</h1>
    </div>
    <div class="content">
      <p>Wishing you a very Happy Birthday!</p>
      <p>Have a wonderful day filled with joy and happiness.</p>
      <p><strong>Best wishes,</strong><br/>The JHP Team</p>
      <a href="https://software.jhpparivar.in" class="button">Student Login</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} JHP Parivar. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

                        await sendEmail(to, subject, html);
                    })
                );
            }

            res.status(200).json({
                message:
                    peopleWithBirthdays.length > 0
                        ? `Birthday emails sent to ${peopleWithBirthdays.length} people`
                        : "No birthdays today.",
                data: peopleWithBirthdays,
            });
        } catch (error) {
            console.error(error);
            res
                .status(500)
                .json({ error: error?.message || "Internal Server Error" });
        }
    });

    return router;
};
