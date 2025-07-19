import express from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";

import AuthController from "../controllers/AuthController";
import AuthService from "../services/AuthService";
import UserRepository from "../repositories/UserRepository";
import passport from "../configs/passportConfig";
import AuthDto from "../dtos/AuthDto";
import Container from "typedi";

const authController = Container.get(AuthController);
const authDto = new AuthDto();

const authRoutes = express.Router();

authRoutes.use(AuthMiddleware);

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

authRoutes.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: "/api/auth/google/cancelled",
  }),
  authController.loginGoogle
);

authRoutes.get("/google/cancelled", (req, res) => {
  res.render("../templates/GoogleCancelled.ejs", {
    frontendUrl: process.env.FRONTEND_URL,
  });
});

authRoutes.post("/login", authDto.login, authController.login);

authRoutes.post("/signup", authDto.signup, authController.signup);

authRoutes.post("/logout", authController.logout);

authRoutes.get("/me", authController.getUserByToken);

authRoutes.post("/renew-access-token", authController.renewAccessToken);

authRoutes.get(
  "/email-verification",
  authController.confirmEmailVerificationToken
);

authRoutes.put(
  "/change-password",
  authDto.changePassword,
  authController.changePassword
);

authRoutes.post(
  "/send-reset-password-pin",
  authDto.sendResetPasswordPin,
  authController.sendResetPasswordPin
);

authRoutes.post(
  "/confirm-reset-password-pin",
  authDto.confirmResetPasswordPin,
  authController.confirmResetPasswordPin
);

authRoutes.put(
  "/reset-password",
  authDto.resetPassword,
  authController.resetPassword
);

export default authRoutes;
