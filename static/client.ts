function insertCommonElement() {
	const header =
		'<header>\n' +
		'    <nav>\n' +
		'        <ul>\n' +
		'            <li><a href="/">Home</a></li>\n' +
		'            <li><a href="/about">About</a></li>\n' +
		'        </ul>\n' +
		'    </nav>\n' +
		'</header>';

	const body = document.getElementById("body");
	if (!body) return;
	body.insertAdjacentHTML("afterbegin", header);
}