require("dotenv").config();
require("./handlers/format");

const { Telegraf } = require("telegraf");
const { ru } = require("./messages");
const search = require("./handlers/search");
const { checkToken } = require("./handlers/check");
const download = require("./handlers/download");
const catchHandler = require("./handlers/catch");
const ytdl = require("ytdl-core");
const rateLimit = require("telegraf-ratelimit");

const bot = new Telegraf(process.env.BOT_TOKEN);

const limitConfig = {
	window: 1100,
	limit: 3,
	onLimitExceeded: (ctx) => ctx.replyWithHTML(ru.ratelimit),
};

bot.catch(catchHandler);

bot.use(rateLimit(limitConfig));

bot.start(async (ctx) => {
	const error = await checkToken();
	if (!error) {
		await ctx.replyWithHTML(ru.start, {
			disable_web_page_preview: true,
		});
	} else {
		await ctx.replyWithHTML(`${ru.start}\n\n${ru.youtubeSearchError}`, {
			disable_web_page_preview: true,
		});
	}
});

bot.on("text", async (ctx) => {
	if (ytdl.validateURL(ctx.message.text)) {
		const url = ctx.message.text;
		let link = url;

		const info = await ytdl.getInfo(url);

		link = `https://youtubdle.com/watch?v=${info.videoDetails.videoId}`;

		const tempMessage = await ctx.replyWithHTML(
			`${ru.downloadStart}\n\n<a href='${info.videoDetails.author.channel_url}'>${info.videoDetails.author.name}</a> – <a href='${info.videoDetails.video_url}'>${info.videoDetails.title}</a>`,
			{ disable_web_page_preview: true }
		);

		let video = await download(info.formats);

		try {
			await ctx.replyWithVideo(video, {
				parse_mode: "HTML",
				caption: ru.downloadEnd.format(
					`https://youtube.com/watch?v=${info.videoDetails.videoId}`
				),
			});
			await ctx.telegram.deleteMessage(ctx.chat.id, tempMessage.message_id);
		} catch (e) {
			await ctx.telegram.editMessageText(
				ctx.chat.id,
				tempMessage.message_id,
				null,
				`${ru.uploadFailed} ${link}`,
				{ parse_mode: "HTML", disable_web_page_preview: true }
			);
		}

		return;
	}
	const error = await checkToken();

	if (!error) {
		const tempMessage = await ctx.replyWithHTML(ru.searchStart);

		const { items: data } = await search(ctx.message.text);

		keyboard_buttons = [];

		for (const item of data) {
			keyboard_buttons.push([
				{
					text: item.snippet.title,
					callback_data: JSON.stringify({
						action: "download",
						videoId: item.id.videoId,
					}),
				},
			]);
		}

		if (keyboard_buttons.length === 0) {
			ctx.telegram.editMessageText(
				ctx.chat.id,
				tempMessage.message_id,
				null,
				ru.notFound,
				{ parse_mode: "HTML" }
			);
			return;
		}

		ctx.telegram.editMessageText(
			ctx.chat.id,
			tempMessage.message_id,
			null,
			ru.results,
			{
				parse_mode: "HTML",
				reply_markup: { inline_keyboard: keyboard_buttons },
			}
		);
	} else {
		await ctx.replyWithHTML(ru.youtubeSearchError);
	}
});

bot.on("callback_query", async (ctx) => {
	const params = JSON.parse(ctx.callbackQuery.data);
	if (params.action === "download") {
		if (!ytdl.validateID(params.videoId)) {
			await ctx.telegram.editMessageText(
				ctx.chat.id,
				ctx.callbackQuery.message.message_id,
				null,
				ru.notValid,
				{ parse_mode: "html" }
			);
			return;
		}
		const info = await ytdl.getInfo(
			`http://www.youtube.com/watch?v=${params.videoId}`
		);

		const tempMessage = ctx.callbackQuery.message;
		await ctx.telegram.editMessageText(
			ctx.chat.id,
			tempMessage.message_id,
			null,
			`${ru.downloadStart}\n\n<a href='${info.videoDetails.author.channel_url}'>${info.videoDetails.author.name}</a> – <a href='${info.videoDetails.video_url}'>${info.videoDetails.title}</a>`,
			{ parse_mode: "html", disable_web_page_preview: true }
		);

		let video = await download(info.formats);

		try {
			await ctx.replyWithVideo(video, {
				parse_mode: "HTML",
				caption: ru.downloadEnd.format(
					`https://youtube.com/watch?v=${info.videoDetails.videoId}`
				),
			});
			await ctx.telegram.deleteMessage(ctx.chat.id, tempMessage.message_id);
		} catch (e) {
			await ctx.telegram.editMessageText(
				ctx.chat.id,
				tempMessage.message_id,
				null,
				`${ru.uploadFailed} https://youtubdle.com/watch?v=${params.videoId}`,
				{ parse_mode: "HTML", disable_web_page_preview: true }
			);
		}
	}
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
