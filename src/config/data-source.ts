import "reflect-metadata";
import { DataSource } from "typeorm";
import { Config } from "./index.js";
import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { Tenant } from "../entity/Tenant.js";
import { Migration1777448881660 } from "../migration/1777448881660-migration.js";
import { RenameTables1777450613716 } from "../migration/1777450613716-rename_tables.js";
import { CreateTenantsTable1777526483055 } from "../migration/1777526483055-create_tenants_table.js";
import { AddTenantIDForeignKey1777527055463 } from "../migration/1777527055463-add_tenantID_foreign_key.js";

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
    migrations: [
        Migration1777448881660,
        RenameTables1777450613716,
        CreateTenantsTable1777526483055,
        AddTenantIDForeignKey1777527055463,
    ],
    subscribers: [],
});
