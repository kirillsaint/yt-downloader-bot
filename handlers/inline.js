const { ru } = require("../messages");
const { checkToken } = require("./check");
const search = require("./search");
const download = require("./download");
const ytdl = require("ytdl-core");

module.exports = async (ctx) => {
	let results = [];
	const message = ctx.inlineQuery.query.trim();
	if (message === "") {
		await ctx.answerInlineQuery(results);
		return;
	}

	try {
		if (!ytdl.validateURL(message)) {
			const error = await checkToken();
			if (error) {
				await ctx.answerInlineQuery([
					{
						type: "article",
						id: "1",
						title: "❗️",
						input_message_content: {
							message_text: ru.youtubeSearchError,
							parse_mode: "HTML",
						},
						description: ru.apiInlineError,
					},
				]);
				return;
			}
			const { items: data } = await search(ctx.inlineQuery.query);
			if (data.length === 0) {
				await ctx.answerInlineQuery([
					{
						type: "article",
						id: "1",
						title: "😢",
						input_message_content: {
							message_text: ru.youtubeSearchError,
							parse_mode: "HTML",
						},
						description: "Ничего не найдено",
					},
				]);
				return;
			}

			for (const item of data) {
				try {
					const info = await ytdl.getInfo(
						`http://www.youtube.com/watch?v=${item.id.videoId}`
					);
					const video = await download(info.formats);
					if (parseInt(video.contentLength) > 49000000) {
						results.push({
							type: "article",
							id: `${info.videoDetails.videoId}`,
							title: `${item.snippet.title}`,
							thumb_url: info.videoDetails.thumbnails[0].url,
							description: `${item.snippet.description}`,
							input_message_content: {
								message_text: `${ru.uploadFailed} https://youtubdle.com/watch?v=${info.videoDetails.videoId}`,
								parse_mode: "HTML",
							},
						});
					} else {
						results.push({
							type: "video",
							id: `${item.id.videoId}`,
							title: `${item.snippet.title}`,
							video_url: video.url,
							thumb_url: info.videoDetails.thumbnails[0].url,
							description: `${item.snippet.description}`,
							mime_type: "video/mp4",
							caption: ru.downloadEnd.format(
								`http://www.youtube.com/watch?v=${item.id.videoId}`
							),
							parse_mode: "HTML",
						});
					}
				} catch (e) {
					console.log(e);
				}
			}
		} else {
			try {
				const info = await ytdl.getInfo(message);
				const video = await download(info.formats);
				results.push({
					type: "video",
					id: `${item.id.videoId}`,
					title: `${info.videoDetails.title}`,
					video_url: video,
					thumb_url: info.videoDetails.thumbnails[0].url,
					description: `${info.videoDetails.description}`,
					mime_type: "video/mp4",
					caption: ru.downloadEnd.format(
						`http://www.youtube.com/watch?v=${info.videoDetails.videoId}`
					),
					parse_mode: "HTML",
				});
			} catch (e) {
				console.log(e);
			}
		}
	} catch (e) {
		console.log(e);
		await ctx.answerInlineQuery([
			{
				type: "article",
				id: "1",
				title: "❗️",
				input_message_content: {
					message_text: ru.youtubeSearchError,
					parse_mode: "HTML",
				},
				description: ru.apiInlineError,
			},
		]);
		return;
	}
	if (results.length === 0) {
		await ctx.answerInlineQuery([
			{
				type: "article",
				id: "1",
				title: "😢",
				input_message_content: {
					message_text: ru.notFound,
					parse_mode: "HTML",
				},
				description: "Ничего не найдено",
			},
		]);
		return;
	}
	await ctx.answerInlineQuery(results);
};
