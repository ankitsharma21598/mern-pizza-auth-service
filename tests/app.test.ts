import { calculateDiscount } from "../src/utils.js";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe.skip("App", () => {
    it("should return correct discount amount", () => {
        let result = calculateDiscount(100, 20);
        expect(result).toBe(80);
        result = calculateDiscount(50, 10);
        expect(result).toBe(45);
    });

    it("should return 200 status code", async () => {
        // Test implementation for status code
        const response = await request(app).get("/");
        expect(response.status).toBe(200);
    });
});
