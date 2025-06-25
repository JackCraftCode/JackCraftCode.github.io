import {DOMParser} from "jsr:@b-fuze/deno-dom";
import readFile = Deno.readFile;

const status_NOT_FOUND = 404;
const status_OK = 200;
const appTitle = "Jackson McAfee's Portfolio";

function MIMEtype(filename: string) {
	const MIME_TYPES = {
		'css': 'text/css',
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

function template_header(title: string) {
	const fullTitle = appTitle + ": " + title;

	return '<!DOCTYPE html>' +
		'<html lang="en">' +
		'    <head>' +
		'        <title>${fullTitle}</title>' +
		'        <link rel="stylesheet" href="style.css">' +
		'    </head>'
}

function template_notFound() {
	return template_header("Page not found") +
		'    <body id="body">' +
		'        <h1>Page not found</h1>' +
		'        <p>Sorry, the requested page was not found.</p>' +
		'    </body>' +
		'</html>'
}

async function addScriptAndStyle(path: string) {
	const html = await Deno.readTextFile(path);
	const doc = new DOMParser().parseFromString(html, "text/html");
	const head = doc.querySelector("head");
	if (head) {
		const scriptTag = doc.createElement("script");
		scriptTag.setAttribute("src", "client.ts");
		const inlineScript = doc.createElement("script");
		inlineScript.textContent =
			"\n        window.addEventListener(\"DOMContentLoaded\", () => {" +
			"\n            insertCommonElement();\n        });\n    ";
		head.append("    ", scriptTag, "\n    ", inlineScript, "\n");
	}
	return doc.documentElement.innerHTML;
}

async function fileData(path: string) {
	let contents, status, contentType;
	if (path.lastIndexOf('.') === -1) path += ".html";
	const type = MIMEtype(path);

	try {
		if (type === "text/html") contents = await addScriptAndStyle("./static" + path);
		else contents = await readFile("./static" + path);
		status = status_OK;
		contentType = type;
	} catch (_e) {
		contents = template_notFound();
		status = status_NOT_FOUND;
		contentType = "text/html";
	}

	return {contents, status, contentType};
}

const server = Deno.serve(async (req) => {
	let path = new URL(req.url).pathname;
	if (path === "/") path = "/index.html";
	let r = await fileData(path);

	console.log(`${r.status} ${req.method} ${r.contentType} ${path}`);

	return new Response(r.contents, {
		status: r.status, headers: {
			"content-type": r.contentType,
		}
	});
});

server.finished.then(() => {
	console.log("Server terminating")
});
