const { ru } = require("../messages");

const escapeHTML = (str) =>
	str.replace(
		/[&<>'"]/g,
		(tag) =>
			({
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
				"'": "&#39;",
				'"': "&quot;",
			}[tag] || tag)
	);

module.exports = async (err, ctx) => {
	let errorText = `<b>[ОШИБКА]</b>: <code>${escapeHTML(
		err.toString()
	)}</code>\n\n<b>Update Type:</b> <code>${ctx.updateType}</code>`;

	try {
		if (ctx.message.text)
			errorText += `\n<b>Message text:</b> <code>${escapeHTML(
				ctx.message.text
			)}</code>`;
	} catch {}
	try {
		if (ctx.inlineQuery.query) {
			errorText += `\n<b>Query:</b> <code>${escapeHTML(
				ctx.inlineQuery.query
			)}</code>`;
		}
	} catch {}
	if (ctx.match) errorText += `\n<b>Match:</b> <code>${ctx.match[0]}</code>`;
	if (ctx.from && ctx.from.id)
		errorText += `\n\n<b>User</b>: <a href="tg://user?id=${
			ctx.from.id
		}">${escapeHTML(ctx.from.first_name)}</a> #user_${ctx.from.id}`;

	ctx.telegram.sendMessage(process.env.ADMIN_ID, errorText, {
		parse_mode: "html",
	});
	try {
		ctx.telegram.sendMessage(ctx.chat.id, ru.error, {
			parse_mode: "html",
		});
	} catch {}
};
