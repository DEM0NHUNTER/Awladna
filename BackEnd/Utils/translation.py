# BackEnd/Utils/translation.py

from googletrans import Translator
from fastapi import Request, Response
from typing import Dict, List, Optional

# Initialize Google Translate API client
translator = Translator()


def detect_language(text: str) -> str:
    """
    Detect the language of a given text using Google Translate API.

    Parameters:
    - text (str): The input text to analyze.

    Returns:
    - str: Language code ('en' for English, 'ar' for Arabic).
           Defaults to 'en' if detection fails or detects unsupported language.
    """
    try:
        result = translator.detect(text)
        return result.lang if result.lang in ["en", "ar"] else "en"
    except Exception as e:
        logging.warning(f"Language detection failed: {e}")
        return "en"  # Default fallback


def translate_text(text: str, target_lang: str) -> str:
    """
    Translate input text from English to a specified target language using Google Translate API.

    Parameters:
    - text (str): The English source text.
    - target_lang (str): Target language code ('en' or 'ar').

    Returns:
    - str: Translated text, or original text if translation fails.
    """
    try:
        return translator.translate(text, src="en", dest=target_lang).text
    except Exception as e:
        logging.error(f"Translation error: {e}")
        return text  # Return original text as fallback
