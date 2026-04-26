import app from "./app.js";
import logger from "./config/logger.js";
import { config } from "dotenv";
import { AppDataSource } from "./config/data-source.js";
import { Config } from "./config/index.js";

config();

const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully");
        // console.log("Database connected successfully");
        const PORT = Config.PORT;
        app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            // console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        logger.error("Error starting server:", error);
        // console.log("Error starting server:", error);
        process.exit(1);
    }
};

void startServer();
