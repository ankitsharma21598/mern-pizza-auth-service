import { Logger } from "winston";
import { UserService } from "../services/UserService.js";
import { RegisterUserRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }

        const { name, email, password } = req.body;

        this.logger.debug("Register request", {
            name,
            email,
            password: "********",
        });
        try {
            const user = await this.userService.create({
                name,
                email,
                password,
            });
            this.logger.info(`User created: ${user.id}`);
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
        }
    }
}
