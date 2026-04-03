import { describe, it, expect, beforeEach } from "vitest";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FortiGateClient } from "../src/client.js";
import { Config } from "../src/config.js";
import { registerSystemTools } from "../src/traditional/tools/system.js";

const mockConfig: Config = {
  host: "https://fortigate.example.com",
  apiVersion: "v2",
  apiKey: "test-api-key",
  verifySsl: true,
  vdom: "root",
  enableWrite: false,
};

describe("System Tools", () => {
  let server: McpServer;
  let client: FortiGateClient;

  beforeEach(() => {
    server = new McpServer({
      name: "test-server",
      version: "1.0.0",
    });
    client = new FortiGateClient(mockConfig);
  });

  it("should register without errors", () => {
    expect(() => {
      registerSystemTools(server, client, mockConfig);
    }).not.toThrow();
  });

  it("should register all Phase 1 system tools (including new ones)", () => {
    // Test that all system tools register without errors
    // Includes: get_system_status, list_interfaces, list_zones, list_vdoms,
    // get_resource_usage, list_firewall_sessions, list_routes
    expect(() => {
      registerSystemTools(server, client, mockConfig);
    }).not.toThrow();
  });
});
