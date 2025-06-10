const indexHtml = await Deno.readTextFile("./index.html");
const styleCss = await Deno.readTextFile("./style.css");

Deno.serve(async (req) => {
    const url = new URL(req.url);
    if (url.pathname === "/projects") {
        const api = "https://api.github.com/users/JackCraftCode/repos";
        const resp = await fetch(api);
        const repos = await resp.json();
        return new Response(JSON.stringify(repos, null, 2), {
            headers: { "content-type": "application/json" },
        });
    }
    if (url.pathname === "/style.css") {
        return new Response(styleCss, {
            headers: { "content-type": "text/css" },
        });
    }
    return new Response(indexHtml, {
        headers: { "content-type": "text/html; charset=utf-8" },
    });
});
