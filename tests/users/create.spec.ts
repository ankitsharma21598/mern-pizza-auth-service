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
import bcrypt from "bcryptjs";

describe.sequential("POST /users", () => {
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
        test("should return a 200 status code", async () => {
            // Arrange
            // await createUserForSelf();
            // Act
            // const response = await request(app).get("/auth/self");
            // Assert
            // console.log("response.body", response.body);
            // expect(response.status).toBe(200);
        });

        test("should persist the user in the database", async () => {
            // Arrange

            const userData = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
                role: USER_ROLES.ADMIN,
                tenantId: 1,
            };
            const adminAccessToken = jwks.token({
                sub: String(1),
                role: USER_ROLES.ADMIN,
            });
            // Act
            await request(app)
                .post("/users")
                .set("Cookie", [`accessToken=${adminAccessToken};`])
                .send(userData);
            // // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].role).toBe(USER_ROLES.MANAGER);
            // expect(users[0].name).toBe(userData.name);
            // expect(users[0].email).toBe(userData.email);
            // expect(users[0].password).toBe(userData.password);
            // expect(users[0].tenant.id).toBe(userData.tenantId);
        });

        test.todo("should return 403 if user is not an admin");

        test("should return Users List", async () => {
            await connection.getRepository(User).save({
                name: "Alice",
                email: "alice@example.com",
                password: await bcrypt.hash("secret", 10),
                role: USER_ROLES.MANAGER,
                tenantId: 1,
            });
            await connection.getRepository(User).save({
                name: "Bob",
                email: "bob@example.com",
                password: await bcrypt.hash("secret", 10),
                role: USER_ROLES.CUSTOMER,
                tenantId: 2,
            });

            const response = await request(app)
                .get("/users")
                .set("Authorization", `Bearer ${adminAccessToken}`);

            expect(response.status).toBe(200);
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("application/json"),
            );

            type ListUser = {
                id: number;
                name: string;
                email: string;
                role: string;
            };
            const body = response.body as ListUser[];
            expect(body).toHaveLength(2);
            expect(body[0].email).toBe("alice@example.com");
            expect(body[1].email).toBe("bob@example.com");
            expect(body.every((u) => !("password" in u))).toBe(true);
        });

        // Test for delete user
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
