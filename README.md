# 🔥 Fortinet FortiGate MCP Server

MCP (Model Context Protocol) server for Fortinet FortiGate — firewall policy, address objects, VPN, and system management via AI agents.

Part of the [Net Infra MCP](https://github.com/cheenu1092-oss/net-infra-mcp) collection.

## Features

### Firewall Management
- List, create, update, and delete firewall policies
- Filter policies by name, interface, status
- Enable/disable policies

### Address Objects
- Manage firewall address objects (IP, subnet, FQDN, geography)
- Create address groups
- Update and delete address objects

### System Management
- Get system status and performance
- List interfaces and routes
- Manage VDOMs

## Configuration

```bash
export FORTINET_HOST=https://fortigate.example.com
export FORTINET_API_KEY=your-api-key-here
export FORTINET_VDOM=root  # Optional, defaults to 'root'
export FORTINET_VERIFY_SSL=true  # Optional, defaults to true
```

## Security

- **Read-only by default.** Write tools (`create_*`, `update_*`, `delete_*`) require `--enable-write` flag.
- All API calls use Bearer token authentication.
- SSL verification enabled by default.

## Setup

```bash
npm install
npm run build

# Traditional mode (read-only)
npx fortinet-mcp-server

# Traditional mode (read + write)
npx fortinet-mcp-server --enable-write
```

## Supported Operations

### Firewall Policies
- `list_firewall_policies` - List all policies with filters
- `get_firewall_policy` - Get specific policy details
- `create_firewall_policy` *(write mode)* - Create new policy
- `update_firewall_policy` *(write mode)* - Update existing policy
- `delete_firewall_policy` *(write mode)* - Delete policy

### Address Objects
- `list_firewall_addresses` - List address objects
- `get_firewall_address` - Get specific address object
- `list_address_groups` - List address groups
- `create_firewall_address` *(write mode)* - Create address object
- `update_firewall_address` *(write mode)* - Update address object
- `delete_firewall_address` *(write mode)* - Delete address object

### System
- `get_system_status` - System information
- `get_system_performance` - Performance statistics
- `list_interfaces` - Network interfaces
- `get_interface` - Interface details
- `list_routes` - Static routes
- `list_vdoms` - Virtual domains

## License

MIT
