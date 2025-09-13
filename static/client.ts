// function insertCommonElement() {
// 	const body = document.getElementById("body");
// 	const header =
// 		'<header id="header">\n' +
// 		'\t\t<a href="/" class="logo">JackCraftCode</a>\n' +
// 		'\t</header>';
//
// 	body.insertAdjacentHTML('afterbegin', header);
//
// 	fetch("partials/navbar.html")
// 		.then(res => res.text())
// 		.then(html => {
// 			const header = document.getElementById("header");
// 			if (header) {
// 				header.insertAdjacentHTML("beforeend", html);
// 			} else {
// 				console.warn("Navbar container not found in document");
// 			}
// 		})
// 		.catch(err => console.error("Error loading navbar:", err));
// }

// document.querySelector('.hamburger').addEventListener('click', () => {
// 	document.querySelector('.menu').classList.toggle('show');
// });

// Optional: toggle dropdown in mobile mode
// document.querySelectorAll('.has-dropdown > a').forEach(link => {
// 	link.addEventListener('click', e => {
// 		const parent = link.parentElement;
// 		const isMobile = globalThis.innerWidth <= 768;
// 		if (isMobile) {
// 			e.preventDefault(); // Prevent link behavior
// 			parent.classList.toggle('open');
// 		}
// 	});
// });
