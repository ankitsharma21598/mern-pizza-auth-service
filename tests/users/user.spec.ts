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
import bcrypt from "bcrypt";
import { createJWKSMock } from "mock-jwks";

describe.sequential("GET /auth/self", () => {
    let connection: DataSource;
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll(async () => {
        jwks = createJWKSMock("http://localhost:5501");
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // database truncate
        jwks.start();
        await truncateTables(connection);
    });

    afterEach(() => {
        jwks.stop();
    });

    afterAll(async () => {
        await connection.destroy();
    });
    const createUserForSelf = async (email = "john.doe@example.com") => {
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
        test("should return a 200 status code", async () => {
            // Arrange
            // await createUserForSelf();
            // Act
            // const response = await request(app).get("/auth/self");
            // Assert
            // console.log("response.body", response.body);
            // expect(response.status).toBe(200);
        });
        test("should return the user data", async () => {
            // Arrange
            const user = await createUserForSelf();
            const accessToken = jwks.token({
                sub: String(user.id),
                role: USER_ROLES.CUSTOMER,
            });
            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", `accessToken=${accessToken};`);

            // // Assert
            expect(
                response.body as {
                    id: number;
                    name: string;
                    email: string;
                    password: undefined;
                },
            ).toEqual({ ...user, password: undefined });
            expect(response.status).toBe(200);
        });

        test("should not return the password field", async () => {
            // Arrange
            const user = await createUserForSelf();
            const accessToken = jwks.token({
                sub: String(user.id),
                role: USER_ROLES.CUSTOMER,
            });
            // Act
            const response = await request(app)
                .get("/auth/self")
                .set("Cookie", `accessToken=${accessToken};`);

            // // Assert
            expect(
                response.body as {
                    id: number;
                    name: string;
                    email: string;
                    password: undefined;
                },
            ).toEqual({ ...user, password: undefined });

            // expect(response.body).not.toHaveProperty("password");
        });

        test("should return 401 status code if token does not exist", async () => {
            // Arrange
            await createUserForSelf();

            // Act
            const response = await request(app).get("/auth/self");

            // // Assert
            expect(response.status).toBe(401);
            // expect(response.body).not.toHaveProperty("password");
        });
    });
});
