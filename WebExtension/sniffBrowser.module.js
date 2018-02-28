export default async function() {
	if (window.browser && browser.runtime.getBrowserInfo) {
		var {name} = await browser.runtime.getBrowserInfo();
		return name;
	} else if (window.chrome && chrome.runtime) {
		return "Chrome";
	} else {
		return "Edge";
	}
}