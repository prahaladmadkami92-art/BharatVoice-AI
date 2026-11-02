const express = require("express");
const path = require("path");
const { generateAudio } = require("./audio-new");
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Website files
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
// Audio Download API
app.post("/api/download", async (req, res) => {
    try {
        const text = req.body.text;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please enter some text"
            });
        }

        if (text.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Maximum 5000 characters allowed"
            });
        }

        const filename = "bharatvoice-" + Date.now() + ".wav";
        const outputFile = path.join(__dirname, filename);

        await generateAudio(text, outputFile, req.body.language, req.body.gender);

        res.download(outputFile, filename, (error) => {
            const fs = require("fs");
            fs.unlink(outputFile, () => {});

            if (error) {
                console.error("Download error:", error.message);
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Audio generation failed"
        });
    }
});

// Server health check
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        project: "BharatVoice AI",
        status: "Server Running",
        version: "1.0.0"
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log("--------------------------------");
    console.log(" BharatVoice AI Server Started");
    console.log(" Port: " + PORT);
    console.log(" http://localhost:" + PORT);
    console.log("--------------------------------");
});
