const repo = document.getElementById("project-header").dataset.repo;
const list = document.getElementById("fileList");
const codeWrap = document.getElementById("codeWrap");

let files = [];
let active = null;

function extToLang(p){
	const ext = p.toLowerCase().split(".").pop() ?? "";
	const extMap = new Map([
		["ts", "typescript"], ["md", "markdown"], ["html", "xml"], ["scss", "scss"]
	]);
	return extMap[ext] ?? "";
}

async function loadTree() {
	const res = await fetch(`/api/tree?repo=${repo}`);
	if (!res.ok) {
		list.innerHTML = '<li class="empty">Failed to load file list.</li>';
		return;
	}
	const data = await res.json();
	files = data.files;
	renderList();
	const hash = decodeURIComponent(location.hash.slice(1));
	if (hash) await openFile(hash);
}

function renderList() {
	list.innerHTML = "";
	for (const f of files) {
		const li = document.createElement("li");
		li.dataset.path = f.path;
		const fileName = f.path.split("/").pop();
		li.innerHTML = `<span>${fileName}</span><span class="path">${f.size ?? ""}</span>`;
		li.addEventListener("click", () => openFile(f.path));
		if (f.path === active) li.classList.add("active");
		list.appendChild(li);
	}
}

async function openFile(path){
	active = path;
	for (const li of list.children) li.classList.toggle("active", li.dataset.path === path);
	// currentPath.textContent = path;
	codeWrap.innerHTML = "<div class='empty'>Loading…</div>";
	const res = await fetch(`/api/file?repo=${repo}&path=${encodeURIComponent(path)}`);
	if (!res.ok) {
		codeWrap.innerHTML = "<div class='empty'>Failed to load file.</div>";
		return;
	}
	const { content, rawUrl } = await res.json();
	const pre = document.createElement("pre");
	const code = document.createElement("code");
	code.className = "language-" + (extToLang(path) || "");
	code.textContent = content;
	pre.appendChild(code);
	codeWrap.innerHTML = "";
	codeWrap.appendChild(pre);
	hljs.highlightElement(code);
	location.hash = encodeURIComponent(path);
}

loadTree().then(r => console.log(r));