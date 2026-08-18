<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="nodes/Renderwolf/renderwolf.dark.svg">
    <img src="nodes/Renderwolf/renderwolf.svg" width="110" alt="Renderwolf">
  </picture>
</p>

# @ironfang/n8n-nodes-renderwolf

n8n community node for [Renderwolf](https://ironfang.uk/renderwolf) - one rendering
API for screenshots, PDFs and templated social images, hosted on infrastructure
[Ironfang](https://ironfang.uk) operates in the UK.

## Installation

In n8n, go to **Settings → Community Nodes → Install** and enter:

```
@ironfang/n8n-nodes-renderwolf
```

Then add your `rw_live_` API key (from [portal.ironfang.uk](https://portal.ironfang.uk))
as a **Renderwolf API** credential. The free tier needs no card.

## Operations

- **Screenshot** - capture a URL or raw HTML (viewport, full page, or a CSS
  selector; PNG or JPEG; dark mode; settle delay). Returns binary data.
- **PDF** - print a URL or raw HTML to PDF (landscape, backgrounds, header and
  footer templates, scale). Returns binary data.
- **Template Image** - render a stored template with variables, built for OG
  images and social cards. Returns binary data.
- **Signed URL** - mint a stable render URL you can drop straight into an
  `<img>` tag or `og:image` meta tag. Returns JSON.
- **Usage** - your current period consumption against the plan cap. Returns JSON.

## Credentials

Create an API key at [ironfang.uk/dashboard](https://ironfang.uk/dashboard)
(free plan: 100 renders/month, no card required) and paste it into the
Renderwolf API credential. The credential test calls `/v1/usage`.

## Resources

- [API reference](https://ironfang.uk/renderwolf/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
