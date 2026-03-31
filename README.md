# 🔥 Fortinet MCP Server

MCP (Model Context Protocol) server for Fortinet FortiGate — firewall, VPN, SD-WAN management via AI agents.

Part of the [Net Infra MCP](https://github.com/cheenu1092-oss/net-infra-mcp) collection.

## Two Variants

### Traditional Mode
Pre-built MCP tools with typed inputs/outputs. Safe, discoverable, structured.

```
"Show me all firewall policies"
→ calls list_firewall_policies()

"Create a firewall policy allowing HTTPS from LAN to WAN"  
→ calls create_firewall_policy(name="Allow-HTTPS", srcintf=[{name:"port1"}], ...)
```

### Code Mode
Agent receives direct FortiGate REST API access. Power-user mode for complex operations.

```
"Find all disabled firewall policies and enable them"
→ Agent composes: GET /api/v2/cmdb/firewall/policy?filter=status==disable
→ Iterates and calls: PUT /api/v2/cmdb/firewall/policy/{policyid} with status=enable
```

## Supported Operations

### Firewall Policies
| Tool | API Path | Description |
|------|----------|-------------|
| `list_firewall_policies` | `cmdb/firewall/policy` | List all firewall policies |
| `get_firewall_policy` | `cmdb/firewall/policy/{policyid}` | Get specific policy |
| `create_firewall_policy` | `cmdb/firewall/policy` | Create new policy |
| `update_firewall_policy` | `cmdb/firewall/policy/{policyid}` | Update existing policy |
| `delete_firewall_policy` | `cmdb/firewall/policy/{policyid}` | Delete policy |

### Address Objects
| Tool | API Path | Description |
|------|----------|-------------|
| `list_addresses` | `cmdb/firewall/address` | List all address objects |
| `get_address` | `cmdb/firewall/address/{name}` | Get specific address |
| `create_address` | `cmdb/firewall/address` | Create address (IP, range, FQDN, geo) |
| `delete_address` | `cmdb/firewall/address/{name}` | Delete address |

### System & Monitoring
| Tool | API Path | Description |
|------|----------|-------------|
| `get_system_status` | `monitor/system/status` | System version and status |
| `get_system_performance` | `monitor/system/resource/usage` | CPU, memory, sessions |
| `list_interfaces` | `cmdb/system/interface` | List all interfaces |
| `get_interface` | `cmdb/system/interface/{name}` | Get specific interface |

## Configuration

```json
{
  "fortinet": {
    "host": "https://fortigate.example.com",
    "api_key": "your-api-key-here",
    "vdom": "root",
    "verify_ssl": true
  }
}
```

Or via environment variables:
```bash
FORTINET_HOST=https://fortigate.example.com
FORTINET_API_KEY=your-api-key-here
FORTINET_VDOM=root
FORTINET_VERIFY_SSL=true
```

### Generating an API Key

1. Log in to FortiGate web UI
2. Go to **System > Administrators**
3. Create a new **REST API Admin** or edit existing admin
4. Generate an API key and copy it (you won't see it again)
5. Set appropriate permissions (read-write for write tools, read-only otherwise)

## Security

- **Read-only by default.** Write tools (`create_*`, `update_*`, `delete_*`) require `--enable-write` flag.
- All API calls use Bearer token authentication.
- SSL verification enabled by default.
- Supports VDOM isolation for multi-tenant deployments.

## Setup

```bash
npm install
npm run build

# Traditional mode (read-only)
npx fortinet-mcp-server

# Traditional mode (read + write)
npx fortinet-mcp-server --enable-write

# Code mode
npx fortinet-mcp-server --mode code
```

## Roadmap

- [ ] VPN tools (IPsec, SSL VPN)
- [ ] SD-WAN health monitoring
- [ ] Service objects management
- [ ] Address groups
- [ ] Route management
- [ ] High Availability (HA) status

## License

MIT
