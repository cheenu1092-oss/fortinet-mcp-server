import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Config } from "../config.js";
import { FortiGateClient } from "../client.js";

export function registerExecutor(server: McpServer, config: Config): void {
  const client = new FortiGateClient(config);

  // execute_fortigate_api
  server.registerTool(
    "execute_fortigate_api",
    {
      description: `Execute a FortiGate REST API call.
      
Available endpoints:
- GET /api/v2/monitor/* - Monitoring/status endpoints
- GET /api/v2/cmdb/* - Configuration database (read)
- POST /api/v2/cmdb/* - Create configuration objects (write mode only)
- PUT /api/v2/cmdb/* - Update configuration objects (write mode only)
- DELETE /api/v2/cmdb/* - Delete configuration objects (write mode only)

Common paths:
- cmdb/firewall/policy - Firewall policies
- cmdb/firewall/address - Address objects
- cmdb/firewall/addrgrp - Address groups
- cmdb/firewall.service/custom - Custom services
- cmdb/firewall.service/group - Service groups
- cmdb/system/interface - Network interfaces
- cmdb/system/zone - Security zones
- monitor/system/status - System status
- monitor/firewall/policy - Policy hit counts

Filters: Use filter param (e.g., "name==web-server&type==ipmask")
VDOM: Automatically set to configured VDOM (${config.vdom})

Documentation: https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/399023/rest-api`,
      inputSchema: {
        method: z
          .enum(["GET", "POST", "PUT", "DELETE"])
          .describe("HTTP method"),
        path: z
          .string()
          .describe(
            "API path (e.g., cmdb/firewall/policy, monitor/system/status)"
          ),
        params: z
          .record(z.string())
          .optional()
          .describe("Query parameters (e.g., {filter: 'name==web'})"),
        body: z
          .unknown()
          .optional()
          .describe("Request body for POST/PUT (JSON object)"),
      },
    },
    async (args) => {
      // Enforce read-only mode
      if (!config.enableWrite && ["POST", "PUT", "DELETE"].includes(args.method)) {
        throw new Error(
          `Write operations (${args.method}) require --enable-write flag`
        );
      }

      let result: any;
      switch (args.method) {
        case "GET":
          // For paths that return arrays, use getAll
          if (args.path.startsWith("cmdb/")) {
            result = await client.getAll(args.path, args.params);
          } else {
            result = await client.get(args.path, args.params);
          }
          break;
        case "POST":
          result = await client.post(args.path, args.body);
          break;
        case "PUT":
          result = await client.put(args.path, args.body);
          break;
        case "DELETE":
          result = await client.delete(args.path, args.params);
          break;
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
