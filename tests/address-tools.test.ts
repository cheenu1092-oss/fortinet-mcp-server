import { describe, it, expect, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FortiClient } from "../src/client.js";
import { Config } from "../src/config.js";
import { registerAddressTools } from "../src/traditional/tools/address.js";

const mockConfig: Config = {
  host: "https://fortigate.example.com",
  apiKey: "test-api-key",
  verifySsl: true,
  vdom: "root",
  enableWrite: false,
};

describe("Address Tools", () => {
  let server: McpServer;
  let client: FortiClient;

  beforeEach(() => {
    server = new McpServer({
      name: "test-server",
      version: "1.0.0",
    });
    client = new FortiClient(mockConfig);
  });

  describe("Read-only mode", () => {
    it("should register without errors in read-only mode", () => {
      expect(() => {
        registerAddressTools(server, client, mockConfig);
      }).not.toThrow();
    });
  });

  describe("Write mode", () => {
    it("should register without errors in write mode", () => {
      const writeConfig = { ...mockConfig, enableWrite: true };
      expect(() => {
        registerAddressTools(server, client, writeConfig);
      }).not.toThrow();
    });
  });
});
