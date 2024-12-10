import { Transformer } from "@parcel/plugin";
export default new Transformer({
	async transform({asset}) {
		let source = await asset.getCode();
		let manifest = JSON.parse(source);
		(function processObject(obj) {
			for (let [name, value] of Object.entries(obj)) {
				if (name.startsWith("~")) {
					let browser = name.slice(1);
					if ( asset.env.matchesEngines({[browser]: 1}) ) {
						Object.assign(obj, value);
					}
					delete obj[name];
				} else if (typeof value == "object") {
					processObject(value);
				}
			}
		})(manifest);
		asset.setCode(JSON.stringify(manifest, undefined, "\t"));
		return [asset];
	},
});