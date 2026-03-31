import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerSystemTools(
  server: McpServer,
  client: FortiClient,
  _config: Config
): void {
  // get_system_status
  server.registerTool(
    "get_system_status",
    {
      description: "Get system resource usage and status (CPU, memory, disk, sessions)",
      inputSchema: {
        interval: z
          .enum(["1min", "5min", "30min", "1hour"])
          .optional()
          .describe("Time interval for averages (default: 1min)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.interval) params.interval = args.interval;

      const result = await client.get("/api/v2/monitor/system/resource", undefined, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // get_interface_status
  server.registerTool(
    "get_interface_status",
    {
      description: "Get interface statistics and status",
      inputSchema: {
        interface_name: z
          .string()
          .optional()
          .describe("Filter by specific interface name"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.interface_name) params.interface_name = args.interface_name;

      const result = await client.get("/api/v2/monitor/system/interface", undefined, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // get_ha_status
  server.registerTool(
    "get_ha_status",
    {
      description: "Get HA (High Availability) cluster status",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("/api/v2/monitor/system/ha-peer");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_active_sessions
  server.registerTool(
    "list_active_sessions",
    {
      description: "Query active firewall sessions",
      inputSchema: {
        ip_version: z
          .enum(["ipv4", "ipv6"])
          .optional()
          .describe("Filter by IP version"),
        src: z.string().optional().describe("Filter by source IP"),
        dest: z.string().optional().describe("Filter by destination IP"),
        protocol: z
          .enum(["tcp", "udp", "icmp"])
          .optional()
          .describe("Filter by protocol"),
        limit: z
          .number()
          .optional()
          .describe("Maximum number of sessions to return (default: 100)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};

      if (args.ip_version) params.ip_version = args.ip_version;
      if (args.src) params.src = args.src;
      if (args.dest) params.dest = args.dest;
      if (args.protocol) params.protocol = args.protocol;
      if (args.limit) params.count = String(args.limit);

      const result = await client.get("/api/v2/monitor/firewall/session", undefined, params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );
}
