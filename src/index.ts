
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { PrivacyClient } from "./privacy.js";
import { BrowserAgent } from "./browser.js";
import dotenv from 'dotenv';

dotenv.config();

const server = new Server(
    { name: "clawdpay", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

const privacy = new PrivacyClient();
const browser = new BrowserAgent();

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "create_virtual_card",
            description: "Create a single-use virtual card via Privacy.com. Returns secure card details.",
            inputSchema: {
                type: "object",
                properties: {
                    merchant: { type: "string" },
                    amount_cents: { type: "number" }
                },
                required: ["merchant", "amount_cents"]
            }
        },
        {
            name: "secure_auto_fill",
            description: "Intelligently finds and fills payment fields on the current page using robust heuristics.",
            inputSchema: {
                type: "object",
                properties: {
                    url: { type: "string" },
                    pan: { type: "string" },
                    cvv: { type: "string" },
                    exp_month: { type: "string" },
                    exp_year: { type: "string" }
                },
                required: ["url", "pan", "cvv", "exp_month", "exp_year"]
            }
        },
        {
            name: "get_funding_sources",
            description: "List available funding accounts connected to Privacy.com",
            inputSchema: { type: "object", properties: {} }
        }
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const args = request.params.arguments as any;

    switch (request.params.name) {
        case "create_virtual_card": {
            const card = await privacy.createCard(args.merchant, args.amount_cents);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(card, null, 2)
                }]
            };
        }

        case "secure_auto_fill": {
            await browser.navigate(args.url);

            const result = await browser.smartFillPayment({
                pan: args.pan,
                cvv: args.cvv,
                expMonth: args.exp_month,
                expYear: args.exp_year
            });
            return {
                content: [{ type: "text", text: `Auto-fill Report: ${result}` }]
            };
        }

        case "get_funding_sources": {
            const sources = await privacy.getFundingSources();
            return {
                content: [{ type: "text", text: JSON.stringify(sources, null, 2) }]
            };
        }

        default:
            throw new Error("Unknown tool");
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("ClawdPay MCP running");
}

main().catch(console.error);
