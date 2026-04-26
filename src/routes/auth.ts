import { Request, Response, NextFunction, Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import { User } from "../entity/User.js";
import { AppDataSource } from "../config/data-source.js";
import logger from "../config/logger.js";
import registerValidator from "../validators/register-validator.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { TokenService } from "../services/TokenService.js";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const tokenService = new TokenService(refreshTokenRepository);
const authController = new AuthController(userService, logger, tokenService);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
