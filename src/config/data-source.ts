import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./index.js";
import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { Tenant } from "../entity/Tenant.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    // Don't use synchronize in production
    synchronize: false,
    logging: false,
    entities: [User, RefreshToken, Tenant],
    migrations: ["src/migration/*.ts"],
    subscribers: [],
});
