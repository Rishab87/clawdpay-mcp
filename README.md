# ClawdPay

## Payments for AI Agents

An MCP server that enables Claude to make purchases using Privacy.com virtual cards.

### Architecture

- Playwright and Chrome for browser automation
- Privacy.com API for virtual debit cards (Strict Implementation)
- MCP tools for payment flow

### Setup

```bash
git clone https://github.com/Rishab87/clawdpay.git
cd clawdpay
npm install
npx playwright install chromium
npm run build
```

### Configuration

Create `.env` file:
```
PRIVACY_API_KEY=your_key
PRIVACY_SANDBOX=true
HEADLESS=true
```

### Usage with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "clawdpay": {
      "command": "node",
      "args": ["/absolute/path/to/clawdpay/dist/index.js"],
      "env": {
        "PRIVACY_API_KEY": "your_key",
        "PRIVACY_SANDBOX": "true"
      }
    }
  }
}
```

### Tools

- `create_virtual_card`: Create a single-use virtual card via Privacy.com
- `secure_auto_fill`: Intelligently finds and fills payment fields on the current page using heuristics
- `get_funding_sources`: List available funding accounts

### License

MIT
