import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerServiceTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_services
  server.registerTool(
    "list_services",
    {
      description: "List firewall service objects (TCP/UDP/ICMP ports)",
      inputSchema: {
        name: z.string().optional().describe("Filter by service name"),
        protocol: z
          .enum(["TCP/UDP/SCTP", "ICMP", "IP", "ICMP6"])
          .optional()
          .describe("Filter by protocol"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      const filters: string[] = [];

      if (args.name) filters.push(`name==${args.name}`);
      if (args.protocol) filters.push(`protocol==${args.protocol}`);

      if (filters.length > 0) {
        params.filter = filters.join("&");
      }

      const results = await client.getAll("cmdb/firewall.service/custom", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // list_service_groups
  server.registerTool(
    "list_service_groups",
    {
      description: "List firewall service groups",
      inputSchema: {
        name: z.string().optional().describe("Filter by group name"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.name) params.filter = `name==${args.name}`;

      const results = await client.getAll("cmdb/firewall.service/group", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_service
    server.registerTool(
      "create_service",
      {
        description: "Create a firewall service object",
        inputSchema: {
          name: z.string().describe("Service name"),
          protocol: z
            .enum(["TCP/UDP/SCTP", "ICMP", "IP"])
            .describe("Protocol type"),
          tcp_portrange: z
            .string()
            .optional()
            .describe("TCP port range (e.g., 80, 8000-8080)"),
          udp_portrange: z
            .string()
            .optional()
            .describe("UDP port range (e.g., 53, 500-1000)"),
          sctp_portrange: z
            .string()
            .optional()
            .describe("SCTP port range"),
          icmptype: z.number().optional().describe("ICMP type (for ICMP protocol)"),
          comment: z.string().optional().describe("Comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          protocol: args.protocol,
        };

        if (args.protocol === "TCP/UDP/SCTP") {
          if (args.tcp_portrange) body["tcp-portrange"] = args.tcp_portrange;
          if (args.udp_portrange) body["udp-portrange"] = args.udp_portrange;
          if (args.sctp_portrange) body["sctp-portrange"] = args.sctp_portrange;
        } else if (args.protocol === "ICMP") {
          if (args.icmptype !== undefined) body.icmptype = args.icmptype;
        }

        if (args.comment) body.comment = args.comment;

        const result = await client.post("cmdb/firewall.service/custom", body);
        return {
          content: [
            {
              type: "text",
              text: `Created service object: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // create_service_group
    server.registerTool(
      "create_service_group",
      {
        description: "Create a firewall service group",
        inputSchema: {
          name: z.string().describe("Service group name"),
          members: z.array(z.string()).describe("Member service object names"),
          comment: z.string().optional().describe("Comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          member: args.members.map((name) => ({ name })),
        };

        if (args.comment) body.comment = args.comment;

        const result = await client.post("cmdb/firewall.service/group", body);
        return {
          content: [
            {
              type: "text",
              text: `Created service group: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // delete_service
    server.registerTool(
      "delete_service",
      {
        description: "Delete a firewall service object",
        inputSchema: {
          name: z.string().describe("Service name to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(`cmdb/firewall.service/custom/${args.name}`);
        return {
          content: [
            {
              type: "text",
              text: `Deleted service object ${args.name}`,
            },
          ],
        };
      }
    );

    // delete_service_group
    server.registerTool(
      "delete_service_group",
      {
        description: "Delete a firewall service group",
        inputSchema: {
          name: z.string().describe("Service group name to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(`cmdb/firewall.service/group/${args.name}`);
        return {
          content: [
            {
              type: "text",
              text: `Deleted service group ${args.name}`,
            },
          ],
        };
      }
    );
  }
}
