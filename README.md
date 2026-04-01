# Fortinet MCP Server

MCP (Model Context Protocol) server for **Fortinet FortiGate** firewalls — manage firewall policies, address objects, services, and system monitoring via AI agents.

Part of the **net-infra-mcp** project family.

## Features

### Traditional Mode (High-Level Tools)

**Firewall Policy Management**
- `list_firewall_policies` — List all firewall policies with filters
- `get_firewall_policy` — Get specific policy by ID
- `create_firewall_policy` — Create new firewall policy (write-gated)
- `update_firewall_policy` — Update existing policy (write-gated)
- `delete_firewall_policy` — Delete policy (write-gated)
- `move_firewall_policy` — Reorder policies (write-gated)

**Address Object Management**
- `list_address_objects` — List firewall address objects
- `get_address_object` — Get specific address object
- `create_address_object` — Create address (ipmask/iprange/fqdn/geography) (write-gated)
- `update_address_object` — Update address object (write-gated)
- `delete_address_object` — Delete address object (write-gated)

**System & Monitoring**
- `get_system_status` — System version, uptime, resources
- `get_system_resources` — CPU, memory, disk usage
- `list_interfaces` — Network interfaces
- `get_interface` — Specific interface details
- `list_static_routes` — Static routing table
- `get_sessions` — Active firewall sessions/connections

### Code Mode (Direct API Access)

Single unified tool:
- `fortinet_api` — Execute any FortiGate REST API request (GET/POST/PUT/DELETE)

Gives AI agents full API access with natural-language context awareness.

## Installation

```bash
npm install
npm run build
```

## Configuration

Set these environment variables:

```bash
export FORTINET_HOST="https://your-fortigate.example.com"
export FORTINET_API_KEY="your-api-key-here"
export FORTINET_VDOM="root"                    # Optional, default: root
export FORTINET_API_VERSION="v2"                # Optional, default: v2
export FORTINET_VERIFY_SSL="false"              # Optional, set to false for self-signed certs
```

### FortiGate API Key Setup

1. Log into FortiGate web UI
2. Go to **System > Administrators > Create New > REST API Admin**
3. Set username, trusted hosts, and VDOM access
4. Generate API key and save it securely
5. Use the generated key as `FORTINET_API_KEY`

## Usage

### Traditional Mode

```bash
# Read-only mode (safe for production)
npm run start:traditional

# Write-enabled mode (DANGEROUS — enables create/update/delete)
node dist/traditional/index.js --enable-write
```

### Code Mode

```bash
# Read-only mode
npm run start:code-mode

# Write-enabled mode
node dist/code-mode/index.js --enable-write
```

### MCP Client Configuration

Add to your MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "fortinet": {
      "command": "node",
      "args": ["/path/to/fortinet-mcp-server/dist/traditional/index.js"],
      "env": {
        "FORTINET_HOST": "https://your-fortigate.example.com",
        "FORTINET_API_KEY": "your-api-key",
        "FORTINET_VDOM": "root"
      }
    }
  }
}
```

For write operations, add `--enable-write` to `args`.

## Testing

```bash
npm test
```

Tests use Vitest with mocked FortiGate API responses.

## Safety

⚠️ **Write operations are DISABLED by default.**

To enable creates/updates/deletes, you MUST pass `--enable-write` flag when starting the server.

**Read-only tools** (always available):
- All `list_*` and `get_*` tools
- System monitoring tools

**Write tools** (require `--enable-write`):
- `create_*`, `update_*`, `delete_*`, `move_*`

## API Reference

Uses [FortiGate REST API](https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/399023/rest-api).

Common endpoints:
- `/api/v2/cmdb/firewall/policy` — Firewall policies
- `/api/v2/cmdb/firewall/address` — Address objects
- `/api/v2/cmdb/system/interface` — Interfaces
- `/api/v2/monitor/system/status` — System status
- `/api/v2/monitor/firewall/session` — Active sessions

## Project Structure

```
fortinet-mcp-server/
├── src/
│   ├── client.ts                    # FortiAPI REST client
│   ├── config.ts                    # Environment config loader
│   ├── traditional/
│   │   ├── index.ts                 # Traditional MCP server
│   │   └── tools/
│   │       ├── firewall.ts          # Firewall policy tools
│   │       ├── address.ts           # Address object tools
│   │       └── system.ts            # System monitoring tools
│   └── code-mode/
│       └── index.ts                 # Code-mode MCP server
├── tests/                           # Vitest unit tests
├── dist/                            # Compiled output
└── package.json
```

## License

ISC

## Related Projects

- [infoblox-mcp-server](https://github.com/cheenu1092-oss/infoblox-mcp-server) — DNS/DHCP/IPAM
- More network infrastructure MCP servers coming soon (Cisco, Palo Alto, etc.)

## Contributing

Issues and PRs welcome!
