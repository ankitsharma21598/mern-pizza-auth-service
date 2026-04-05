import app from "./app.js";
import logger from "./config/logger.js";

import { config } from "dotenv";

config();

const startServer = () => {
    try {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            logger.info(`Listening on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Error starting server:", error);
        process.exit(1);
    }
};

startServer();
