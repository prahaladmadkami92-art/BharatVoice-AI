const { execFile } = require("child_process");

function generateAudio(text, outputFile) {
    return new Promise((resolve, reject) => {
        execFile(
            "espeak",
            ["-v", "en", text, "-w", outputFile],
            (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(outputFile);
                }
            }
        );
    });
}

module.exports = { generateAudio };

