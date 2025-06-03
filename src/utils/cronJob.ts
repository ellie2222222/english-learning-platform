import cron from "node-cron";
import getLogger from "./logger";
import Container from "typedi";
import UserService from "../services/UserService";

const cronJob = cron.schedule("* * * * *", async () => {
  const userService = Container.get(UserService);
  const logger = getLogger("MEMBERSHIP");
  try {
    const users = await userService.getExpiredUsers();
    if (users.length > 0) {
      logger.info(`Found ${users.length} expired users`);
      const handledUsers = await userService.handleExpiredUsers(users);
      logger.info(`Handled ${handledUsers} expired users`);
    }
  } catch (error) {
    logger.error((error as Error).message);
  }
});

export default cronJob;
