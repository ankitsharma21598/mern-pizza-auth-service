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
import { User } from "../../src/entity/User.js";
import { DataSource } from "typeorm";
import { truncateTables } from "../utils/index.js";
import { USER_ROLES } from "../../src/constants/index.js";

/*   
Test Writing Formula: AAA
 Arrange: Set up the test environment
 Act: Perform the action to test
 Assert: Verify the expected outcome 
 */

describe("POST /auth/register", () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // database truncate
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

    describe("given all required fields are provided", () => {
        test("should register a new user and return a 201 status code", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            // Assert
            expect(response.status).toBe(201);
        });

        test("should return valid Json response", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            // Assert
            expect(response.headers["content-type"]).toEqual(
                expect.stringContaining("application/json"),
            );
        });

        test("should persist the user to the database", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            await request(app).post("/auth/register").send(user);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].name).toBe(user.name);
            expect(users[0].email).toBe(user.email);
        });

        test("should return an id of the created user", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            // Assert
            const body = response.body as { id: number };
            expect(body.id).toBeTypeOf("number");
        });

        test("should assign a customer role to the user", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "password",
            };

            // Act
            await request(app).post("/auth/register").send(user);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("role");
            expect(users[0].role).toBe(USER_ROLES.CUSTOMER);
        });

        test("should store the hashed password in the database", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "12345",
            };

            // Act
            await request(app).post("/auth/register").send(user);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty("password");
            expect(users[0].password).not.toBe(user.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        test("should return a 400 status code if the email is already exists", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "john.doe@example.com",
                password: "12345",
            };
            const userRepository = connection.getRepository(User);
            await userRepository.save({ ...user, role: USER_ROLES.CUSTOMER });

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            const users = await userRepository.find();

            // Assert
            expect(response.statusCode).toBe(400);
            const body = response.body as { errors: { message: string }[] };
            expect(body.errors[0].message).toBe("Email already exists");
            expect(users).toHaveLength(1);
        });
    });
    describe("given a missing required field", () => {
        test("should return a 400 status code if email field is missing", async () => {
            // Arrange
            const user = {
                name: "John Doe",
                email: "",
                password: "secret",
            };

            // Act
            const response = await request(app)
                .post("/auth/register")
                .send(user);

            // Assert
            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
            const body = response.body as { errors: { msg: string }[] };
            console.log("body", body);
            expect(body.errors[0].msg).toBe("Email is required");
        });
        test.todo("should return a 400 status code if name field is missing");
        test.todo(
            "should return a 400 status code if password field is missing",
        );
        // test.todo(
        //     "should return a 400 status code if password field is less than 8 characters",
        // );
        // test.todo(
        //     "should return a 400 status code if password field is more than 16 characters",
        // );
        // test.todo(
        //     "should return a 400 status code if password field is not a string",
        // );
        // test.todo(
        //     "should return a 400 status code if password field is not a valid email",
        // );
        // test.todo(
        //     "should return a 400 status code if password field is not a valid email",
        // );
    });

    describe("Fields are not in proper format", () => {
        test("should trim the email field", async () => {
            // Arrange
            const userData = {
                name: "John Doe",
                email: " john.doe@example.com ",
                password: "password",
            };

            // Act
            await request(app).post("/auth/register").send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            const user = users[0];
            expect(user.email).toBe("john.doe@example.com");
        });
        test.todo(
            "should return a 400 status code if email field is not a valid email",
        );
        test.todo(
            "should return a 400 status code if password length is less than 8 characters",
        );
        // test.todo("should normalize the email field");
        // test.todo("should validate the name field");
        // test.todo("should validate the password field is required");
        // test.todo("should validate the password field is at least 8 characters long");
        // test.todo("should validate the password field is at most 16 characters long");
        // test.todo("should validate the password field is a string");
        // test.todo("should validate the password field is a valid email");
        // test.todo("should validate the password field is a valid email");
    });
});
