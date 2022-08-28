const ytdl = require("ytdl-core");

const download = async (formats) => {
	let video = await ytdl.chooseFormat(
		await ytdl.filterFormats(formats, "videoandaudio"),
		{ quality: "highest" }
	);

	return video;
};

module.exports = download;
