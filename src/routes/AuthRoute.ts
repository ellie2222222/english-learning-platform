import express from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";

import AuthController from "../controllers/AuthController";
import AuthService from "../services/AuthService";
import UserRepository from "../repositories/UserRepository";
import passport from "passport";
import AuthDto from "../dtos/AuthDto";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);
const authDto = new AuthDto();

const authRoutes = express.Router();

authRoutes.use(AuthMiddleware);

authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

authRoutes.get(
  "/google/redirect",
  passport.authenticate("google"),
  authController.loginGoogle
);

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

export default authRoutes;
