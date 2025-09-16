# JackCraftCode.github.io

This is the source for my personal portfolio. The site uses [Deno](https://deno.land/) and is designed to run on Deno Deploy.

## Running locally

Make sure you have Deno installed, then run:

```sh
deno run --allow-read --allow-net main.ts
```

Deno serves `layout.html` with the more specific page content injected.
Visiting `/projects` fetches the public repositories from GitHub.

### Additional Notes

I know...I know...my code needs more comments
