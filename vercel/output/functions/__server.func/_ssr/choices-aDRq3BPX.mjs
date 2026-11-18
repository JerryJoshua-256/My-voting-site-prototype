//#region node_modules/.nitro/vite/services/ssr/assets/choices-aDRq3BPX.js
var CHOICES = [{
	id: "studio",
	index: "01",
	title: "All 1,450 for Studio Work",
	detail: "The full ₦1,450 goes to studio work."
}, {
	id: "split",
	index: "02",
	title: "1,000 for Class due and 450 for studio work",
	detail: "₦1,000 is set aside for class due. ₦450 goes to studio work."
}];
function isChoice(value) {
	return value === "studio" || value === "split";
}
function choiceTitle(choice) {
	const match = CHOICES.find((item) => item.id === choice);
	return match ? match.title : choice;
}
//#endregion
export { choiceTitle as n, isChoice as r, CHOICES as t };
