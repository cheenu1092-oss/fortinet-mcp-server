# Fortinet MCP Server — Build Spec

## Overview
Build an MCP server (TypeScript, using @modelcontextprotocol/sdk) that wraps the FortiGate/FortiOS REST API for firewall, NAT, routing, and system management.

## FortiGate REST API Reference
- Base URL: `https://{host}/api/v2/`
- Auth: API token via `Authorization: Bearer {token}` header
- Format: JSON (default)
- Methods: GET (read), POST (create), PUT (update), DELETE (delete)
- FortiOS Version: 7.4+

### Key API Patterns
```
GET    /api/v2/cmdb/{path}/{name}                   → List objects
GET    /api/v2/cmdb/{path}/{name}?filter=field==value → Filter objects
GET    /api/v2/cmdb/{path}/{name}/{mkey}             → Get specific object
POST   /api/v2/cmdb/{path}/{name}                    → Create object (body = JSON)
PUT    /api/v2/cmdb/{path}/{name}/{mkey}             → Update object (body = JSON)
DELETE /api/v2/cmdb/{path}/{name}/{mkey}             → Delete object
GET    /api/v2/monitor/{path}/{name}                 → Monitor/status endpoints
```

### Response Format
```json
{
  "http_status": 200,
  "results": [...],      // Array of objects (for list operations)
  "result": {...},       // Single object (for get operations)
  "vdom": "root",
  "path": "firewall",
  "name": "policy",
  "status": "success",
  "serial": "FGVM0ABCD123456",
  "version": "v7.4.1",
  "build": 2463
}
```

### Filter Syntax
- `filter=field==value` — exact match
- `filter=field!=value` — not equal
- `filter=field=@value` — contains
- `filter=name==web-server&type==iprange` — AND condition
- Multiple filters: `filter=field1==value1&filter=field2==value2`

### Key API Paths
| Path | Description |
|------|-------------|
| `/cmdb/firewall/policy` | Firewall policies |
| `/cmdb/firewall/address` | Address objects (hosts, subnets, ranges) |
| `/cmdb/firewall/addrgrp` | Address groups |
| `/cmdb/firewall/service/custom` | Custom service objects |
| `/cmdb/firewall/service/group` | Service groups |
| `/cmdb/firewall/ippool` | IP pools (NAT) |
| `/cmdb/firewall/vip` | Virtual IPs (DNAT) |
| `/cmdb/router/static` | Static routes |
| `/cmdb/system/interface` | Network interfaces |
| `/cmdb/system/admin` | Administrator accounts |
| `/cmdb/system/global` | Global system settings |
| `/monitor/firewall/session` | Active sessions |
| `/monitor/system/interface` | Interface status |
| `/monitor/router/ipv4` | Routing table |

### Common Object Structures

**Firewall Policy:**
```json
{
  "policyid": 1,
  "name": "Allow-Web-Traffic",
  "action": "accept",
  "srcintf": [{"name": "port1"}],
  "dstintf": [{"name": "port2"}],
  "srcaddr": [{"name": "LAN-Subnet"}],
  "dstaddr": [{"name": "Internet"}],
  "service": [{"name": "HTTP"}, {"name": "HTTPS"}],
  "schedule": "always",
  "nat": "disable",
  "status": "enable",
  "comments": "Allow outbound web traffic"
}
```

**Address Object:**
```json
{
  "name": "Web-Server-01",
  "type": "ipmask",
  "subnet": "192.168.1.100 255.255.255.255",
  "comment": "Production web server",
  "visibility": "enable"
}
```

**Service Object:**
```json
{
  "name": "Custom-App-8080",
  "category": "Web Access",
  "protocol": "TCP/UDP/SCTP",
  "tcp-portrange": "8080",
  "comment": "Custom application port"
}
```

## Architecture

```
src/
├── config.ts                  # Environment/config parsing
├── client.ts                  # FortiGate REST API client (auth, retries)
├── traditional/
│   ├── index.ts               # MCP server setup, tool registration
│   └── tools/
│       ├── firewall.ts        # Firewall policy tools
│       ├── address.ts         # Address object tools
│       ├── service.ts         # Service object tools
│       ├── nat.ts             # NAT/VIP tools
│       ├── routing.ts         # Static route tools
│       └── system.ts          # System/interface/admin tools
└── code-mode/
    ├── index.ts               # MCP server setup for code mode
    ├── schemas/
    │   └── fortigate-schema.json  # FortiGate API object definitions
    └── executor.ts            # Sandboxed API call executor

tests/
├── client.test.ts
├── tools/
│   ├── firewall.test.ts
│   ├── address.test.ts
│   ├── service.test.ts
│   └── nat.test.ts
└── code-mode/
    └── executor.test.ts
```

## Traditional Mode Tools

### Tool Design Principles
1. Each tool = one logical operation
2. Typed inputs with zod schemas
3. Read-only by default, write tools gated behind `--enable-write`
4. Return useful fields (avoid overwhelming output)
5. Error messages should be helpful (not raw API errors)

### Tool List (implement in phases)

**Phase 1 — Core Read Operations:**
1. `list_firewall_policies` — List all firewall policies
2. `get_firewall_policy` — Get specific policy details
3. `list_address_objects` — List address objects
4. `get_address_object` — Get specific address object
5. `list_service_objects` — List custom service objects
6. `get_service_object` — Get specific service object
7. `list_interfaces` — List network interfaces
8. `get_interface_status` — Get interface status (monitor API)
9. `list_static_routes` — List static routes
10. `list_active_sessions` — List active firewall sessions
11. `get_system_status` — Get system status and version info

**Phase 2 — Write Operations (gated):**
12. `create_firewall_policy` — Create firewall policy
13. `update_firewall_policy` — Update firewall policy
14. `delete_firewall_policy` — Delete firewall policy
15. `create_address_object` — Create address object
16. `update_address_object` — Update address object
17. `delete_address_object` — Delete address object
18. `create_service_object` — Create custom service
19. `delete_service_object` — Delete custom service
20. `create_vip` — Create virtual IP (DNAT)
21. `create_ippool` — Create IP pool (SNAT)

**Phase 3 — Advanced Operations:**
22. `move_firewall_policy` — Reorder policy (before/after)
23. `create_address_group` — Create address group
24. `create_service_group` — Create service group
25. `backup_config` — Download configuration backup
26. `restore_config` — Upload configuration

## Code Mode Design

The code mode variant provides:
1. A `fortigate_schema` resource — full FortiGate API object definitions
2. An `execute_fortigate_call` tool — executes arbitrary API calls with:
   - Method (GET/POST/PUT/DELETE)
   - Path (e.g., `/cmdb/firewall/policy`)
   - Body (optional JSON)
   - VDOM support (multi-tenancy)
   - Rate limiting
   - Audit logging
   - Write operations gated behind `--enable-write` flag

## Package Setup
- TypeScript with strict mode
- @modelcontextprotocol/sdk for MCP server
- zod for input validation
- Node.js native fetch for HTTP
- vitest for tests
- tsup for build

## Environment Variables
```
FORTIGATE_HOST=https://fortigate.example.com
FORTIGATE_TOKEN=your-api-token-here
FORTIGATE_VDOM=root
FORTIGATE_VERIFY_SSL=true
FORTIGATE_TIMEOUT=30000
```

## Security Considerations
1. API tokens should be stored securely (never commit to git)
2. Write operations are disabled by default
3. All API calls are logged for audit trails
4. SSL verification enabled by default
5. Rate limiting to prevent accidental DoS
6. VDOM isolation (multi-tenancy support)

## Next Steps
1. Implement client.ts with FortiGate API authentication
2. Build Phase 1 tools (read-only operations)
3. Add comprehensive tests
4. Create example configurations
5. Add Phase 2 write operations (gated)
6. Document common use cases
