# fortinet-mcp-server

MCP (Model Context Protocol) server for Fortinet FortiOS/FortiGate firewalls — comprehensive firewall management via AI agents.

## Features

### Phase 1: Read-Only Operations (Traditional + Code-Mode)
- **Firewall Policies:** List, search, and inspect security policies
- **Address Objects:** Browse address groups, objects, and VIP configurations
- **System Status:** Monitor CPU, memory, interfaces, HA status
- **Session Management:** Query active sessions, NAT sessions
- **Routing:** View routing tables, static routes, policy routes
- **VPN:** Inspect IPsec, SSL VPN status and configurations

### Phase 2: Write Operations (--enable-write flag)
- **Policy Management:** Create, update, delete firewall policies
- **Address Objects:** Create/update/delete address objects and groups
- **VIP Configuration:** Create/update/delete virtual IPs for NAT
- **Route Management:** Add/update/delete static routes
- **VPN Management:** Configure IPsec tunnels, SSL VPN settings

## Dual MCP Modes

### Traditional Mode
Standard MCP tools with discrete parameters for each operation.

**Start:**
```bash
npm run start:traditional -- \
  --fortigate-host https://192.168.1.1 \
  --api-key YOUR_API_KEY \
  --enable-write
```

### Code-Mode (MCP Agent Mode)
Single `execute_fortigate_api` tool accepting natural language instructions and FortiOS API JSON schema.

**Start:**
```bash
npm run start:code-mode -- \
  --fortigate-host https://192.168.1.1 \
  --api-key YOUR_API_KEY \
  --enable-write
```

## Installation

```bash
npm install
npm run build
```

## Configuration

Set environment variables or pass as CLI args:

```bash
export FORTIGATE_HOST=https://192.168.1.1
export FORTIGATE_API_KEY=your_api_key_here
export FORTIGATE_ENABLE_WRITE=true  # Optional: enable write operations
```

## API Coverage

Based on FortiOS REST API v7.0+:

- `/api/v2/cmdb/firewall/policy` - Security policies
- `/api/v2/cmdb/firewall/address` - Address objects
- `/api/v2/cmdb/firewall/addrgrp` - Address groups
- `/api/v2/cmdb/firewall/vip` - Virtual IP objects
- `/api/v2/monitor/system/resource` - System resource usage
- `/api/v2/monitor/firewall/session` - Active sessions
- `/api/v2/monitor/router/ipv4` - Routing table
- `/api/v2/monitor/vpn/ipsec` - IPsec VPN status
- `/api/v2/monitor/vpn/ssl` - SSL VPN status

## Security

- **API Key Authentication:** Uses FortiOS API tokens (never username/password)
- **Write Protection:** All write operations gated behind `--enable-write` flag
- **TLS Verification:** Strict certificate validation (configurable for lab environments)
- **Audit Logging:** All write operations logged with timestamps and user context

## Development

```bash
# Build
npm run build

# Run tests
npm test

# Traditional mode (dev)
npm run start:traditional

# Code-mode (dev)
npm run start:code-mode
```

## Project Structure

```
fortinet-mcp-server/
├── README.md
├── SPEC.md                    # Detailed technical specification
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── src/
│   ├── client.ts              # FortiOS REST API client
│   ├── config.ts              # Configuration management
│   ├── traditional/
│   │   ├── index.ts           # Traditional MCP server entry
│   │   └── tools/
│   │       ├── firewall.ts    # Firewall policy tools
│   │       ├── address.ts     # Address object tools
│   │       ├── vip.ts         # VIP tools
│   │       ├── routing.ts     # Routing tools
│   │       ├── vpn.ts         # VPN tools
│   │       └── system.ts      # System monitoring tools
│   └── code-mode/
│       ├── index.ts           # Code-mode MCP server entry
│       ├── executor.ts        # API executor with validation
│       └── schemas/
│           └── fortios-api-schema.json
├── tests/
│   ├── client.test.ts
│   ├── firewall-tools.test.ts
│   ├── address-tools.test.ts
│   ├── vip-tools.test.ts
│   ├── routing-tools.test.ts
│   ├── vpn-tools.test.ts
│   └── system-tools.test.ts
└── docs/
    ├── api-reference.md
    └── examples.md
```

## License

ISC

## Related Projects

- [infoblox-mcp-server](https://github.com/cheenu1092-oss/infoblox-mcp-server) - Infoblox NIOS DDI management
- Net-Infra-MCP - Multi-vendor network infrastructure MCP toolkit

---

**Status:** 🚧 In Development  
**Maintainer:** Cheenu (cheenu1092@gmail.com)  
**Part of:** Net-Infra-MCP Project
