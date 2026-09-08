<p align="center">
  <img src="nodes/Ironfang/ironfang.svg" width="110" alt="Ironfang">
</p>

# @ironfang/n8n-nodes-ironfang

Community node for using [Ironfang](https://ironfang.uk) APIs in n8n
workflows. Pick a product under Resource, then an operation within it.

Renderwolf is the first product. It turns URLs, HTML and stored templates
into screenshots, PDFs, social images and short video clips, hosted on
infrastructure Ironfang operates in the UK.

## Install

On self-hosted n8n, open Settings, then Community Nodes, choose Install and enter
`@ironfang/n8n-nodes-ironfang`.

n8n Cloud installation requires the package to be verified by n8n. npm publishing
and automated scanning do not establish manual verification status.

You'll need an API key from [portal.ironfang.uk](https://portal.ironfang.uk).
Use a new `if_live_` platform key; existing `rw_live_` Renderwolf keys still
work. Paste it into an Ironfang API credential. The connection test distinguishes
invalid keys from valid keys lacking usage-read permission.

Renderwolf's free plan gives **250 credits per month**, with no card required.
Screenshots and template images cost 1 credit, PDFs 2, and QR codes 0. Clip costs
vary with duration and output size. Cache hits cost 0. This is a Renderwolf
allowance; other Ironfang products have their own usage policies. Free output carries a small Renderwolf
badge in the corner, which any paid plan removes.

## Renderwolf operations

Screenshot captures a URL or raw HTML as a PNG, JPEG or WebP. It supports
viewport sizing, full-page capture, capturing a single element by CSS
selector, dark mode and a settle delay for late-painting pages. The Device
option applies a phone or tablet viewport, pixel density, mobile flag and
user agent together, so a mobile capture is a mobile capture rather than a
narrow desktop one.

PDF prints a URL or raw HTML. Landscape, printed backgrounds, header and
footer templates and page scale are all options.

Template Image renders a stored template with your variables, built for OG
images and social cards.

Video Clip renders a short MP4: a background image, video or solid colour,
caption cards that appear and disappear on a schedule, and optionally your
own watermark and an audio bed. Clips run up to sixty seconds, and cost
scales with length and canvas size - vertical for Reels and Shorts, square,
landscape, or 720p when the pixels matter less than the price.

All four of the above put the rendered file on the item as binary data,
ready for the next node in the workflow.

Signed URL mints a stable render URL you can drop straight into an `<img>`
tag or `og:image` meta tag, and Usage reports the current period's
consumption against your plan cap. Both return JSON.

Identical requests are served from cache and don't count against your plan.
Renders are capped at 120 a minute per account, and 60 a minute per site
being rendered, counted across everyone. Bot protection is never bypassed:
a challenge page is captured as a challenge page.

## Links

- [API reference](https://ironfang.uk/renderwolf/docs)
- [OpenAPI spec](https://api.ironfang.uk/openapi.yaml)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT

## Permissions and outputs

| Operations | Key scope |
| --- | --- |
| Screenshot, PDF, Template Image, Video Clip | `renderwolf:render` |
| Signed URL | `renderwolf:sign` |
| Usage | `renderwolf:usage:read` |

Choose only the scopes the workflow uses. Authentication succeeding does not
grant permissions for other operations. Requests stay in the key's organisation.

New nodes use version 1.1: binary outputs include numeric `bytes` and
`byteLength`; `_ironfang` includes `requestId`, `creditsCharged`, `cacheStatus`
when supplied, and HTTP `statusCode`. Continue On Fail returns a structured
`error` with the item index and available problem/retry details. Existing
version 1 nodes retain string `bytes` and `error` fields; exact byte length and
structured metadata are additive. The binary field defaults to `data`.

Requests have a 30-second JSON or 120-second rendering timeout. No automatic
retry repeats a render. For 429 responses, use the returned retry information
or n8n's wait/retry settings deliberately. The node preserves item linking.

## Examples and development

Import [Template image](examples/template-image.json), select your credential
and replace the template ID with an existing template from the portal. The
rendered file is available as binary `data` for a storage or messaging node.

Run `npm ci --ignore-scripts` and `npm run check`. Checks include n8n's actual
lint rules, TypeScript, execution regressions and package metadata/icons.
The development dependency baseline is `n8n-workflow` 2.39.0; runtime helpers
come from the host n8n installation. No external runtime dependency is bundled.

Run `bash scripts/check-runtime.sh` with Docker to import credentials and execute
seven operations in n8n 2.38.1 against a local fixture API. This checks authenticated
requests, legacy/new outputs and exact files in n8n's filesystem binary storage.
CI runs the same runtime check before publishing. No paid API calls are made.
