import { Logger } from "winston";
import { UserService } from "../services/UserService.js";
import { NextFunction, Request, Response } from "express";
import { CreateUserRequest, UserData } from "../types/index.js";
import { USER_ROLES } from "../constants/index.js";

/* User Management API AssignmentRequest Validation
Get Users List Endpoint (Done)
Get User by ID Endpoint 
Update User Endpoint (Done)
Delete User Endpoint (Done) */

export class UserController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }
    async create(
        req: CreateUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const { name, email, password } = req.body;
        try {
            const user = await this.userService.create({
                name,
                email,
                password,
                role: USER_ROLES.MANAGER,
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }

    // Get Users List Endpoint
    async getUsersList(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const users = await this.userService.getUsersList();
            this.logger.debug("Fetched users list", { count: users.length });
            res.status(200).json(users);
        } catch (error) {
            next(error);
        }
    }

    // Delete User Endpoint
    async destroy(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        try {
            await this.userService.destroy(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    // Update User Endpoint
    async update(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        const { name, email, password, role } = req.body as UserData;
        try {
            const user = await this.userService.update(id, {
                name,
                email,
                password,
                role,
            });
            this.logger.debug("Updated user", { id, name, email, role });
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }

    // Get User by ID Endpoint
    async getUserById(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid user ID" });
            return;
        }
        try {
            const user = await this.userService.findById(id);
            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
}
