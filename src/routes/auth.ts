import { Request, Response, NextFunction, Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import { User } from "../entity/User.js";
import { AppDataSource } from "../config/data-source.js";
import logger from "../config/logger.js";
import registerValidator from "../validators/register-validator.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { TokenService } from "../services/TokenService.js";
import loginValidator from "../validators/login-validator.js";
import authenticate from "../middlewares/authenticate.js";
import { AuthRequest } from "../types/index.js";
import validateRefreshToken from "../middlewares/validateRefreshToken.js";

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

router.post(
    "/login",
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next),
);

router.get("/self", authenticate, (req: Request, res: Response) =>
    authController.self(req as AuthRequest, res),
);

router.post(
    "/refresh",
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next),
);

export default router;
