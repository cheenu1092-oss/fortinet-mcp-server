import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { FortiGateClient } from "../../client.js";
import { Config } from "../../config.js";

export function registerVpnTools(
  server: McpServer,
  client: FortiGateClient,
  config: Config
): void {
  // list_ipsec_tunnels
  server.registerTool(
    "list_ipsec_tunnels",
    {
      description: "List all IPsec VPN phase1 tunnel configurations",
      inputSchema: {
        filter: z
          .string()
          .optional()
          .describe("Filter expression (e.g., 'name==MyTunnel')"),
      },
    },
    async (args) => {
      const params: Record<string, string> = {};
      if (args.filter) params["filter"] = args.filter;

      const [phase1, phase2] = await Promise.all([
        client.get("/cmdb/vpn.ipsec/phase1-interface", params),
        client.get("/cmdb/vpn.ipsec/phase2-interface"),
      ]);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ phase1, phase2 }, null, 2),
          },
        ],
      };
    }
  );

  // get_vpn_status
  server.registerTool(
    "get_vpn_status",
    {
      description: "Get real-time IPsec VPN tunnel status from the monitor API",
      inputSchema: {},
    },
    async () => {
      const result = await client.get("/monitor/vpn/ipsec");
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  // Write operations (gated by --enable-write)
  if (config.enableWrite) {
    // create_ipsec_tunnel
    server.registerTool(
      "create_ipsec_tunnel",
      {
        description: "Create a new IPsec VPN phase1 tunnel",
        inputSchema: {
          name: z.string().describe("Tunnel name"),
          interface: z.string().describe("Outgoing interface name"),
          remote_gw: z.string().describe("Remote gateway IP address"),
          psksecret: z.string().describe("Pre-shared key"),
          ike_version: z
            .enum(["1", "2"])
            .optional()
            .describe("IKE version (default: 2)"),
          proposal: z
            .string()
            .optional()
            .describe(
              "Phase1 proposal (e.g., 'aes256-sha256-modp2048')"
            ),
          dhgrp: z
            .string()
            .optional()
            .describe("Diffie-Hellman group (e.g., '14')"),
          comments: z.string().optional().describe("Tunnel comments"),
        },
      },
      async (args) => {
        const body: Record<string, unknown> = {
          name: args.name,
          interface: args.interface,
          "remote-gw": args.remote_gw,
          psksecret: args.psksecret,
          "ike-version": args.ike_version ?? "2",
        };

        if (args.proposal) body.proposal = args.proposal;
        if (args.dhgrp) body.dhgrp = args.dhgrp;
        if (args.comments) body.comments = args.comments;

        const result = await client.post(
          "/cmdb/vpn.ipsec/phase1-interface",
          body
        );
        return {
          content: [
            {
              type: "text",
              text: `Created IPsec tunnel: ${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }
    );
  }
}
