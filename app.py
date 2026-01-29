from flask import Flask, render_template, request, jsonify
from translate import Translator
from gtts import gTTS
import os
from datetime import datetime

app = Flask(__name__)

# Configure upload folder for audio files
UPLOAD_FOLDER = 'static/audio'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Initialize translator (English to Kannada)
translator = Translator(from_lang="en", to_lang="kn")

@app.route('/')
def hello_word():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate_text():
    """Translate English text to Kannada"""
    data = request.json
    text = data.get('text', '').strip()
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        translated = translator.translate(text)
        return jsonify({
            'original': text,
            'translated': translated,
            'source_lang': 'English',
            'target_lang': 'Kannada'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/speak', methods=['POST'])
def speak_text():
    """Generate speech for given text"""
    data = request.json
    text = data.get('text', '').strip()
    language = data.get('language', 'en').lower()
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    try:
        # Map language codes
        lang_map = {
            'en': 'en',
            'english': 'en',
            'kn': 'kn',
            'kannada': 'kn'
        }
        
        lang_code = lang_map.get(language, 'en')
        
        # Create speech
        tts = gTTS(text=text, lang=lang_code, slow=False)
        
        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"speech_{timestamp}.mp3"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save audio file
        tts.save(filepath)
        
        return jsonify({
            'audio_url': f'/static/audio/{filename}',
            'text': text,
            'language': lang_code
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)