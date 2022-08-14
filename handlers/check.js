const search = require("./search");

const checkToken = async () => {
	const data = await search("тест");
	let error = false;
	try {
		if (data.error.code === 403) {
			error = true;
		}
	} catch {}
	return error;
};

module.exports = {
	checkToken,
};
