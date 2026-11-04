const { execFile } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { improveHindiPronunciation } = require("./hindi-pronunciation");

const voices = {
    "en-IN": "en",
    "en-US": "en",
    "hi-IN": "hi",
    "or-IN": "or",
    "bn-IN": "bn",
    "ta-IN": "ta",
    "te-IN": "te",
    "pa-IN": "pa",
    "mr-IN": "mr",
    "gu-IN": "gu",
    "ml-IN": "ml",
    "kn-IN": "kn",
    "as-IN": "as",
    "ur-IN": "ur",
    "ne-NP": "ne",
    "sd-IN": "sd"
};

function runEspeak(args) {
    return new Promise((resolve, reject) => {
        execFile("espeak", args, error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function runPython(args) {
    return new Promise((resolve, reject) => {
        execFile("python", args, error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function runEdgeTTS(args) {
    return new Promise((resolve, reject) => {
        execFile("edge-tts", args, { timeout: 120000 }, error => {
            if (error) reject(error);
            else resolve();
        });
    });
}

function pauseFor(segment) {
    const mark = segment.slice(-1);

    if (mark === ",") return 0.20;
    if (mark === ";") return 0.35;
    if (["।", "?", "!"].includes(mark)) return 0.60;

    return 0.30;
}

async function generateHindiAudio(text, outputFile, voice) {
    const processedText = improveHindiPronunciation(text).trim();

    const segments = processedText
        .match(/[^,;।!?]+[,;।!?]?/g)
        ?.map(segment => segment.trim())
        .filter(Boolean) || [];

    if (!segments.length) {
        throw new Error("Hindi text is empty.");
    }

    const tempDir = fs.mkdtempSync(
        path.join(os.tmpdir(), "bharatvoice-")
    );

    try {
        const files = [];
        const pauses = [];

        for (let index = 0; index < segments.length; index++) {
            const segmentFile = path.join(
                tempDir,
                `part-${index}.wav`
            );

            await runEspeak([
                "-v", voice,
                "-p", "45",
                "-s", "135",
                "-g", "4",
                segments[index],
                "-w", segmentFile
            ]);

            files.push(segmentFile);

            if (index < segments.length - 1) {
                pauses.push(pauseFor(segments[index]));
            }
        }

        await runPython([
            path.join(__dirname, "audio_pause.py"),
            outputFile,
            JSON.stringify(files),
            JSON.stringify(pauses)
        ]);

        return outputFile;
    } finally {
        fs.rmSync(tempDir, {
            recursive: true,
            force: true
        });
    }
}

function generateAudio(text, outputFile, language, gender) {
    return new Promise(async (resolve, reject) => {
        const voice = voices[language];

        if (!voice) {
            return reject(
                new Error("This language is not supported yet.")
            );
        }

        try {
            if (language === "hi-IN") {
                const selectedVoice = gender === "female"
                    ? "hi-IN-SwaraNeural"
                    : "hi-IN-MadhurNeural";

                await runEdgeTTS([
                    "--voice", selectedVoice,
                    "--text", text,
                    "--write-media", outputFile
                ]);

                return resolve(outputFile);
            }

            await runEspeak([
                "-v", voice,
                "-p", "45",
                "-s", "135",
                "-g", "4",
                text,
                "-w", outputFile
            ]);

            resolve(outputFile);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateAudio };
