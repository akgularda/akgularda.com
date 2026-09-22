# auth.md — arda-akgul.com

Site: https://arda-akgul.com
Author: Arda Akgül

## Agent registration

Agent registration is open and automatic. No register_uri call, API key, or invitation is required to read this site.

```yaml
agent_auth:
  skill: https://arda-akgul.com/.well-known/agent-skills/arda-site/SKILL.md
  register_uri: "https://arda-akgul.com/auth.md"
  registration_method: anonymous
  identity_types_supported: [anonymous]
  anonymous:
    credential_types_supported: []
    claim_uri: "https://arda-akgul.com/auth.md"
  revocation_uri: "https://arda-akgul.com/auth.md"
  authorization_servers: ["https://arda-akgul.com"]
```

- identity_types: none (anonymous access)
- credential_types: none (no credentials issued)
- Supported grant types: none (no token endpoint exists)
- All content is public, read-only, and safe to fetch with plain GET.

## Endpoints

- Short index: https://arda-akgul.com/llms.txt
- Full corpus: https://arda-akgul.com/llms-full.txt
- OpenAPI descriptor: https://arda-akgul.com/openapi.yaml
- API catalog: https://arda-akgul.com/.well-known/api-catalog
- ARD manifest: https://arda-akgul.com/.well-known/ard.json
- Protected resource metadata: https://arda-akgul.com/.well-known/oauth-protected-resource
- Authorization server metadata: https://arda-akgul.com/.well-known/oauth-authorization-server
- MCP server card: https://arda-akgul.com/.well-known/mcp/server-card.json
- Contact: mailto:ardakgul4@gmail.com

## Crawl policy

Respect robots.txt (AI crawlers are explicitly welcomed; Content-Signal: ai-train=yes, search=yes, ai-input=yes) and the privacy, cookie, and terms pages when quoting policy content.
