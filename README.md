<p align="center">
  <img src="nodes/Renderwolf/renderwolf.svg" width="110" alt="Renderwolf">
</p>

# @ironfang/n8n-nodes-renderwolf

Community node for using [Renderwolf](https://ironfang.uk/renderwolf) in n8n
workflows. Renderwolf turns URLs, HTML and stored templates into screenshots,
PDFs and social images, hosted on infrastructure
[Ironfang](https://ironfang.uk) operates in the UK.

## Install

In n8n, open Settings, then Community Nodes, choose Install and enter
`@ironfang/n8n-nodes-renderwolf`.

You'll need an API key from [portal.ironfang.uk](https://portal.ironfang.uk).
The free plan gives 100 renders a month and doesn't ask for a card. Paste the
key into a new Renderwolf API credential; the credential test calls
`/v1/usage`, so a bad key fails fast.

## Operations

Screenshot captures a URL or raw HTML as a PNG or JPEG. It supports viewport
sizing, full-page capture, capturing a single element by CSS selector, dark
mode and a settle delay for late-painting pages.

PDF prints a URL or raw HTML. Landscape, printed backgrounds, header and
footer templates and page scale are all options.

Template Image renders a stored template with your variables, built for OG
images and social cards.

All three of the above put the rendered file on the item as binary data,
ready for the next node in the workflow.

Signed URL mints a stable render URL you can drop straight into an `<img>`
tag or `og:image` meta tag, and Usage reports the current period's
consumption against your plan cap. Both return JSON.

## Links

- [API reference](https://ironfang.uk/renderwolf/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
