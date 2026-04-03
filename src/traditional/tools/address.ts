import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerAddressTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_firewall_addresses
  server.registerTool(
    "list_firewall_addresses",
    {
      description: "List firewall address objects",
      inputSchema: {
        name: z.string().optional().describe("Filter by address name"),
        type: z
          .enum([
            "ipmask",
            "iprange",
            "fqdn",
            "geography",
            "wildcard",
            "dynamic",
          ])
          .optional()
          .describe("Filter by address type"),
      },
    },
    async (args) => {
      let results = await client.get<unknown[]>("cmdb/firewall/address");

      // Apply filters
      if (args.name) {
        results = results.filter((a: any) =>
          a.name?.toLowerCase().includes(args.name!.toLowerCase())
        );
      }
      if (args.type) {
        results = results.filter((a: any) => a.type === args.type);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // get_firewall_address
  server.registerTool(
    "get_firewall_address",
    {
      description: "Get a specific firewall address object",
      inputSchema: {
        name: z.string().describe("Address object name (mkey)"),
      },
    },
    async (args) => {
      const result = await client.get(`cmdb/firewall/address/${args.name}`);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // list_address_groups
  server.registerTool(
    "list_address_groups",
    {
      description: "List firewall address groups",
      inputSchema: {
        name: z.string().optional().describe("Filter by group name"),
      },
    },
    async (args) => {
      let results = await client.get<unknown[]>("cmdb/firewall/addrgrp");

      if (args.name) {
        results = results.filter((g: any) =>
          g.name?.toLowerCase().includes(args.name!.toLowerCase())
        );
      }

      return {
        content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_firewall_address
    server.registerTool(
      "create_firewall_address",
      {
        description: "Create a new firewall address object",
        inputSchema: {
          name: z.string().describe("Address object name"),
          type: z
            .enum([
              "ipmask",
              "iprange",
              "fqdn",
              "geography",
              "wildcard",
              "dynamic",
            ])
            .describe("Address type"),
          subnet: z
            .string()
            .optional()
            .describe("Subnet in CIDR format (for ipmask)"),
          start_ip: z
            .string()
            .optional()
            .describe("Start IP (for iprange)"),
          end_ip: z.string().optional().describe("End IP (for iprange)"),
          fqdn: z.string().optional().describe("FQDN (for fqdn type)"),
          country: z.string().optional().describe("Country code (for geography)"),
          comment: z.string().optional().describe("Comment"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          type: args.type,
        };

        if (args.comment) body.comment = args.comment;

        // Type-specific fields
        switch (args.type) {
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

        const result = await client.post("cmdb/firewall/address", body);
        return {
          content: [
            {
              type: "text",
              text: `Created firewall address: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // update_firewall_address
    server.registerTool(
      "update_firewall_address",
      {
        description: "Update an existing firewall address object",
        inputSchema: {
          name: z.string().describe("Address object name (mkey)"),
          comment: z.string().optional().describe("New comment"),
          subnet: z.string().optional().describe("New subnet (for ipmask)"),
          fqdn: z.string().optional().describe("New FQDN (for fqdn type)"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {};

        if (args.comment !== undefined) body.comment = args.comment;
        if (args.subnet !== undefined) body.subnet = args.subnet;
        if (args.fqdn !== undefined) body.fqdn = args.fqdn;

        if (Object.keys(body).length === 0) {
          throw new Error("At least one field must be provided for update");
        }

        const result = await client.put(
          "cmdb/firewall/address",
          args.name,
          body
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated firewall address: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );

    // delete_firewall_address
    server.registerTool(
      "delete_firewall_address",
      {
        description: "Delete a firewall address object",
        inputSchema: {
          name: z.string().describe("Address object name (mkey)"),
        },
      },
      async (args) => {
        const result = await client.delete("cmdb/firewall/address", args.name);
        return {
          content: [
            {
              type: "text",
              text: `Deleted firewall address ${args.name}: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
