import readFile = Deno.readFile;
const read = (p: string) => Deno.readTextFile(new URL(p, import.meta.url));

const status_NOT_FOUND = 404;
const status_OK = 200;
const appTitle = "Jackson McAfee's Portfolio";
const owner = "JackCraftCode";
const branch = "main";

const textExts = new Set([
	"ts","tsx","js","jsx","md","html","css","scss","sass",
	"less","svg","py","java","cs","cpp","cc","cxx","c",
	"hs","h","hpp","hh","sql","makefile","cmake","csv"
]);

function MIMEtype(filename: string) {
	const MIME_TYPES = {
		'css': 'text/css',
		'scss': 'text/css',
		'gif': 'image/gif',
		'htm': 'text/html',
		'html': 'text/html',
		'ico': 'image/x-icon',
		'jpeg': 'image/jpeg',
		'jpg': 'image/jpeg',
		'js': 'text/javascript',
		'ts': 'text/typescript',
		'json': 'application/json',
		'pdf': 'application/pdf',
		'png': 'image/png',
		'txt': 'text/text'
	};

	let extension = "";

	if (filename) {
		extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
	}

	return MIME_TYPES[extension as keyof typeof MIME_TYPES] || "application/octet-stream";
}

function template_notFound() {
	const fullTitle = appTitle + ": Page Not Found";

	return '<!DOCTYPE html>' +
		'<html lang="en">' +
		'    <head>' +
		'        <title>${fullTitle}</title>' +
		'        <link rel="stylesheet" href="style.scss">' +
		'    </head>' +
		'    <body id="body">' +
		'        <h1>Page not found</h1>' +
		'        <p>Sorry, the requested page was not found.</p>' +
		'    </body>' +
		'</html>'
}

async function injectCommonElms(layout: string, pagePath: string) {
	let partial, injectIndex;
	let content = layout.replace(
		"<!-- INJECT::page -->",
		await read(`./static/pages/${pagePath}`)
	);

	while (content.includes("INJECT::")) {
		injectIndex = content.indexOf("INJECT::") + 8;

		partial = content.substring(injectIndex, content.indexOf(" -->", injectIndex));
		content = content.replace(
			`<!-- INJECT::${partial} -->`,
			await read(`./static/partials/${partial}.html`)
		);
	}
	return content;
}

async function render(path: string) {
	let content, status, contentType;
	if (path.lastIndexOf('.') === -1) path += ".html";
	const type = MIMEtype(path);

	try {
		if (type === "text/html") {
			const layout = await read('./static/layout.html');
			content = await injectCommonElms(layout, path);
		} else content = await readFile("./static" + path);
		status = status_OK;
		contentType = type;
	} catch (_e) {
		content = template_notFound();
		status = status_NOT_FOUND;
		contentType = "text/html";
	}

	return {contents: content, status, contentType};
}

function cacheHeaders(path: string, contentType: string): Record<string, string> {
	// Long cache for static assets (images, fonts)
	const long = "public, max-age=31536000, immutable";
	const short = "public, max-age=3600";

	const isImage = /^image\//.test(contentType) || /\.(avif|webp|png|jpe?g|gif|svg|ico)$/i.test(path);
	const isStaticCode = /^(text\/css|text\/javascript|application\/javascript)$/.test(contentType) ||
		/\.(css|js)$/i.test(path);

	return {
		"content-type": contentType,
		"cache-control": isImage ? long : (isStaticCode ? short : "public, max-age=300"),
	};
}

function isTextualPath(p: string) {
	const lower = p.toLowerCase();
	if (lower.endsWith(".min.js") || lower.endsWith(".min.css")) return true;
	const fname = lower.split("/").pop()!;
	if (fname === "makefile") return true;
	const ext = lower.includes(".") ? lower.split(".").pop()! : "";
	return textExts.has(ext);
}

async function ghFetch(url: string, init: RequestInit = {}) {
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/vnd.github+json");
	return fetch(url, {...init, headers});
}

type CacheEntry<T> = {etag?: string; value: T; timestamp: number};
const cache = new Map<string, CacheEntry<any>>();

async function getTree(repo: string) {
	const key = `tree:${owner}/${repo}@${branch}`;
	const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`;
	const existing = cache.get(key);
	const headers: HeadersInit = {};
	if (existing?.etag) headers["If-None-Match"] = existing.etag;
	const res = await ghFetch(url, {headers});
	if (res.status === 304 && existing) return existing.value;
	if (!res.ok) throw new Response(`GitHub tree error ${res.status}`, {status: res.status});
	const etag = res.headers.get("etag") ?? undefined;
	const data = await res.json(); // includes tree: TreeItem[]
	cache.set(key, {etag, value: data, timestamp: Date.now()});
	return data;
}

async function getRawFileContent(repo: string, path: string): Promise<string> {
	const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
	const res = await fetch(url);
	if (!res.ok) throw new Response(`Raw fetch failed ${res.status}`, {status: res.status});
	const text = await res.text();
	if (text.length > 500_000) throw new Response("File too large to display (limit 500KB).", {status: 413});
	return text;
}

const server = Deno.serve(async (req) => {
	const {pathname, searchParams} = new URL(req.url);
	let urlPath = pathname;
	if (urlPath === "/") urlPath = "/home.html";

	if (urlPath === "/api/tree") {
		const repo = searchParams.get("repo");
		const data = await getTree(repo);
		const blobs = (data.tree as TreeItem[])
			.filter((t) => t.type === "blob")
			.filter((t) => isTextualPath(t.path))
			.map((t) => ({path: t.path, size: t.size ?? null}));
		return new Response(JSON.stringify({files: blobs}));
	}

	if (urlPath === "/api/file") {
		const path = searchParams.get("path");
		const repo = searchParams.get("repo");
		const content = await getRawFileContent(repo, path);
		return new Response(JSON.stringify({content}));
	}

	let r = await render(urlPath);

	console.log(`${r.status} ${req.method} ${r.contentType} ${urlPath}`);

	const headers = cacheHeaders(urlPath, r.contentType);
	return new Response(r.contents, {
		status: r.status, headers
	});
});

server.finished.then(() => {
	console.log("Server terminating")
});
