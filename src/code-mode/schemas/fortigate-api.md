# FortiGate REST API Reference

## Authentication
Use Bearer token authentication:
```
Authorization: Bearer <API_KEY>
```

## Base URL
```
https://<fortigate-host>/api/v2
```

## Query Parameters
- `vdom=<name>` — Virtual domain (default: root)
- `access_token=<token>` — Alternative to Bearer header

## Response Format
All responses wrapped in:
```json
{
  "results": [...],
  "vdom": "root",
  "path": "firewall",
  "name": "policy",
  "http_method": "GET",
  "status": "success",
  "serial": "...",
  "version": "...",
  "build": "..."
}
```

## Common Endpoints

### Firewall Policies
- `GET /cmdb/firewall/policy` — List all policies
- `GET /cmdb/firewall/policy/{policyid}` — Get specific policy
- `POST /cmdb/firewall/policy` — Create policy
- `PUT /cmdb/firewall/policy/{policyid}` — Update policy
- `DELETE /cmdb/firewall/policy/{policyid}` — Delete policy

**Policy Fields:**
- `policyid` (number) — Auto-assigned
- `name` (string) — Policy name
- `srcintf` (array) — Source interfaces: `[{ "name": "port1" }]`
- `dstintf` (array) — Destination interfaces
- `srcaddr` (array) — Source addresses: `[{ "name": "all" }]`
- `dstaddr` (array) — Destination addresses
- `service` (array) — Services: `[{ "name": "ALL" }]`
- `action` (string) — `accept`, `deny`, `ipsec`
- `schedule` (string) — Schedule name (default: `always`)
- `status` (string) — `enable`, `disable`
- `nat` (string) — `enable`, `disable`
- `logtraffic` (string) — `all`, `utm`, `disable`
- `comments` (string) — Policy description

### Address Objects
- `GET /cmdb/firewall/address` — List addresses
- `GET /cmdb/firewall/address/{name}` — Get specific address
- `POST /cmdb/firewall/address` — Create address
- `PUT /cmdb/firewall/address/{name}` — Update address
- `DELETE /cmdb/firewall/address/{name}` — Delete address

**Address Types:**
- `ipmask` — IP/netmask: `{ "subnet": "192.168.1.0/24" }`
- `iprange` — IP range: `{ "start-ip": "10.0.0.1", "end-ip": "10.0.0.100" }`
- `fqdn` — Fully qualified domain name: `{ "fqdn": "example.com" }`
- `geography` — Country: `{ "country": "US" }`
- `wildcard` — Wildcard address
- `interface-subnet` — Interface subnet

### Service Objects
- `GET /cmdb/firewall.service/custom` — List custom services
- `POST /cmdb/firewall.service/custom` — Create service
- `PUT /cmdb/firewall.service/custom/{name}` — Update service
- `DELETE /cmdb/firewall.service/custom/{name}` — Delete service

**Service Fields:**
- `name` (string)
- `protocol` (string) — `TCP/UDP/SCTP`, `ICMP`, `ICMP6`, `IP`, `HTTP`, `FTP`
- `tcp-portrange` (string) — e.g., `80`, `1-65535`, `80:88`
- `udp-portrange` (string)
- `comment` (string)

### Network Interfaces
- `GET /cmdb/system/interface` — List interfaces
- `GET /cmdb/system/interface/{name}` — Get interface

**Interface Fields:**
- `name` (string)
- `vdom` (string)
- `ip` (string) — IP and netmask (e.g., `192.168.1.1/24`)
- `type` (string) — `physical`, `vlan`, `aggregate`, `loopback`, `tunnel`
- `status` (string) — `up`, `down`
- `description` (string)

### Static Routes
- `GET /cmdb/router/static` — List static routes
- `POST /cmdb/router/static` — Create route
- `PUT /cmdb/router/static/{seq-num}` — Update route
- `DELETE /cmdb/router/static/{seq-num}` — Delete route

**Route Fields:**
- `seq-num` (number) — Auto-assigned sequence
- `dst` (string) — Destination (e.g., `0.0.0.0/0`)
- `gateway` (string) — Gateway IP
- `device` (string) — Interface name
- `distance` (number) — Administrative distance (default: 10)
- `priority` (number) — Priority (default: 0)
- `comment` (string)

### System Status
- `GET /monitor/system/status` — Get system status

**Status Fields:**
- `version` (string)
- `serial` (string)
- `hostname` (string)
- `operation_mode` (string) — `nat`, `transparent`
- `current_time` (string)
- `uptime` (number)

## Error Responses
```json
{
  "http_status": 404,
  "error": "Not Found",
  "message": "Object not found",
  "path": "firewall",
  "name": "policy"
}
```

## Common Status Codes
- `200 OK` — Success
- `201 Created` — Resource created
- `204 No Content` — Success with no body
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Invalid credentials
- `403 Forbidden` — Insufficient permissions
- `404 Not Found` — Resource not found
- `500 Internal Server Error` — Server error
