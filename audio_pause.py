import wave
import json
import sys

def add_silence(input_files, output_file, pause_seconds):
    if not input_files:
        raise ValueError("No input audio files")

    if len(pause_seconds) != len(input_files) - 1:
        raise ValueError("Pause count mismatch")

    with wave.open(input_files[0], "rb") as first:
        params = first.getparams()

    with wave.open(output_file, "wb") as output:
        output.setparams(params)

        for index, filename in enumerate(input_files):
            with wave.open(filename, "rb") as source:
                audio_format = (
                    source.getnchannels(),
                    source.getframerate(),
                    source.getsampwidth(),
                    source.getcomptype()
                )

                expected_format = (
                    params.nchannels,
                    params.framerate,
                    params.sampwidth,
                    params.comptype
                )

                if audio_format != expected_format:
                    raise ValueError("Audio formats do not match")

                output.writeframes(source.readframes(source.getnframes()))

            if index < len(input_files) - 1:
                duration = float(pause_seconds[index])

                if duration < 0:
                    raise ValueError("Pause cannot be negative")

                frames = round(duration * params.framerate)
                silence = b"\x00" * frames * params.nchannels * params.sampwidth
                output.writeframes(silence)

    print("Merged audio:", output_file)


if __name__ == "__main__":
    add_silence(
        json.loads(sys.argv[2]),
        sys.argv[1],
        json.loads(sys.argv[3])
    )
