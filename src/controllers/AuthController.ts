import { Logger } from "winston";
import { UserService } from "../services/UserService.js";
import { AuthRequest, RegisterUserRequest } from "../types/index.js";
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { USER_ROLES } from "../constants/index.js";
import { TokenService } from "../services/TokenService.js";
import createHttpError from "http-errors";

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
    ) {}
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

            const payload: jwt.JwtPayload = {
                sub: String(user.id),
                role: USER_ROLES.CUSTOMER,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // console.log({ accessToken, refreshToken });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "strict",
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                sameSite: "strict",
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            res.status(400).json({ errors: result.array() });
            return;
        }

        const { email, password } = req.body;

        this.logger.debug("Login request", {
            email,
            password: "********",
        });
        try {
            const user = await this.userService.findByEmailAndPassword({
                email,
                password,
            });
            this.logger.info(`User found: ${user.id}`);

            const payload: jwt.JwtPayload = {
                sub: String(user.id),
                role: USER_ROLES.CUSTOMER,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            // console.log({ accessToken, refreshToken });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "strict",
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                sameSite: "strict",
            });
            this.logger.info("User has been logged in", { id: user.id });
            res.json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req: AuthRequest, res: Response) {
        const user = await this.userService.findById(req.auth.sub);

        res.json({
            ...user,
            password: undefined,
        });
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            console.log("req", req.auth);

            const payload: jwt.JwtPayload = {
                sub: String(req.auth.sub),
                role: req.auth.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const user = await this.userService.findById(Number(req.auth.sub));

            if (!user) {
                const error = createHttpError(
                    404,
                    "User with the token could not found",
                );
                next(error);
                return;
            }
            // persist the refresh token
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);

            // Delete the old refresh token (Rotational Refresh Token)
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));

            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });
            // console.log({ accessToken, refreshToken });
            res.cookie("accessToken", accessToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60, // 1 hour
                sameSite: "strict",
            });
            res.cookie("refreshToken", refreshToken, {
                domain: "localhost",
                path: "/",
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
                sameSite: "strict",
            });
            res.status(201).json({ id: user.id });
        } catch (error) {
            next(error);
            return;
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            await this.tokenService.deleteRefreshToken(Number(req.auth.id));
            this.logger.info("Refresh token deleted", { id: req.auth.id });
            this.logger.info("User has been logged out", { id: req.auth.sub });
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.json({ message: "Logged out successfully" });
        } catch (error) {
            next(error);
            return;
        }
    }
}
