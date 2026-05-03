import {
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
    describe,
    expect,
    test,
} from "vitest";
import { truncateTables } from "../utils/index.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import { USER_ROLES } from "../../src/constants/index.js";
import { createJWKSMock } from "mock-jwks";
import { User } from "../../src/entity/User.js";
import bcrypt from "bcrypt";
import { Tenant } from "../../src/entity/Tenant.js";
import request from "supertest";
import app from "../../src/app.js";

describe.sequential("GET /users/:id", () => {
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
        test("should return 200 and admin can get a user by id", async () => {
            // Arrange
            const tenant = await connection.getRepository(Tenant).save({
                name: "Tenant 1",
                address: "123 Main St, Anytown, USA",
            });
            const user = await connection.getRepository(User).save({
                name: "John Doe",
                email: "john.doe@example.com",
                password: await bcrypt.hash("password", 10),
                role: USER_ROLES.CUSTOMER,
                tenant: tenant,
            });
            // Act
            const response = await request(app)
                .get(`/users/${user.id}`)
                .set("Authorization", `Bearer ${adminAccessToken}`);

            // Assert
            expect(response.status).toBe(200);
        });

        test("should return 404 if user is not found", async () => {
            // Act
            const response = await request(app)
                .get(`/users/1`)
                .set("Authorization", `Bearer ${adminAccessToken}`);

            // Assert
            expect(response.status).toBe(404);
        });

        test("should return 400 if user id is invalid", async () => {
            // Act
            const response = await request(app)
                .get(`/users/abc`)
                .set("Authorization", `Bearer ${adminAccessToken}`);

            // Assert
            expect(response.status).toBe(400);
        });

        test("should return 401 if token does not exist", async () => {
            // Act
            const response = await request(app).get(`/users/1`);

            // Assert
            expect(response.status).toBe(401);
        });

        test("should return 403 if user is not an admin", async () => {
            // Arrange
            const tenant = await connection.getRepository(Tenant).save({
                name: "Tenant 1",
                address: "123 Main St, Anytown, USA",
            });
            const user = await connection.getRepository(User).save({
                name: "John Doe",
                email: "john.doe@example.com",
                password: await bcrypt.hash("password", 10),
                role: USER_ROLES.CUSTOMER,
                tenant: tenant,
            });
            // Act
            const response = await request(app)
                .get(`/users/${user.id}`)
                .set(
                    "Authorization",
                    `Bearer ${jwks.token({
                        sub: String(user.id),
                        role: USER_ROLES.CUSTOMER,
                    })}`,
                );
            // Assert
            expect(response.status).toBe(403);
        });
    });
});
