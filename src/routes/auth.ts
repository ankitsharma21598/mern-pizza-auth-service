import { Request, Response, NextFunction, Router } from "express";
import { AuthController } from "../controllers/AuthController.js";
import { UserService } from "../services/UserService.js";
import { User } from "../entity/User.js";
import { AppDataSource } from "../config/data-source.js";
import logger from "../config/logger.js";
import registerValidator from "../validators/register-validator.js";

const router = Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const authController = new AuthController(userService, logger);

router.post(
    "/register",
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

export default router;
