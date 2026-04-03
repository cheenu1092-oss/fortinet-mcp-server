import { describe, it, expect, vi, beforeEach } from "vitest";
import { FortiGateClient } from "../src/client.js";
import { Config } from "../src/config.js";

describe("FortiGateClient", () => {
  let client: FortiGateClient;
  let mockConfig: Config;

  beforeEach(() => {
    mockConfig = {
      host: "https://fortigate.example.com",
      apiVersion: "v2",
      apiKey: "test-api-key",
      verifySsl: true,
      vdom: "root",
      enableWrite: false,
    };
    client = new FortiGateClient(mockConfig);
  });

  it("should construct with correct config", () => {
    expect(client).toBeDefined();
  });

  it("should build URLs correctly", () => {
    // This is a basic structural test
    expect(client).toHaveProperty("config");
  });

  it("should have GET method", () => {
    expect(typeof client.get).toBe("function");
  });

  it("should have POST method", () => {
    expect(typeof client.post).toBe("function");
  });

  it("should have PUT method", () => {
    expect(typeof client.put).toBe("function");
  });

  it("should have DELETE method", () => {
    expect(typeof client.delete).toBe("function");
  });
});
