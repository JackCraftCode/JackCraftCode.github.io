function insertCommonElement() {
        const header =
                '<header>\n' +
                '    <nav>\n' +
                '        <ul class="menu">\n' +
                '            <li><a href="/">Home</a></li>\n' +
                '            <li><a href="/about">About</a></li>\n' +
                '            <li class="projects">Projects\n' +
                '                <ul class="dropdown">\n' +
                '                    <li><a href="https://github.com/JackCraftCode/JackCraftCode.github.io" target="_blank">My Portfolio Site</a></li>\n' +
                '                    <li><a href="https://github.com/JackCraftCode/game-of-life" target="_blank">Game of Life</a></li>\n' +
                '                </ul>\n' +
                '            </li>\n' +
                '        </ul>\n' +
                '    </nav>\n' +
                '</header>';

	const body = document.getElementById("body");
	if (!body) return;
	body.insertAdjacentHTML("afterbegin", header);
}