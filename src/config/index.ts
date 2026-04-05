import { config } from "dotenv";

config();

const { PORT } = process.env;

if (!PORT) {
    throw new Error("PORT is not defined in the environment variables.");
}

export const Config = { PORT };
