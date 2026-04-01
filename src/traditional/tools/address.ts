import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiApiClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerAddressTools(
  server: McpServer,
  client: FortiApiClient,
  config: Config
): void {
  // list_address_objects
  server.registerTool(
    "list_address_objects",
    {
      description: "List firewall address objects",
      inputSchema: {
        name: z.string().optional().describe("Filter by address name"),
        type: z
          .enum(["ipmask", "iprange", "fqdn", "geography", "dynamic"])
          .optional()
          .describe("Filter by address type"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      
      if (args.name) params["name"] = args.name;
      if (args.type) params["type"] = args.type;

      const response = await client.get("/cmdb/firewall/address", params);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
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
      const response = await client.get(`/cmdb/firewall/address/${args.name}`);
      return {
        content: [
          { type: "text", text: JSON.stringify(response.results, null, 2) },
        ],
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
            .enum(["ipmask", "iprange", "fqdn", "geography"])
            .optional()
            .describe("Address type (default: ipmask)"),
          subnet: z
            .string()
            .optional()
            .describe("Subnet in CIDR notation (for ipmask type, e.g. 192.168.1.0/24)"),
          start_ip: z.string().optional().describe("Start IP (for iprange type)"),
          end_ip: z.string().optional().describe("End IP (for iprange type)"),
          fqdn: z.string().optional().describe("FQDN (for fqdn type)"),
          country: z.string().optional().describe("Country code (for geography type)"),
          comment: z.string().optional().describe("Comment"),
        },
      },
      async (args) => {
        const type = args.type ?? "ipmask";
        const body: Record<string, unknown> = {
          name: args.name,
          type,
        };

        if (type === "ipmask") {
          if (!args.subnet) throw new Error("subnet is required for ipmask type");
          body.subnet = args.subnet;
        } else if (type === "iprange") {
          if (!args.start_ip || !args.end_ip) {
            throw new Error("start_ip and end_ip are required for iprange type");
          }
          body["start-ip"] = args.start_ip;
          body["end-ip"] = args.end_ip;
        } else if (type === "fqdn") {
          if (!args.fqdn) throw new Error("fqdn is required for fqdn type");
          body.fqdn = args.fqdn;
        } else if (type === "geography") {
          if (!args.country) throw new Error("country is required for geography type");
          body.country = args.country;
        }

        if (args.comment) body.comment = args.comment;

        const response = await client.post("/cmdb/firewall/address", body);
        return {
          content: [
            {
              type: "text",
              text: `Created address object: ${JSON.stringify(response, null, 2)}`,
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
          subnet: z.string().optional().describe("New subnet (for ipmask type)"),
          start_ip: z.string().optional().describe("New start IP (for iprange type)"),
          end_ip: z.string().optional().describe("New end IP (for iprange type)"),
          fqdn: z.string().optional().describe("New FQDN (for fqdn type)"),
          comment: z.string().optional().describe("New comment"),
        },
      },
      async (args) => {
        const { name, ...updates } = args;
        
        if (Object.keys(updates).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const body: Record<string, unknown> = {};
        if (updates.subnet) body.subnet = updates.subnet;
        if (updates.start_ip) body["start-ip"] = updates.start_ip;
        if (updates.end_ip) body["end-ip"] = updates.end_ip;
        if (updates.fqdn) body.fqdn = updates.fqdn;
        if (updates.comment) body.comment = updates.comment;

        const response = await client.put(`/cmdb/firewall/address/${name}`, body);
        return {
          content: [
            {
              type: "text",
              text: `Updated address object ${name}: ${JSON.stringify(response, null, 2)}`,
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
        const response = await client.delete(`/cmdb/firewall/address/${args.name}`);
        return {
          content: [
            {
              type: "text",
              text: `Deleted address object ${args.name}: ${JSON.stringify(response, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
