// Cloudflare Pages Function: /mcp → the Task Booth operator on Horizon.
import { makeMcpProxy } from "@tollbooth-dpyc/web/pages-proxy";

export const onRequest = makeMcpProxy("https://taskbooth-mcp.fastmcp.app/mcp");
