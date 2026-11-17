# CommissionMarket

Commissioned work, paid in sats, under one set of plain terms.

A client posts a commission: the brief, the grades and what each earns, a deposit, dated milestones, and a cover page under the Standard Terms.
Both parties sign one offer.
A professional from the client's chosen circle claims it, delivers, and is graded.
Every payment goes from the client's own Lightning wallet straight to the professional's.

CommissionMarket is a web page over the [Task Booth](https://github.com/lonniev/taskbooth-mcp) Operator, a Tollbooth DPYC™ service.
Task Booth keeps the commissions and never holds the sats.
Everyone signs in with their own Nostr npub.

## Run locally

```
cd frontend
npm ci
npm run dev
```

The page talks to Task Booth through `/mcp`, which `vite` proxies in development and `functions/mcp.js` proxies on Cloudflare Pages.

## License

Apache-2.0. Patent Pending (US Prov. 64/045,999).
