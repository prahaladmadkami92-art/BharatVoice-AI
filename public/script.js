const textInput = document.getElementById("text");
const languageInput = document.getElementById("language");
const genderInput = document.getElementById("gender");
const speedInput = document.getElementById("speed");
const statusText = document.getElementById("status");
const voiceInfo = document.getElementById("voiceInfo");
const charCount = document.getElementById("charCount");

document.getElementById("clearText").addEventListener("click", () => {
    textInput.value = "";
    charCount.textContent = "Characters: 0 / 5000";
    statusText.textContent = "Text cleared.";
});

textInput.addEventListener("input", () => {
    charCount.textContent = "Characters: " + textInput.value.length + " / 5000";
});

const generateBtn = document.getElementById("generate");
const stopBtn = document.getElementById("stop");
const previewBtn = document.getElementById("preview");

let voices = [];
const speechSupported =
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

function loadVoices() {
    if (!speechSupported) return;
    voices = window.speechSynthesis.getVoices();
}

if (speechSupported) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
} else {
    statusText.textContent = "Browser voice support unavailable.";
}

generateBtn.addEventListener("click", speak);

stopBtn.addEventListener("click", () => {
    window.speechSynthesis.cancel();
    statusText.textContent = "Voice stopped.";
});

function speak() {
    const text = textInput.value.trim();
    const lang = languageInput.value;
    const gender = genderInput.value;

    if (!text) {
        statusText.textContent = "Please enter some text!";
        return;
    }

    if (!("speechSynthesis" in window)) {
        statusText.textContent = "Voice not supported!";
        return;
    }

    window.speechSynthesis.cancel();

    const msg = createVoice(
        text,
        lang,
        gender,
        speedInput.value,
        voices
    );

    msg.onstart = () => {
        statusText.textContent = "Speaking...";
    };

    msg.onend = () => {
        statusText.textContent = "Voice generation completed!";
    };

    msg.onerror = () => {
        statusText.textContent = "Voice error. Please try again.";
    };

    window.speechSynthesis.speak(msg);
}

const speedValue = document.getElementById("speedValue");

speedInput.addEventListener("input", () => {
    speedValue.textContent = "Speed: " + Number(speedInput.value).toFixed(1) + "x";
});


let previewAudio = null;
let previewObjectUrl = null;

previewBtn.addEventListener("click", async () => {
    const sampleText = textInput.value.trim().slice(0, 80) || "Hello! This is a voice preview.";

    previewBtn.disabled = true;
    statusText.textContent = "Generating voice preview...";

    try {
        window.speechSynthesis.cancel();

        if (previewAudio) {
            previewAudio.pause();
            previewAudio = null;
        }

        if (previewObjectUrl) {
            URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = null;
        }

        const response = await fetch("/api/preview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text: sampleText,
                language: languageInput.value,
                gender: genderInput.value
            })
        });

        if (!response.ok) {
            throw new Error("Preview generation failed");
        }

        const blob = await response.blob();
        previewObjectUrl = URL.createObjectURL(blob);
        previewAudio = new Audio(previewObjectUrl);

        previewAudio.onended = () => {
            statusText.textContent = "Voice preview completed!";
            URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = null;
        };

        previewAudio.onerror = () => {
            statusText.textContent = "Preview playback error.";
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
            previewObjectUrl = null;
        };

        statusText.textContent = "Preview speaking...";
        await previewAudio.play();

    } catch (error) {
        console.error("Preview error:", error);
        statusText.textContent = "Preview error. Please try again.";
    } finally {
        previewBtn.disabled = false;
    }
});
const downloadBtn = document.getElementById("download");

downloadBtn.addEventListener("click", async () => {
    const text = textInput.value.trim();

    if (!text) {
        statusText.textContent = "Please enter some text!";
        return;
    }

    downloadBtn.disabled = true;
    statusText.textContent = "Generating audio...";

    try {
        const response = await fetch("/api/download", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text, language: languageInput.value, gender: genderInput.value })
        });

        if (!response.ok) {
            throw new Error("Audio generation failed");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = languageInput.value === "hi-IN"
            ? "BharatVoice-AI.mp3"
            : "BharatVoice-AI.wav";
        link.click();

        URL.revokeObjectURL(url);
        statusText.textContent = "Audio downloaded successfully!";

    } catch (error) {
        statusText.textContent = "Download failed. Please try again.";
    } finally {
        downloadBtn.disabled = false;
    }
});

