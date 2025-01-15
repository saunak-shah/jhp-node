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

            if (peopleWithBirthdays.length > 0) {
                await Promise.all(
                    peopleWithBirthdays.map(async (person) => {
                        const to = person.email || person.teacher_email;
                        const subject = `Happy Birthday, ${person.first_name || person.teacher_first_name
                            }!`;
                        const text = `Dear ${person.first_name || person.teacher_first_name
                            },\n\nWishing you a very Happy Birthday! Have a wonderful day filled with joy and happiness.\n\nBest wishes,\nJHP Team`;

                        await sendEmail(to, subject, text);
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
