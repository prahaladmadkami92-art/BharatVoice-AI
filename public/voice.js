function getBestVoice(lang, gender, voices) {
    const language = lang.split("-")[0].toLowerCase();

    const matching = voices.filter(voice =>
        voice.lang.toLowerCase().startsWith(language)
    );

    if (matching.length === 0) return null;

    const genderPattern = gender === "female"
        ? /female|woman|girl/i
        : /male|man/i;

    return matching.find(voice =>
        genderPattern.test(voice.name)
    ) || matching[0];
}

function createVoice(text, lang, gender, speed, voices) {
    const message = new SpeechSynthesisUtterance(text);

    message.lang = lang;
    message.rate = Number(speed);
    message.pitch = 1.0;
    message.volume = 1;

    const selectedVoice = getBestVoice(lang, gender, voices);

    if (selectedVoice) {
        message.voice = selectedVoice;
    }

    return message;
}

