# ClawdPay MCP

Payments for AI Agents - An MCP server that enables Claude to make purchases using Privacy.com virtual cards.

[![npm version](https://badge.fury.io/js/clawdpay-mcp.svg)](https://www.npmjs.com/package/clawdpay-mcp)

## Quick Start

```bash
npx clawdpay-mcp
```

Or install globally:
```bash
npm install -g clawdpay-mcp
```

## Manual Setup

```bash
git clone https://github.com/Rishab87/clawdpay-mcp.git
cd clawdpay-mcp
npm install
npx playwright install chromium
npm run build
```

## Configuration

Create `.env` file:
```
PRIVACY_API_KEY=your_key
PRIVACY_SANDBOX=true
HEADLESS=true
```

## Claude Desktop Setup

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clawdpay": {
      "command": "npx",
      "args": ["clawdpay-mcp"],
      "env": {
        "PRIVACY_API_KEY": "your_key",
        "PRIVACY_SANDBOX": "true"
      }
    }
  }
}
```

## Tools

- `create_virtual_card`: Create a single-use virtual card via Privacy.com
- `secure_auto_fill`: Intelligently finds and fills payment fields on the current page
- `get_funding_sources`: List available funding accounts

## License

MIT
