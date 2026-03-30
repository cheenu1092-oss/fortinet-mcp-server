#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "../config.js";

async function main() {
  const config = loadConfig();

  const server = new McpServer({
    name: "fortinet-mcp-server-code-mode",
    version: "1.0.0",
  });

  // Code mode: Provide FortiOS API schema as a resource
  server.resource(
    "fortios_api_schema",
    "fortios://api-schema",
    {
      description:
        "Complete FortiOS REST API reference for autonomous FortiGate management",
      mimeType: "application/json",
    },
    async () => {
      // Placeholder — full schema to be populated
      const schema = {
        info: {
          title: "FortiOS REST API",
          version: "v2",
          baseUrl: config.host + "/api/v2",
        },
        authentication: {
          type: "bearer",
          tokenEnv: "FORTIGATE_API_TOKEN",
        },
        endpoints: {
          firewall: {
            policy: {
              list: "GET /cmdb/firewall/policy",
              get: "GET /cmdb/firewall/policy/{id}",
              create: "POST /cmdb/firewall/policy",
              update: "PUT /cmdb/firewall/policy/{id}",
              delete: "DELETE /cmdb/firewall/policy/{id}",
            },
            address: {
              list: "GET /cmdb/firewall/address",
              get: "GET /cmdb/firewall/address/{name}",
              create: "POST /cmdb/firewall/address",
              update: "PUT /cmdb/firewall/address/{name}",
              delete: "DELETE /cmdb/firewall/address/{name}",
            },
            addrgrp: {
              list: "GET /cmdb/firewall/addrgrp",
            },
            vip: {
              list: "GET /cmdb/firewall/vip",
              get: "GET /cmdb/firewall/vip/{name}",
              create: "POST /cmdb/firewall/vip",
              update: "PUT /cmdb/firewall/vip/{name}",
              delete: "DELETE /cmdb/firewall/vip/{name}",
            },
            ippool: {
              list: "GET /cmdb/firewall/ippool",
            },
          },
          router: {
            static: {
              list: "GET /cmdb/router/static",
              get: "GET /cmdb/router/static/{seq-num}",
              create: "POST /cmdb/router/static",
              delete: "DELETE /cmdb/router/static/{seq-num}",
            },
          },
          system: {
            interface: {
              list: "GET /cmdb/system/interface",
            },
            status: {
              get: "GET /monitor/system/status",
            },
            dhcp: {
              list: "GET /monitor/system/dhcp",
            },
          },
        },
        notes: [
          "All endpoints support ?vdom=<name> query parameter",
          "Responses follow {status: 'success', results: [...]} structure",
          "Write operations require --enable-write flag",
        ],
      };

      return {
        contents: [
          {
            uri: "fortios://api-schema",
            mimeType: "application/json",
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Fortinet MCP Server started (code mode)");
  console.error("FortiOS API schema available as resource: fortios://api-schema");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
