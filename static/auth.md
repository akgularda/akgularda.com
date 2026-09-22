# Auth.md — arda-akgul.com

Site: https://arda-akgul.com
Author: Arda Akgül

## Agent registration

Agent registration is open and automatic. No register_uri call, API key, or invitation is required to read this site.

```yaml
agent_auth:
  registration: open
  register_uri: "https://arda-akgul.com/auth.md"
  identity_types: [none]
  credential_types: [none]
  authorization_servers: []
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
- Contact: mailto:ardakgul4@gmail.com

## Crawl policy

Respect robots.txt (AI crawlers are explicitly welcomed; Content-Signal: ai-train=yes, search=yes, ai-input=yes) and the privacy, cookie, and terms pages when quoting policy content.
