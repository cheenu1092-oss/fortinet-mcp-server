import { describe, it, expect, beforeEach, vi } from "vitest";
import { FortiClient, FortiGateError } from "../src/client";

describe("FortiClient", () => {
  let client: FortiClient;

  beforeEach(() => {
    client = new FortiClient({
      host: "https://test.fortigate.local",
      apiKey: "test-api-key",
      vdom: "root",
      verifySsl: false,
    });
  });

  it("should initialize with correct config", () => {
    expect(client).toBeDefined();
  });

  it("should strip trailing slashes from host", () => {
    const clientWithSlash = new FortiClient({
      host: "https://test.fortigate.local///",
      apiKey: "test-key",
    });
    expect(clientWithSlash).toBeDefined();
  });

  it("should use default vdom if not provided", () => {
    const defaultClient = new FortiClient({
      host: "https://test.fortigate.local",
      apiKey: "test-key",
    });
    expect(defaultClient).toBeDefined();
  });

  describe("FortiGateError", () => {
    it("should create error with correct properties", () => {
      const error = new FortiGateError(404, "GET", "/api/v2/test", "Not found");
      
      expect(error.statusCode).toBe(404);
      expect(error.method).toBe("GET");
      expect(error.path).toBe("/api/v2/test");
      expect(error.message).toContain("404");
      expect(error.message).toContain("Not found");
      expect(error.name).toBe("FortiGateError");
    });
  });

  // Note: Integration tests with actual FortiGate would go here
  // For unit tests, we'd mock the HTTPS requests
});
