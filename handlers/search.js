const searchYoutube = require("youtube-api-v3-search");

const search = async (query) => {
	const options = {
		q: query,
		part: "snippet",
		type: "video",
	};

	try {
		const data = await searchYoutube(process.env.YOUTUBE_KEY, options);

		return data;
	} catch (error) {
		throw new Error(error);
	}
};

module.exports = search;
