const indexHtml = await Deno.readTextFile("./index.html");

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
	return new Response(indexHtml, {
		headers: { "content-type": "text/html; charset=utf-8" },
	});
});
