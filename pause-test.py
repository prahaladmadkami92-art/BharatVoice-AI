import wave

def add_silence(input_files, output_file, pause_frames=11025):
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
                silence = b"\x00" * pause_frames * params.nchannels * params.sampwidth
                output.writeframes(silence)

    print("Merged audio:", output_file)


def pause_frames_for(punctuation, sample_rate=22050):
    durations = {
        ",": 0.20,
        ";": 0.35,
        "।": 0.60,
        "?": 0.60,
        "!": 0.60,
        ".": 0.60
    }
    return int(durations.get(punctuation, 0.30) * sample_rate)


if __name__ == "__main__":
    print("Variable pause merger ready")
