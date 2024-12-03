import assert from "node:assert/strict";
import { test, after } from "node:test";
import supertest from "supertest";
import app from "../proxy.mjs"; // Your proxy server
import config from "../config.json" assert { type: "json" };

const request = supertest(app);
let server;

// Start the server before the tests
server = app.listen(8085, () => {
    console.log("Test server running on port 8085");
});

// Close the server after all tests are done
after(() => {
    server.close(() => {
        console.log("Test server closed");
    });
});

test("should forward requests to the correct service", async () => {
    const service = "wordcount"; // Update with a valid service from your config
    const response = await request.get(`/${service}`).query({ text: "hello world" });

    assert.equal(response.status, 200, "Expected HTTP status 200");
    assert.ok(response.body.answer, "Expected response to contain 'answer'");
    assert.equal(typeof response.body.answer, "number", "Answer should be a number");
});

test("should return service health status from /monitor", async () => {
    const response = await request.get("/monitor");

    assert.equal(response.status, 200, "Expected HTTP status 200");
    assert.equal(typeof response.body, "object", "Expected response to be an object");

    Object.entries(response.body).forEach(([service, status]) => {
        assert.ok(status.status, "Service status should exist");
        assert.ok(status.latency, "Service latency should exist");
        assert.ok(status.lastResponse, "Last response should exist");
    });
});

test("should return 404 for an unknown service", async () => {
    const response = await request.get("/unknownService");

    assert.equal(response.status, 404, "Expected HTTP status 404");
    assert.ok(response.body.error.includes("not found"), "Error message should include 'not found'");
});

test("should dynamically route requests based on configuration", async () => {
    for (const [service] of Object.entries(config.routes)) {
        const response = await request.get(`/${service}`).query({ text: "test input" });

        assert.ok(
            [200, 500, 404].includes(response.status),
            `Unexpected status code ${response.status} for service ${service}`
        );

        if (response.status === 200) {
            assert.ok(
                response.body.hasOwnProperty("answer") || response.body.hasOwnProperty("error"),
                `Expected response for service ${service} to include 'answer' or 'error'`
            );
        } else {
            console.warn(
                `Service ${service} returned status ${response.status}, skipping detailed validation`
            );
        }
    }
});
