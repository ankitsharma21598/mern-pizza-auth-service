import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { AuthRequest } from "../types/index.js";

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const _req = req as AuthRequest;
        const roleFromToken = _req.auth.role;
        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                "You don't have enough permissions",
            );

            next(error);
            return;
        }
        next();
    };
};
