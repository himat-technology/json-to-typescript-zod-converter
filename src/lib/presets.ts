import type { Preset } from "@/types/converter";

export const DEFAULT_JSON = `{
  "id": "usr_99812",
  "username": "alex_dev",
  "email": "alex@example.com",
  "isActive": true,
  "age": 29,
  "roles": [
    "admin",
    "developer"
  ],
  "profile": {
    "firstName": "Alex",
    "lastName": "Rivers",
    "avatarUrl": "https://example.com/avatar.png",
    "bio": null,
    "socials": {
      "github": "alexrivers",
      "twitter": "@alex_rivers"
    }
  },
  "metadata": {
    "lastLogin": "2026-09-25T08:30:00Z",
    "loginCount": 142
  }
}`;

export const PRESETS: Preset[] = [
  {
    id: "user-profile",
    label: "User Profile",
    description: "Account, roles, nested profile & metadata",
    rootName: "UserProfile",
    json: DEFAULT_JSON,
  },
  {
    id: "ecommerce-order",
    label: "E-Commerce Order",
    description: "Order, line items, shipping & payment",
    rootName: "OrderResponse",
    json: `{
  "orderId": "ord_78421",
  "status": "processing",
  "createdAt": "2026-09-24T14:22:10Z",
  "customer": {
    "id": "cus_112",
    "email": "jamie@example.com",
    "name": "Jamie Chen"
  },
  "items": [
    {
      "sku": "MBP-14-M3",
      "name": "MacBook Pro 14",
      "quantity": 1,
      "unitPrice": 1999.0,
      "currency": "USD"
    },
    {
      "sku": "USB-C-HUB",
      "name": "USB-C Hub",
      "quantity": 2,
      "unitPrice": 49.5,
      "currency": "USD"
    }
  ],
  "shipping": {
    "method": "express",
    "address": {
      "line1": "120 Market St",
      "city": "San Francisco",
      "state": "CA",
      "postalCode": "94105",
      "country": "US"
    },
    "trackingNumber": null
  },
  "payment": {
    "method": "card",
    "last4": "4242",
    "captured": true,
    "amount": 2098.0
  },
  "totals": {
    "subtotal": 2098.0,
    "tax": 188.82,
    "shipping": 0,
    "grandTotal": 2286.82
  }
}`,
  },
  {
    id: "ai-agent",
    label: "AI Agent Payload",
    description: "Agent run, tools, messages & usage",
    rootName: "AgentPayload",
    json: `{
  "runId": "run_9f3a2c",
  "agent": {
    "id": "agent_research",
    "name": "Research Assistant",
    "version": "2.1.0"
  },
  "input": {
    "goal": "Summarize recent TypeScript release notes",
    "contextUrls": [
      "https://devblogs.microsoft.com/typescript/",
      "https://www.typescriptlang.org/docs/"
    ],
    "constraints": {
      "maxTokens": 4096,
      "temperature": 0.2,
      "allowWebSearch": true
    }
  },
  "messages": [
    {
      "role": "system",
      "content": "You are a precise technical researcher."
    },
    {
      "role": "user",
      "content": "What changed in the latest TypeScript release?"
    }
  ],
  "toolCalls": [
    {
      "id": "call_1",
      "name": "web_search",
      "arguments": {
        "query": "TypeScript 5.9 release notes",
        "limit": 5
      },
      "status": "completed"
    }
  ],
  "output": {
    "summary": "Key updates include improved inference and tooling fixes.",
    "citations": [
      {
        "title": "TypeScript Release Notes",
        "url": "https://www.typescriptlang.org/docs/"
      }
    ],
    "confidence": 0.86
  },
  "usage": {
    "promptTokens": 1240,
    "completionTokens": 680,
    "totalTokens": 1920
  },
  "status": "succeeded",
  "error": null
}`,
  },
];
