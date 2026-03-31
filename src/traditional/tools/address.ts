import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerAddressTools(
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
          .describe("Filter expression (e.g., name==myAddress)"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) {
        params.filter = args.filter;
      }

      const response = await client.get("cmdb/firewall/address", params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
      };
    }
  );

  // get_address
  server.registerTool(
    "get_address",
    {
      description: "Get a specific firewall address object",
      inputSchema: {
        name: z.string().describe("Address object name"),
      },
    },
    async (args) => {
      const response = await client.get(`cmdb/firewall/address/${args.name}`);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.results, null, 2),
          },
        ],
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
            .optional()
            .describe("Address type (default: ipmask)"),
          subnet: z
            .string()
            .optional()
            .describe("IP/netmask (for ipmask type, e.g., 10.0.0.0/8)"),
          start_ip: z
            .string()
            .optional()
            .describe("Start IP (for iprange type)"),
          end_ip: z.string().optional().describe("End IP (for iprange type)"),
          fqdn: z.string().optional().describe("FQDN (for fqdn type)"),
          country: z
            .string()
            .optional()
            .describe("Country code (for geography type)"),
          comment: z.string().optional().describe("Comment"),
        },
      },
      async (args) => {
        const type = args.type || "ipmask";
        const body: Record<string, unknown> = {
          name: args.name,
          type,
        };

        // Type-specific fields
        switch (type) {
          case "ipmask":
            if (!args.subnet)
              throw new Error("subnet is required for ipmask type");
            body.subnet = args.subnet;
            break;
          case "iprange":
            if (!args.start_ip || !args.end_ip)
              throw new Error("start_ip and end_ip are required for iprange type");
            body["start-ip"] = args.start_ip;
            body["end-ip"] = args.end_ip;
            break;
          case "fqdn":
            if (!args.fqdn) throw new Error("fqdn is required for fqdn type");
            body.fqdn = args.fqdn;
            break;
          case "geography":
            if (!args.country)
              throw new Error("country is required for geography type");
            body.country = args.country;
            break;
        }

        if (args.comment) body.comment = args.comment;

        const response = await client.post("cmdb/firewall/address", body);
        return {
          content: [
            {
              type: "text",
              text: `Created address object: ${JSON.stringify(response.results, null, 2)}`,
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
        const response = await client.delete("cmdb/firewall/address", args.name);
        return {
          content: [
            {
              type: "text",
              text: `Deleted address object ${args.name}: ${JSON.stringify(response.results, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
