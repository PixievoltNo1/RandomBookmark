let l10n = (...params) => chrome.i18n.getMessage(...params);

for (let image of document.querySelectorAll(".extIcon")) {
	image.alt = l10n("extName");
}

if (location.pathname == "/infoPages/picking.html") {
	document.title = l10n("pickingBookmark");
	document.querySelector("h1").textContent = l10n("pickingBookmark");
} else if (location.pathname == "/infoPages/error.html") {
	document.title = `${l10n("error")} - ${l10n("extName")}`;
	document.querySelector(".errorHeaderText").textContent = l10n("error");
	let searchParams = new URLSearchParams(location.search);
	let errorName = searchParams.get("errorName")
	document.querySelector(".errorText").textContent = l10n(`error_${errorName}`);
	if (errorName == "openingNotAllowed") {
		let url = searchParams.get("detail");
		let link = Object.assign(document.createElement("p"), {
			textContent: url,
			className: "errorUrl"
		});
		document.body.append(link);
	}
}