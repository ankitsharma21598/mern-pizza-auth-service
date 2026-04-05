import express from "express";
import logger from "./config/logger.js";
import type { HttpError } from "http-errors";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome to the Pizza App!");
});

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

        const statusCode = err.status || 500;

        res.status(statusCode).json({
            error: [
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
