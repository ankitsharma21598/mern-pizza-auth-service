import { NextFunction, Request, Router, Response } from "express";
import { AppDataSource } from "../config/data-source.js";
import { CreateUserRequest } from "../types/index.js";
import logger from "../config/logger.js";
import { UserController } from "../controllers/UserController.js";
import { UserService } from "../services/UserService.js";
import { User } from "../entity/User.js";
import authenticate from "../middlewares/authenticate.js";
import { canAccess } from "../middlewares/canAccess.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const userController = new UserController(userService, logger);

router.post(
    "/",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.create(req as CreateUserRequest, res, next),
);

router.get(
    "/",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUsersList(req, res, next),
);

// get a user by id
router.get(
    "/:id",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.getUserById(req, res, next),
);

router.delete(
    "/:id",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.destroy(req, res, next),
);

// update  a user by id
router.patch(
    "/:id",
    authenticate,
    canAccess([USER_ROLES.ADMIN]),
    (req: Request, res: Response, next: NextFunction) =>
        userController.update(req, res, next),
);

export default router;
