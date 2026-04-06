chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	switch (message.type) {
		case "DETECT_FIELDS":
			sendResponse({
				type: "FIELDS_DETECTED",
				payload: detectFormFields()
			});
			return false;
		case "FILL_FORM":
			const filled = fillFields(message.payload);
			sendResponse({
				type: "FILL_COMPLETE",
				payload: { filled }
			});
			return false;
	}
});
function detectFormFields() {
	const elements = document.querySelectorAll("input, textarea, select");
	const fields = [];
	elements.forEach((el, idx) => {
		if (isSkippable(el)) return;
		fields.push({
			id: el.id || `autoapply-field-${idx}`,
			name: el.name || "",
			type: el.type || el.tagName.toLowerCase(),
			label: resolveLabel(el),
			placeholder: el.placeholder || "",
			value: el.value || "",
			selector: buildSelector(el)
		});
	});
	return fields;
}
function fillFields(values) {
	let filled = 0;
	for (const [selector, value] of Object.entries(values)) {
		const el = document.querySelector(selector);
		if (!el) continue;
		setNativeValue(el, value);
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("change", { bubbles: true }));
		filled++;
	}
	return filled;
}
function setNativeValue(el, value) {
	const proto = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
	const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
	if (setter) {
		setter.call(el, value);
	} else {
		el.value = value;
	}
}
function isSkippable(el) {
	const input = el;
	if (el.offsetParent === null && el.getAttribute("type") !== "hidden") return true;
	const skip = [
		"hidden",
		"submit",
		"button",
		"reset",
		"image",
		"file"
	];
	return skip.includes(input.type);
}
function resolveLabel(el) {
	if (el.id) {
		const label = document.querySelector(`label[for="${el.id}"]`);
		if (label?.textContent) return label.textContent.trim();
	}
	const parent = el.closest("label");
	if (parent?.textContent) return parent.textContent.trim();
	const ariaLabel = el.getAttribute("aria-label");
	if (ariaLabel) return ariaLabel;
	const prev = el.previousElementSibling;
	if (prev?.tagName === "LABEL" && prev.textContent) return prev.textContent.trim();
	return "";
}
function buildSelector(el) {
	if (el.id) return `#${CSS.escape(el.id)}`;
	if (el.getAttribute("name")) return `${el.tagName.toLowerCase()}[name="${CSS.escape(el.getAttribute("name"))}"]`;
	const tag = el.tagName.toLowerCase();
	const parent = el.parentElement;
	if (!parent) return tag;
	const siblings = Array.from(parent.children).filter((c) => c.tagName === el.tagName);
	const idx = siblings.indexOf(el);
	return `${buildSelector(parent)} > ${tag}:nth-of-type(${idx + 1})`;
}
export {};
