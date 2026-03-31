# fortinet-mcp-server - Technical Specification

## Overview

MCP server providing AI agents programmatic access to Fortinet FortiGate firewalls via FortiOS REST API.

**Target API Version:** FortiOS 7.0+  
**Authentication:** API Token (Bearer)  
**Protocol:** HTTPS REST

---

## Architecture

### Dual Mode Implementation

1. **Traditional Mode** - Discrete MCP tools for specific operations
2. **Code-Mode** - Single executor tool with natural language → API call translation

Both modes use the same underlying `FortiClient` API client.

---

## Phase 1: Read-Only Operations

### 1. Firewall Policy Tools

#### `list_firewall_policies`
**Description:** List all firewall security policies  
**API Endpoint:** `GET /api/v2/cmdb/firewall/policy`  
**Parameters:**
- `vdom` (optional) - Virtual domain (default: root)
- `name` (optional) - Filter by policy name (regex)
- `srcaddr` (optional) - Filter by source address
- `dstaddr` (optional) - Filter by destination address
- `service` (optional) - Filter by service
- `action` (optional) - Filter by action (accept, deny, ipsec)

**Returns:** Array of policy objects with:
- `policyid` - Policy ID
- `name` - Policy name
- `srcintf`, `dstintf` - Source/destination interfaces
- `srcaddr`, `dstaddr` - Source/destination addresses
- `service` - Service objects
- `action` - Policy action
- `status` - Enable/disable status
- `nat` - NAT configuration
- `schedule` - Schedule object
- `comments` - Policy comments

---

#### `get_firewall_policy`
**Description:** Get a specific firewall policy by ID  
**API Endpoint:** `GET /api/v2/cmdb/firewall/policy/{id}`  
**Parameters:**
- `policyid` (required) - Policy ID
- `vdom` (optional) - Virtual domain

**Returns:** Single policy object with full details

---

### 2. Address Object Tools

#### `list_address_objects`
**Description:** List all address objects  
**API Endpoint:** `GET /api/v2/cmdb/firewall/address`  
**Parameters:**
- `vdom` (optional) - Virtual domain
- `name` (optional) - Filter by name (regex)
- `type` (optional) - Filter by type (ipmask, iprange, fqdn, geography, etc.)

**Returns:** Array of address objects

---

#### `list_address_groups`
**Description:** List all address groups  
**API Endpoint:** `GET /api/v2/cmdb/firewall/addrgrp`  
**Parameters:**
- `vdom` (optional) - Virtual domain
- `name` (optional) - Filter by group name

**Returns:** Array of address groups with member lists

---

### 3. VIP Tools

#### `list_vips`
**Description:** List all Virtual IP objects (NAT/port forwarding)  
**API Endpoint:** `GET /api/v2/cmdb/firewall/vip`  
**Parameters:**
- `vdom` (optional) - Virtual domain
- `name` (optional) - Filter by VIP name

**Returns:** Array of VIP objects with mappings

---

### 4. System Monitoring Tools

#### `get_system_status`
**Description:** Get system resource usage and status  
**API Endpoint:** `GET /api/v2/monitor/system/resource`  
**Parameters:**
- `interval` (optional) - Time interval (1min, 5min, 30min, 1hour)

**Returns:**
- `cpu` - CPU usage percentage
- `mem` - Memory usage percentage
- `disk` - Disk usage percentage
- `session_count` - Active session count
- `setup_rate` - New session setup rate

---

#### `get_interface_status`
**Description:** Get interface statistics and status  
**API Endpoint:** `GET /api/v2/monitor/system/interface`  
**Parameters:**
- `interface_name` (optional) - Filter by specific interface

**Returns:** Array of interface stats (rx/tx bytes, errors, link status)

---

#### `get_ha_status`
**Description:** Get HA cluster status  
**API Endpoint:** `GET /api/v2/monitor/system/ha-peer`  
**Parameters:** None

**Returns:** HA cluster status, member roles, sync status

---

### 5. Session Tools

#### `list_active_sessions`
**Description:** Query active firewall sessions  
**API Endpoint:** `GET /api/v2/monitor/firewall/session`  
**Parameters:**
- `ip_version` (optional) - IPv4 or IPv6
- `src` (optional) - Source IP filter
- `dest` (optional) - Destination IP filter
- `protocol` (optional) - Protocol filter (tcp, udp, icmp)
- `limit` (optional) - Max results (default 100)

**Returns:** Array of active sessions with:
- Source/destination IPs and ports
- Protocol
- NAT info
- Policy ID
- Duration, bytes transferred

---

### 6. Routing Tools

#### `get_routing_table`
**Description:** Display IPv4 routing table  
**API Endpoint:** `GET /api/v2/monitor/router/ipv4`  
**Parameters:**
- `vdom` (optional) - Virtual domain
- `gateway` (optional) - Filter by gateway IP

**Returns:** Array of routes with prefix, gateway, interface, distance

---

#### `list_static_routes`
**Description:** List configured static routes  
**API Endpoint:** `GET /api/v2/cmdb/router/static`  
**Parameters:**
- `vdom` (optional) - Virtual domain

**Returns:** Array of static route configurations

---

### 7. VPN Tools

#### `get_ipsec_status`
**Description:** Get IPsec VPN tunnel status  
**API Endpoint:** `GET /api/v2/monitor/vpn/ipsec`  
**Parameters:**
- `vdom` (optional) - Virtual domain

**Returns:** Array of IPsec tunnels with status, phase1/phase2 info

---

#### `get_sslvpn_status`
**Description:** Get SSL VPN status and active users  
**API Endpoint:** `GET /api/v2/monitor/vpn/ssl`  
**Parameters:**
- `vdom` (optional) - Virtual domain

**Returns:** SSL VPN status, connected users, login history

---

## Phase 2: Write Operations

**All write operations require `--enable-write` flag and are wrapped in audit logging.**

### 1. Firewall Policy Write Tools

#### `create_firewall_policy`
**API Endpoint:** `POST /api/v2/cmdb/firewall/policy`  
**Parameters:**
- `name` - Policy name
- `srcintf` - Source interface(s)
- `dstintf` - Destination interface(s)
- `srcaddr` - Source address object(s)
- `dstaddr` - Destination address object(s)
- `service` - Service object(s)
- `action` - accept/deny/ipsec
- `nat` (optional) - NAT enable
- `schedule` (optional) - Schedule object
- `comments` (optional)
- `vdom` (optional)

**Returns:** Created policy object with assigned `policyid`

---

#### `update_firewall_policy`
**API Endpoint:** `PUT /api/v2/cmdb/firewall/policy/{id}`  
**Parameters:**
- `policyid` - Policy ID to update
- Same optional params as create

**Returns:** Updated policy object

---

#### `delete_firewall_policy`
**API Endpoint:** `DELETE /api/v2/cmdb/firewall/policy/{id}`  
**Parameters:**
- `policyid` - Policy ID to delete

**Returns:** Success confirmation

---

### 2. Address Object Write Tools

#### `create_address_object`
**API Endpoint:** `POST /api/v2/cmdb/firewall/address`  
**Parameters:**
- `name` - Address object name
- `type` - ipmask/iprange/fqdn/geography
- Type-specific fields:
  - `subnet` - For ipmask type (CIDR notation)
  - `start_ip`, `end_ip` - For iprange
  - `fqdn` - For FQDN type
  - `country` - For geography type
- `comment` (optional)
- `vdom` (optional)

**Returns:** Created address object

---

#### `update_address_object`
**API Endpoint:** `PUT /api/v2/cmdb/firewall/address/{name}`  
**Parameters:**
- `name` - Address object name to update
- Optional fields to update

**Returns:** Updated address object

---

#### `delete_address_object`
**API Endpoint:** `DELETE /api/v2/cmdb/firewall/address/{name}`  
**Parameters:**
- `name` - Address object name to delete

**Returns:** Success confirmation

---

### 3. VIP Write Tools

#### `create_vip`
**API Endpoint:** `POST /api/v2/cmdb/firewall/vip`  
**Parameters:**
- `name` - VIP name
- `extip` - External IP
- `extintf` - External interface
- `mappedip` - Internal mapped IP
- `portforward` (optional) - Enable port forwarding
- `extport` (optional) - External port
- `mappedport` (optional) - Mapped internal port
- `protocol` (optional) - tcp/udp
- `comment` (optional)
- `vdom` (optional)

**Returns:** Created VIP object

---

#### `delete_vip`
**API Endpoint:** `DELETE /api/v2/cmdb/firewall/vip/{name}`  
**Parameters:**
- `name` - VIP name to delete

**Returns:** Success confirmation

---

### 4. Static Route Write Tools

#### `create_static_route`
**API Endpoint:** `POST /api/v2/cmdb/router/static`  
**Parameters:**
- `dst` - Destination CIDR
- `gateway` - Gateway IP
- `device` - Outgoing interface
- `distance` (optional) - Administrative distance (default 10)
- `priority` (optional) - Route priority
- `comment` (optional)
- `vdom` (optional)

**Returns:** Created route object with assigned ID

---

#### `delete_static_route`
**API Endpoint:** `DELETE /api/v2/cmdb/router/static/{id}`  
**Parameters:**
- `seq_num` - Route sequence number

**Returns:** Success confirmation

---

## FortiClient API Client

### Class: `FortiClient`

```typescript
class FortiClient {
  constructor(config: {
    host: string;         // https://192.168.1.1
    apiKey: string;       // API token
    vdom?: string;        // default VDOM (root)
    verifySsl?: boolean;  // TLS cert verification
  });

  // Generic GET with pagination support
  async getAll<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T[]>;

  // Single object GET
  async get<T>(
    path: string,
    id?: string,
    params?: Record<string, string>
  ): Promise<T>;

  // POST (create)
  async post<T>(
    path: string,
    body: Record<string, unknown>
  ): Promise<T>;

  // PUT (update)
  async put<T>(
    path: string,
    id: string,
    body: Record<string, unknown>
  ): Promise<T>;

  // DELETE
  async delete(
    path: string,
    id: string
  ): Promise<{ success: boolean }>;
}
```

---

## Configuration Schema

### Environment Variables

```bash
FORTIGATE_HOST=https://192.168.1.1
FORTIGATE_API_KEY=your_api_key
FORTIGATE_VDOM=root
FORTIGATE_VERIFY_SSL=true
FORTIGATE_ENABLE_WRITE=false
```

### Config Object

```typescript
interface Config {
  host: string;
  apiKey: string;
  vdom: string;
  verifySsl: boolean;
  enableWrite: boolean;
}
```

---

## Error Handling

### FortiOS API Error Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (object doesn't exist)
- `405` - Method Not Allowed
- `424` - Failed Dependency (e.g., object in use)
- `500` - Internal Server Error

### Client Error Mapping

```typescript
class FortiGateError extends Error {
  constructor(
    public statusCode: number,
    public method: string,
    public path: string,
    public message: string
  ) {}
}
```

---

## Testing Strategy

### Unit Tests

- FortiClient CRUD operations (mocked HTTP)
- Tool parameter validation (Zod schemas)
- Config parsing and env variable handling

### Integration Tests

- Requires test FortiGate environment
- Read-only operations safe to test
- Write operations use isolated test VDOM

### Test Coverage Goals

- Line coverage: >80%
- Branch coverage: >70%
- All error paths tested

---

## Code-Mode Implementation

### Single Tool: `execute_fortigate_api`

**Parameters:**
- `instruction` - Natural language description
- `method` - GET/POST/PUT/DELETE
- `path` - API endpoint path
- `body` (optional) - JSON request body
- `params` (optional) - Query parameters

**Context Provided:**
- Full FortiOS API schema (JSON)
- Example API calls for common operations
- Available endpoints and parameters

**Executor Logic:**
1. Validate method and path against schema
2. Check if operation requires write flag
3. Execute API call via FortiClient
4. Format response for LLM consumption

---

## Security Considerations

1. **API Key Storage:** Never log API keys, support env vars and secure vaults
2. **Write Protection:** All destructive operations gated by flag
3. **Audit Trail:** Log all write operations with timestamps
4. **TLS Verification:** Enforce by default (allow disable for lab environments)
5. **Rate Limiting:** Respect FortiGate API limits (configurable)
6. **Session Management:** Single client instance per server (connection pooling)

---

## Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.27.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.5.0",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3",
    "vitest": "^4.1.0"
  }
}
```

---

## Deployment Scenarios

### Local Development
```bash
npm run start:traditional -- --fortigate-host https://192.168.1.1 --api-key KEY
```

### MCP Client Integration
Add to MCP settings:
```json
{
  "mcpServers": {
    "fortinet": {
      "command": "node",
      "args": ["~/clawd/projects/fortinet-mcp-server/dist/traditional/index.js"],
      "env": {
        "FORTIGATE_HOST": "https://192.168.1.1",
        "FORTIGATE_API_KEY": "YOUR_API_KEY",
        "FORTIGATE_ENABLE_WRITE": "true"
      }
    }
  }
}
```

### Claude Code Mode
```bash
npm run start:code-mode
```

---

## Roadmap

### Phase 1 (Current)
- ✅ Read-only operations
- ✅ System monitoring
- ✅ Basic firewall policy queries

### Phase 2 (Next)
- 🚧 Write operations (policy/address/VIP management)
- 🚧 Static route management
- 🚧 Comprehensive test coverage

### Phase 3 (Future)
- FortiManager integration
- FortiAnalyzer log queries
- SD-WAN configuration
- Advanced VPN management
- Bulk operations support

---

**Last Updated:** 2026-03-31  
**Status:** Phase 1 - Scaffold Complete
