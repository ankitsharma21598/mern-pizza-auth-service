import "reflect-metadata";
import express from "express";
import logger from "./config/logger.js";
import { HttpError } from "http-errors";
import authRouter from "./routes/auth.js";
import cookieParser from "cookie-parser";
const app = express();

app.use(express.static("public", { dotfiles: "allow" }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.status(200).send("Welcome to the Pizza App!");
});

app.use("/auth", authRouter);

// Global error handling middleware
app.use(
    (
        err: HttpError,
        req: express.Request,
        res: express.Response,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        next: express.NextFunction,
    ) => {
        logger.error(err.message);

        const statusCode = err.status || err.statusCode || 500;

        res.status(statusCode).json({
            errors: [
                {
                    type: err.name,
                    message: err.message,
                    path: "",
                    location: "",
                },
            ],
        });
    },
);

export default app;
