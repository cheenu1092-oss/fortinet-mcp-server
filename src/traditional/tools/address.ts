import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiClient } from "../../client.js";
import { Config } from "../../config.js";

const ADDRESS_TYPES = ["ipmask", "iprange", "fqdn", "geography"] as const;

export function registerAddressTools(
  server: McpServer,
  client: FortiClient,
  config: Config
): void {
  // list_address_objects
  server.registerTool(
    "list_address_objects",
    {
      description: "List all address objects",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Filter by name (regex supported)"),
        type: z
          .enum(ADDRESS_TYPES)
          .optional()
          .describe("Filter by address type"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};

      if (args.name) params["name~"] = args.name;
      if (args.type) params["type"] = args.type;

      const results = await client.getAll("/api/v2/cmdb/firewall/address", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // list_address_groups
  server.registerTool(
    "list_address_groups",
    {
      description: "List all address groups",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Filter by group name (regex supported)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.name) params["name~"] = args.name;

      const results = await client.getAll("/api/v2/cmdb/firewall/addrgrp", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_address_object
    server.registerTool(
      "create_address_object",
      {
        description: "Create a new address object",
        inputSchema: {
          name: z.string().describe("Address object name"),
          type: z
            .enum(ADDRESS_TYPES)
            .describe("Address type (ipmask, iprange, fqdn, geography)"),
          // Type-specific fields
          subnet: z
            .string()
            .optional()
            .describe("Subnet in CIDR notation (for ipmask type)"),
          start_ip: z.string().optional().describe("Start IP (for iprange type)"),
          end_ip: z.string().optional().describe("End IP (for iprange type)"),
          fqdn: z.string().optional().describe("Fully qualified domain name (for fqdn type)"),
          country: z.string().optional().describe("Country code (for geography type)"),
          comment: z.string().optional().describe("Comment for the address object"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          type: args.type,
        };

        // Validate and add type-specific fields
        switch (args.type) {
          case "ipmask":
            if (!args.subnet) {
              throw new Error("subnet is required for ipmask type");
            }
            body.subnet = args.subnet;
            break;
          case "iprange":
            if (!args.start_ip || !args.end_ip) {
              throw new Error("start_ip and end_ip are required for iprange type");
            }
            body["start-ip"] = args.start_ip;
            body["end-ip"] = args.end_ip;
            break;
          case "fqdn":
            if (!args.fqdn) {
              throw new Error("fqdn is required for fqdn type");
            }
            body.fqdn = args.fqdn;
            break;
          case "geography":
            if (!args.country) {
              throw new Error("country is required for geography type");
            }
            body.country = args.country;
            break;
        }

        if (args.comment) body.comment = args.comment;

        const result = await client.post("/api/v2/cmdb/firewall/address", body);
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

    // update_address_object
    server.registerTool(
      "update_address_object",
      {
        description: "Update an existing address object",
        inputSchema: {
          name: z.string().describe("Address object name to update"),
          subnet: z
            .string()
            .optional()
            .describe("New subnet (for ipmask type)"),
          start_ip: z.string().optional().describe("New start IP (for iprange type)"),
          end_ip: z.string().optional().describe("New end IP (for iprange type)"),
          fqdn: z.string().optional().describe("New FQDN (for fqdn type)"),
          comment: z.string().optional().describe("New comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {};

        if (args.subnet !== undefined) body.subnet = args.subnet;
        if (args.start_ip !== undefined) body["start-ip"] = args.start_ip;
        if (args.end_ip !== undefined) body["end-ip"] = args.end_ip;
        if (args.fqdn !== undefined) body.fqdn = args.fqdn;
        if (args.comment !== undefined) body.comment = args.comment;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          "/api/v2/cmdb/firewall/address",
          args.name,
          body
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated address object: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // delete_address_object
    server.registerTool(
      "delete_address_object",
      {
        description: "Delete an address object",
        inputSchema: {
          name: z.string().describe("Address object name to delete"),
        },
      },
      async (args) => {
        const result = await client.delete(
          "/api/v2/cmdb/firewall/address",
          args.name
        );
        return {
          content: [
            {
              type: "text",
              text: `Deleted address object ${args.name}: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
