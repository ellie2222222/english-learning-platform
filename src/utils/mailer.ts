import nodemailer, { TransportOptions } from "nodemailer";
import getLogger from "./logger";
import Mail from "nodemailer/lib/mailer";
const logger = getLogger("MAIL");
import ejs from "ejs";
import dotenv from "dotenv";
import path from "path";
import { IAchievement } from "../interfaces/models/IAchievement";
import { AchievementTypeEnum } from "../enums/AchievementTypeEnum";
dotenv.config();

const achievementEmailTemplatePath = path.resolve(
  __dirname,
  "../templates/UserAchievementNotification.ejs"
);

const sendMail = async (mailOptions: Mail.Options): Promise<void> => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const options: Mail.Options = {
      from: process.env.EMAIL_USER,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    };

    const info = await transporter.sendMail(options);
    logger.info(`Email sent: ${info.response}`);

    transporter.verify(function (error, success) {
      if (error) {
        logger.error(error);
      } else {
        logger.info("Server is ready to take our messages");
      }
    });
  } catch (error) {
    logger.error(`Error sending email: ${error}`);
  }
};
const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const notifyAchievement = async (
  achievement: IAchievement,
  usermail: string
) => {
  let message = "";
  switch (achievement.type) {
    case AchievementTypeEnum.LoginStreak:
      message = `Logged in ${getOrdinalSuffix(achievement.goal)} day in a row!`;
      break;

    case AchievementTypeEnum.CouseCompletion:
      message = `Completed your ${achievement.goal}${getOrdinalSuffix(
        achievement.goal
      )} course!`;
      break;

    case AchievementTypeEnum.LessonCompletion:
      message = `Completed your ${achievement.goal}${getOrdinalSuffix(
        achievement.goal
      )} lesson!`;
      break;
  }
  const emailHtml = await ejs.renderFile(achievementEmailTemplatePath, {
    achievementName: achievement.name,
    message: message,
    serverUrl: `${process.env.FRONTEND_URL}` || "http://localhost:3000",
  });

  const mailOptions: Mail.Options = {
    from: process.env.EMAIL_USER,
    to: usermail,
    subject: `English Learning System Achievement`,
    html: emailHtml,
  };
  await sendMail(mailOptions);
};
export { sendMail, notifyAchievement };
