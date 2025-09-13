import readFile = Deno.readFile;
const read = (p: string) => Deno.readTextFile(new URL(p, import.meta.url));

const status_NOT_FOUND = 404;
const status_OK = 200;
const appTitle = "Jackson McAfee's Portfolio";

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

async function render(path: string) {
	let content, status, contentType;
	if (path.lastIndexOf('.') === -1) path += ".html";
	const type = MIMEtype(path);

	try {
		if (type === "text/html") {
			const [layout, navbar, page] = await Promise.all([
				read("./static/layout.html"),
				read("./static/partials/navbar.html"),
				read(`./static/pages/${path}`),
			]);
			content = layout
				.replace("<!-- NAVBAR -->", navbar)
				.replace("<!-- PAGE -->", page);
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

const server = Deno.serve(async (req) => {
	let path = new URL(req.url).pathname;
	if (path === "/") path = "/home.html";
	let r = await render(path);

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
