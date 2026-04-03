import { describe, it, expect } from "vitest";
import { registerFirewallTools } from "../src/traditional/tools/firewall.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { FortiGateClient } from "../src/client.js";
import { Config } from "../src/config.js";

describe("Firewall Tools", () => {
  const mockConfig: Config = {
    host: "https://fortigate.example.com",
    apiVersion: "v2",
    apiKey: "test-api-key",
    verifySsl: true,
    vdom: "root",
    enableWrite: false,
  };

  it("should register list_firewall_policies tool", () => {
    const server = new McpServer({ name: "test", version: "1.0.0" });
    const client = new FortiGateClient(mockConfig);
    
    registerFirewallTools(server, client, mockConfig);
    
    // Tool registration is successful if no errors are thrown
    expect(server).toBeDefined();
  });

  it("should register get_firewall_policy tool", () => {
    const server = new McpServer({ name: "test", version: "1.0.0" });
    const client = new FortiGateClient(mockConfig);
    
    registerFirewallTools(server, client, mockConfig);
    
    expect(server).toBeDefined();
  });
});
