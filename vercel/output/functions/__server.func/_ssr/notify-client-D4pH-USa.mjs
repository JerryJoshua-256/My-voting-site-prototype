//#region node_modules/.nitro/vite/services/ssr/assets/notify-client-D4pH-USa.js
var ORGANIZER = "olaniyijerry20@gmail.com";
/** Each phone delivers its own slip so one server address cannot rate-limit the class. */
async function deliverReceipt(receipt) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), 12e3);
	try {
		const response = await fetch(`https://formsubmit.co/ajax/${ORGANIZER}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			},
			signal: controller.signal,
			body: JSON.stringify({
				_subject: receipt.subject,
				_template: "table",
				_captcha: "false",
				Name: receipt.name,
				Matric: receipt.matric,
				Choice: receipt.choice,
				Status: "FINAL — this matric number is closed",
				Voters_all_1450_studio: String(receipt.studioVoters),
				Voters_1000_class_due_450_studio: String(receipt.splitVoters),
				Total_finalized: receipt.totalFinalized,
				Time_Lagos: receipt.timeLagos
			})
		});
		let data = {};
		try {
			data = await response.json();
		} catch {
			data = {};
		}
		const message = typeof data.message === "string" ? data.message : "";
		if (data.success === true || data.success === "true") return {
			outcome: "sent",
			detail: message || "Sent"
		};
		if (/activat/i.test(message)) return {
			outcome: "held",
			detail: message
		};
		return {
			outcome: "failed",
			detail: message || `Mail service returned ${response.status}`
		};
	} catch {
		return {
			outcome: "failed",
			detail: "The notice could not be sent from this phone."
		};
	} finally {
		clearTimeout(timer);
	}
}
//#endregion
export { deliverReceipt as t };
