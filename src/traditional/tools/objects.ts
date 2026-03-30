import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerObjectTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_addresses
  server.registerTool(
    "list_addresses",
    {
      description: "List all firewall address objects",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., 'name==MyAddress')"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params["filter"] = args.filter;

      const result = await client.get("/cmdb/firewall/address", params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_address_groups
  server.registerTool(
    "list_address_groups",
    {
      description: "List all firewall address groups",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., 'name==MyGroup')"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params["filter"] = args.filter;

      const result = await client.get("/cmdb/firewall/addrgrp", params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_services
  server.registerTool(
    "list_services",
    {
      description: "List all custom firewall service objects",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., 'name==MyService')"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params["filter"] = args.filter;

      const result = await client.get("/cmdb/firewall.service/custom", params);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_address
    server.registerTool(
      "create_address",
      {
        description: "Create a new firewall address object",
        inputSchema: {
          name: z.string().describe("Address object name"),
          type: z
            .enum(["ipmask", "iprange", "fqdn", "geography"])
            .describe("Address type"),
          subnet: z
            .string()
            .optional()
            .describe("IP/mask for ipmask type (e.g., '192.168.1.0/24')"),
          start_ip: z
            .string()
            .optional()
            .describe("Start IP for iprange type"),
          end_ip: z.string().optional().describe("End IP for iprange type"),
          fqdn: z.string().optional().describe("FQDN for fqdn type"),
          country: z
            .string()
            .optional()
            .describe("Country code for geography type"),
          comment: z.string().optional().describe("Address comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          type: args.type,
        };

        if (args.subnet) body.subnet = args.subnet;
        if (args.start_ip) body["start-ip"] = args.start_ip;
        if (args.end_ip) body["end-ip"] = args.end_ip;
        if (args.fqdn) body.fqdn = args.fqdn;
        if (args.country) body.country = args.country;
        if (args.comment) body.comment = args.comment;

        const result = await client.post("/cmdb/firewall/address", body);
        return {
          content: [
            {
              type: "text",
              text: `Created address object: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // delete_address
    server.registerTool(
      "delete_address",
      {
        description: "Delete a firewall address object",
        inputSchema: {
          name: z.string().describe("Address object name to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(
          `/cmdb/firewall/address/${encodeURIComponent(args.name)}`
        );
        return {
          content: [
            {
              type: "text",
              text: `Deleted address object '${args.name}': ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // create_address_group
    server.registerTool(
      "create_address_group",
      {
        description: "Create a new firewall address group",
        inputSchema: {
          name: z.string().describe("Address group name"),
          members: z
            .array(z.string())
            .describe("List of address object names to include in the group"),
          comment: z.string().optional().describe("Group comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          member: args.members.map((m) => ({ name: m })),
        };

        if (args.comment) body.comment = args.comment;

        const result = await client.post("/cmdb/firewall/addrgrp", body);
        return {
          content: [
            {
              type: "text",
              text: `Created address group: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // create_service
    server.registerTool(
      "create_service",
      {
        description: "Create a new custom firewall service object",
        inputSchema: {
          name: z.string().describe("Service name"),
          protocol: z
            .enum(["TCP/UDP/SCTP", "ICMP", "ICMP6", "IP"])
            .describe("Service protocol"),
          tcp_portrange: z
            .string()
            .optional()
            .describe("TCP port range (e.g., '80' or '8080-8090')"),
          udp_portrange: z
            .string()
            .optional()
            .describe("UDP port range (e.g., '53' or '1024-65535')"),
          comment: z.string().optional().describe("Service comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          protocol: args.protocol,
        };

        if (args.tcp_portrange) body["tcp-portrange"] = args.tcp_portrange;
        if (args.udp_portrange) body["udp-portrange"] = args.udp_portrange;
        if (args.comment) body.comment = args.comment;

        const result = await client.post(
          "/cmdb/firewall.service/custom",
          body
        );
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
  }
}
