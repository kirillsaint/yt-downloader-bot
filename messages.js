const ru = {
	start: `<b>👋 Привет!</b>\n\nЯ могу скачать видео с <b>YouTube</b>.\nОтправь ссылку на видео или введи его название.\n\n<a href="tg://user?id=${process.env.ADMIN_ID}">Разработчик</a> | <a href='https://github.com/kirillsaint/yt-downloader-bot'>Исходный код</a>`,
	searchStart: "<b>🔍 Начинаю поиск...</b>",
	error:
		"<b>❗️ Произошла ошибка!</b>\n\n<i>Информация уже передана разработчику</i>",
	results: "<b>🔍 Результаты поиска:</b>",
	notFound: "<b>❌ Ничего не найдено</b>",
	notValid: "<b>❗️ Видео не найдено</b>",
	downloadStart: "<b>🎥 Начинаю загрузку:</b>",
	downloadEnd: "<b>✅ Видео загружено!</b>",
	uploadFailed:
		"<b>😢 К сожалению, я не могу отправить это видео, но вы можете скачать его здесь:</b>",
	ratelimit:
		"<b>⏳ Подожди пару секунд прежде, чем отправлять новый запрос!</b>",
};

module.exports = {
	ru,
};
