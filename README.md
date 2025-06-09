# JackCraftCode.github.io

This is the source for my personal portfolio. The site uses [Deno](https://deno.land/) and is designed to run on Deno Deploy.

## Running locally

Make sure you have Deno installed, then run:

```sh
deno run --allow-read --allow-net main.ts
```

The root page serves `index.html`. Visiting `/projects` fetches the public repositories from GitHub.
