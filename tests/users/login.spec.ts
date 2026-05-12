import {
    afterAll,
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
import { isJwt } from "../utils/index.js";
import { User } from "../../src/entity/User.js";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../../src/constants/index.js";

describe.sequential("POST /auth/login", () => {
    let connection: DataSource;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    });

    afterAll(async () => {
        if (connection?.isInitialized) {
            await connection.destroy();
        }
    });

    const createUserForLogin = async (email = "john.doe@example.com") => {
        const userRepository = connection.getRepository(User);
        const hashedPassword = await bcrypt.hash("password", 10);
        return userRepository.save({
            name: "John Doe",
            email,
            password: hashedPassword,
            role: USER_ROLES.CUSTOMER,
        });
    };

    describe("Given all fields", () => {
        test("should return the access token and refresh token inside a cookie", async () => {
            // Arrange
            await createUserForLogin();
            const userData = {
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert
            expect(response.status).toBe(200);
            let accessToken: string | null = null;
            let refreshToken: string | null = null;
            const setCookieHeader = response.headers["set-cookie"] as
                | string
                | string[]
                | undefined;
            const cookies: string[] = Array.isArray(setCookieHeader)
                ? setCookieHeader
                : setCookieHeader
                  ? [setCookieHeader]
                  : [];

            cookies.forEach((cookie: string) => {
                if (cookie.startsWith("accessToken=")) {
                    accessToken = cookie.split(";")[0].split("=")[1];
                }
                if (cookie.startsWith("refreshToken=")) {
                    refreshToken = cookie.split(";")[0].split("=")[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();
            expect(isJwt(accessToken)).toBeTruthy();
            expect(isJwt(refreshToken)).toBeTruthy();
        });

        test("should return the 401 if email or password is wrong", async () => {
            // Arrange
            await createUserForLogin();
            const userData = {
                email: "john.doe@example.com",
                password: "wrong-password",
            };

            // Act
            const response = await request(app)
                .post("/auth/login")
                .send(userData);

            // Assert
            expect(response.status).toBe(401);
            const body = response.body as {
                errors: Array<{ message: string }>;
            };
            expect(body.errors[0].message).toBe("Invalid email or password");
        });
    });
});
