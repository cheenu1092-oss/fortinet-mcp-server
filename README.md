# Fortinet MCP Server

MCP (Model Context Protocol) server for FortiGate/FortiOS — firewall policy, NAT, routing, and system management via AI agents.

## Features

- **Read Operations** (default):
  - List and query firewall policies
  - Manage address objects (hosts, subnets, ranges, FQDNs)
  - View service objects
  - Monitor system status and interfaces
  - Check active sessions

- **Write Operations** (gated by `--enable-write` flag):
  - Create/update/delete firewall policies
  - Create/update/delete address objects
  - Manage service objects
  - Configure NAT (VIP, IP pools)

## Installation

```bash
npm install
npm run build
```

## Configuration

Set these environment variables:

```bash
export FORTIGATE_HOST=https://fortigate.example.com
export FORTIGATE_TOKEN=your-api-token-here
export FORTIGATE_VDOM=root                    # Optional, default: root
export FORTIGATE_VERIFY_SSL=true              # Optional, default: true
export FORTIGATE_TIMEOUT=30000                # Optional, default: 30000ms
```

### Getting an API Token

1. Log into FortiGate web UI
2. Navigate to **System > Administrators**
3. Create a new **REST API Admin** user
4. Set appropriate permissions (read-only or read-write)
5. Generate an API token
6. Copy the token (only shown once!)

## Usage

### Traditional Mode (MCP tools)

```bash
# Read-only mode (default)
npm run start:traditional

# Enable write operations (DANGEROUS)
npm run start:traditional -- --enable-write
```

### Code Mode (programmatic API access)

```bash
# Read-only mode
npm run start:code-mode

# Enable write operations
npm run start:code-mode -- --enable-write
```

## Available Tools

### Firewall Policy Tools
- `list_firewall_policies` — List all policies with filters
- `get_firewall_policy` — Get specific policy by ID
- `create_firewall_policy` ⚠️ — Create new policy
- `update_firewall_policy` ⚠️ — Update existing policy
- `delete_firewall_policy` ⚠️ — Delete policy

### Address Object Tools
- `list_address_objects` — List all address objects
- `get_address_object` — Get specific address object
- `create_address_object` ⚠️ — Create new address object
- `update_address_object` ⚠️ — Update address object
- `delete_address_object` ⚠️ — Delete address object

⚠️ = Requires `--enable-write` flag

## Development

```bash
# Run tests
npm test

# Build TypeScript
npm run build

# Build specific mode
npm run build:traditional
npm run build:code-mode
```

## Security

- **API tokens** are sensitive! Never commit them to version control
- **Write operations** are disabled by default for safety
- **SSL verification** is enabled by default
- All API calls are logged for audit trails
- VDOM isolation supported for multi-tenancy

## Architecture

```
src/
├── config.ts                  # Environment config
├── client.ts                  # FortiGate REST API client
├── traditional/               # MCP tools mode
│   ├── index.ts
│   └── tools/
│       ├── firewall.ts
│       └── address.ts
└── code-mode/                 # Programmatic API mode
    ├── index.ts
    ├── executor.ts
    └── schemas/
```

## API Reference

See [SPEC.md](./SPEC.md) for detailed FortiGate API documentation and tool specifications.

## License

ISC

## Related Projects

- [infoblox-mcp-server](https://github.com/cheenu1092-oss/infoblox-mcp-server) — MCP server for Infoblox NIOS (DNS/DHCP/IPAM)

---

Built with ❤️ using the [Model Context Protocol](https://modelcontextprotocol.io/)
