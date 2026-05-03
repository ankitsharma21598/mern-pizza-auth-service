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
import { truncateTables } from "../utils/index.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import { USER_ROLES } from "../../src/constants/index.js";
import { User } from "../../src/entity/User.js";
import { createJWKSMock } from "mock-jwks";
import bcrypt from "bcrypt";
import { Tenant } from "../../src/entity/Tenant.js";

describe.sequential("DELETE /users/:id", () => {
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
        test("should return 204 and remove user for admin", async () => {
            const tenant = await connection
                .getRepository(Tenant)
                .findOneBy({ id: 1 });
            const saved = await connection.getRepository(User).save({
                name: "Del",
                email: "del@example.com",
                password: await bcrypt.hash("x", 10),
                role: USER_ROLES.CUSTOMER,
                tenant: tenant!,
            });
            const res = await request(app)
                .delete(`/users/${saved.id}`)
                .set("Authorization", `Bearer ${adminAccessToken}`);
            expect(res.status).toBe(204);
            expect(
                await connection
                    .getRepository(User)
                    .findOneBy({ id: saved.id }),
            ).toBeNull();
        });

        test("should return 401 without auth", async () => {
            const res = await request(app).delete("/users/1");

            expect(res.status).toBe(401);
        });

        test("should return 403 for non-admin", async () => {
            const token = jwks.token({ sub: "2", role: USER_ROLES.CUSTOMER });

            const res = await request(app)
                .delete("/users/1")
                .set("Authorization", `Bearer ${token}`);
            expect(res.status).toBe(403);
        });

        test("should return 400 for invalid id", async () => {
            const res = await request(app)
                .delete("/users/abc")
                .set("Authorization", `Bearer ${adminAccessToken}`);

            expect(res.status).toBe(400);
        });

        // My test for delete user
        test("should return 403 if user is not an admin and try to delete a user", async () => {
            // Arrange
            const user = await connection.getRepository(User).save({
                name: "Alice",
                email: "alice@example.com",
                password: await bcrypt.hash("secret", 10),
                role: USER_ROLES.MANAGER,
                tenantId: 1,
            });
            // Act
            const response = await request(app)
                .delete(`/users/${user.id}`)
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

        test("should delete a user", async () => {
            // Arrange
            const user = await connection.getRepository(User).save({
                name: "Alice",
                email: "alice@example.com",
                password: await bcrypt.hash("secret", 10),
                role: USER_ROLES.MANAGER,
                tenantId: 1,
            });

            // Act
            const response = await request(app)
                .delete(`/users/${user.id}`)
                .set("Authorization", `Bearer ${adminAccessToken}`);
            // Assert
            expect(response.status).toBe(204);
            const userRepository = connection.getRepository(User);
            const deletedUser = await userRepository.findOne({
                where: { id: user.id },
            });
            expect(deletedUser).toBeNull();
        });
    });
});
