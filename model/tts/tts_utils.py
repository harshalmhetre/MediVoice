from gtts import gTTS


def text_to_speech(text: str, output_file: str):
    """
    Convert text to speech and save as an audio file.
    """
    tts = gTTS(text)
    tts.save(output_file)
