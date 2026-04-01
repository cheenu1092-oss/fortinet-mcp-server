# 🔥 Fortinet MCP Server

MCP (Model Context Protocol) server for Fortinet FortiGate — firewall policy, VPN, address objects, and system management via AI agents.

Part of the [Net Infra MCP](https://github.com/cheenu1092-oss/net-infra-mcp) collection.

## Two Variants

### Traditional Mode
Pre-built MCP tools with typed inputs/outputs. Safe, discoverable, structured.

```
"Show all firewall policies that are currently enabled"
→ calls list_firewall_policies(status="enable")

"Create an address object for my web server at 10.0.1.50"  
→ calls create_address_object(name="web-server-01", subnet="10.0.1.50/32")
```

### Code Mode
Agent receives the full FortiGate REST API schema and can compose arbitrary API calls. Power-user mode.

```
"Find all IPsec tunnels that haven't been active in the last 24 hours"
→ Agent composes: GET /api/v2/monitor/vpn/ipsec
→ Filters results programmatically based on last_activity timestamp
```

## Supported Operations

### Firewall Policies
| Tool | API Endpoint | Description |
|------|-------------|-------------|
| `list_firewall_policies` | `/cmdb/firewall/policy` | List firewall policies |
| `get_firewall_policy` | `/cmdb/firewall/policy/{id}` | Get policy by ID |
| `create_firewall_policy` | `/cmdb/firewall/policy` | Create firewall policy |
| `update_firewall_policy` | `/cmdb/firewall/policy/{id}` | Update firewall policy |
| `delete_firewall_policy` | `/cmdb/firewall/policy/{id}` | Delete firewall policy |
| `move_firewall_policy` | `/cmdb/firewall/policy/{id}?action=move` | Move policy position |

### Address Objects
| Tool | API Endpoint | Description |
|------|-------------|-------------|
| `list_address_objects` | `/cmdb/firewall/address` | List address objects |
| `get_address_object` | `/cmdb/firewall/address/{name}` | Get address object |
| `create_address_object` | `/cmdb/firewall/address` | Create address object |
| `update_address_object` | `/cmdb/firewall/address/{name}` | Update address object |
| `delete_address_object` | `/cmdb/firewall/address/{name}` | Delete address object |
| `list_address_groups` | `/cmdb/firewall/addrgrp` | List address groups |
| `create_address_group` | `/cmdb/firewall/addrgrp` | Create address group |

### Services
| Tool | API Endpoint | Description |
|------|-------------|-------------|
| `list_services` | `/cmdb/firewall.service/custom` | List custom services |
| `list_service_groups` | `/cmdb/firewall.service/group` | List service groups |
| `create_service` | `/cmdb/firewall.service/custom` | Create custom service |
| `create_service_group` | `/cmdb/firewall.service/group` | Create service group |
| `delete_service` | `/cmdb/firewall.service/custom/{name}` | Delete service |
| `delete_service_group` | `/cmdb/firewall.service/group/{name}` | Delete service group |

### VPN
| Tool | API Endpoint | Description |
|------|-------------|-------------|
| `list_ipsec_tunnels` | `/cmdb/vpn.ipsec/phase1-interface` | List IPsec phase 1 interfaces |
| `get_vpn_status` | `/monitor/vpn/ipsec` | Get VPN tunnel status |
| `create_ipsec_tunnel` | `/cmdb/vpn.ipsec/phase1-interface` | Create IPsec tunnel |

### System
| Tool | API Endpoint | Description |
|------|-------------|-------------|
| `get_system_status` | `/monitor/system/status` | Get system status & version |
| `get_system_resources` | `/monitor/system/resource/usage` | Get CPU/memory/disk usage |
| `list_interfaces` | `/cmdb/system/interface` | List network interfaces |
| `get_interface` | `/cmdb/system/interface/{name}` | Get interface details |
| `list_static_routes` | `/cmdb/router/static` | List static routes |
| `get_sessions` | `/monitor/firewall/session` | Get active firewall sessions |

## Configuration

```json
{
  "fortinet": {
    "host": "https://fortigate.example.com",
    "api_key": "***",
    "verify_ssl": true
  }
}
```

Or via environment variables:
```bash
FORTINET_HOST=https://fortigate.example.com
FORTINET_API_KEY=***
FORTINET_VERIFY_SSL=true
```

### Getting an API Key

1. Log into FortiGate web UI
2. Go to **System** > **Administrators**
3. Create a new **REST API Admin** user
4. Set a strong password and assign appropriate **Admin Profile** (e.g., `super_admin` or custom read-only profile)
5. Copy the generated API key

## Security

- **Read-only by default.** Write tools (`create_*`, `update_*`, `delete_*`) require `--enable-write` flag.
- All API calls are logged with timestamps and parameters.
- API key authentication (no username/password storage).
- SSL verification enabled by default.
- Supports admin profiles for granular RBAC.

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

## Use Cases

- **Policy audits:** "Show me all firewall policies allowing traffic from untrusted zones"
- **Compliance checks:** "Find all policies with logging disabled"
- **VPN monitoring:** "Which IPsec tunnels are currently down?"
- **Object management:** "Create address objects for my new data center subnet"
- **Automation:** "Move policy 42 to position 10"

## License

MIT
