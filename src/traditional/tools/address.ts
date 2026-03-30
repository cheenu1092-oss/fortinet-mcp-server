import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerAddressTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_address_objects
  server.registerTool(
    "list_address_objects",
    {
      description: "List all address objects with optional filters",
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe("Filter by address name (exact match)"),
        type: z
          .enum(["ipmask", "iprange", "fqdn", "geography", "wildcard"])
          .optional()
          .describe("Filter by address type"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};

      const filters: string[] = [];
      if (args.name) filters.push(`name==${args.name}`);
      if (args.type) filters.push(`type==${args.type}`);

      if (filters.length > 0) {
        params.filter = filters.join("&");
      }

      const results = await client.getAll("/cmdb/firewall/address", params);
      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // get_address_object
  server.registerTool(
    "get_address_object",
    {
      description: "Get a specific address object by name",
      inputSchema: {
        name: z.string().describe("Address object name"),
      },
    },
    async (args) => {
      const result = await client.get(`/cmdb/firewall/address/${args.name}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
            .enum(["ipmask", "iprange", "fqdn", "wildcard"])
            .describe("Address type"),
          subnet: z
            .string()
            .optional()
            .describe("IP/netmask for ipmask type (e.g., '192.168.1.0 255.255.255.0')"),
          start_ip: z
            .string()
            .optional()
            .describe("Start IP for iprange type"),
          end_ip: z
            .string()
            .optional()
            .describe("End IP for iprange type"),
          fqdn: z
            .string()
            .optional()
            .describe("FQDN for fqdn type"),
          wildcard: z
            .string()
            .optional()
            .describe("Wildcard for wildcard type"),
          comment: z.string().optional().describe("Comment/description"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          type: args.type,
        };

        // Add type-specific fields
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
          case "wildcard":
            if (!args.wildcard) {
              throw new Error("wildcard is required for wildcard type");
            }
            body.wildcard = args.wildcard;
            break;
        }

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
          comment: z.string().optional().describe("New comment"),
        },
      },
      async (args) => {
        const { name, ...updates } = args;

        if (Object.keys(updates).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          `/cmdb/firewall/address/${name}`,
          updates
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
        const result = await client.delete(`/cmdb/firewall/address/${args.name}`);
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
