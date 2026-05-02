import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";
import app from "../../src/app.js";
import request from "supertest";
import { AppDataSource } from "../../src/config/data-source.js";
import { DataSource } from "typeorm";
import { truncateTables } from "../utils/index.js";
import { createJWKSMock } from "mock-jwks";
import { Tenant } from "../../src/entity/Tenant.js";
import { USER_ROLES } from "../../src/constants/index.js";

describe.sequential("POST /tenants", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;
    let adminAccessToken: string;
    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
    });

    beforeEach(async () => {
        // database truncate
        jwks.start();
        await truncateTables(connection);
        adminAccessToken = jwks.token({
            sub: String(1),
            role: USER_ROLES.ADMIN,
        });
    });
    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });
    describe("Given all fields", () => {
        test("should return a 201 status code", async () => {
            // Arrange
            const tenantData = {
                name: "John Doe",
                address: "123 Main St, Anytown, USA",
            };

            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminAccessToken};`])
                .send(tenantData);

            // Assert
            expect(response.status).toBe(201);
        });

        test("should create tenant in the database", async () => {
            // Arrange
            const tenantData = {
                name: "John Doe",
                address: "123 Main St, Anytown, USA",
            };
            // Act
            await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${adminAccessToken};`])
                .send(tenantData);

            // Assert
            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(1);
            expect(tenants[0].name).toBe(tenantData.name);
            expect(tenants[0].address).toBe(tenantData.address);
        });

        test("should return 401 if user is not authenticated", async () => {
            // Arrange
            const tenantData = {
                name: "John Doe",
                address: "123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app)
                .post("/tenants")
                .send(tenantData);

            // Assert
            expect(response.status).toBe(401);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });
        test("should return 403 if user is not an admin", async () => {
            // Arrange
            const managerToken = jwks.token({
                sub: String(1),
                role: USER_ROLES.MANAGER,
            });
            const tenantData = {
                name: "John Doe",
                address: "123 Main St, Anytown, USA",
            };
            // Act
            const response = await request(app)
                .post("/tenants")
                .set("Cookie", [`accessToken=${managerToken};`])
                .send(tenantData);

            // Assert
            expect(response.status).toBe(403);

            const tenantRepository = connection.getRepository(Tenant);
            const tenants = await tenantRepository.find();
            expect(tenants).toHaveLength(0);
        });
    });
});
