export function getBrowserType() {
	if (location.protocol == "moz-extension:") {
		return "Firefox";
	} else if (location.protocol == "chrome-extension:") {
		return "Chrome";
	} else {
		return "unknown";
	}
}
export function isVivaldi() {
	return "VivaldiInvokedBy" in chrome.tabs;
}