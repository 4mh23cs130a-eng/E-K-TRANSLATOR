// Display status message
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status-message';
    }, 3000);
}

// Translate English to Kannada
async function translateText() {
    const englishText = document.getElementById('englishText').value.trim();
    
    if (!englishText) {
        showStatus('Please enter text to translate', 'error');
        return;
    }

    try {
        showStatus('Translating...', 'info');
        
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: englishText })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('kannadaText').value = data.translated;
            showStatus('Translation complete!', 'success');
        } else {
            showStatus('Error: ' + (data.error || 'Translation failed'), 'error');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Speak English text
async function speakEnglish() {
    const englishText = document.getElementById('englishText').value.trim();
    
    if (!englishText) {
        showStatus('Please enter text to speak', 'error');
        return;
    }

    await speakText(englishText, 'en');
}

// Speak Kannada text
async function speakKannada() {
    const kannadaText = document.getElementById('kannadaText').value.trim();
    
    if (!kannadaText) {
        showStatus('Please translate text first', 'error');
        return;
    }

    await speakText(kannadaText, 'kn');
}

// Generic speak function
async function speakText(text, language) {
    try {
        showStatus('Generating speech...', 'info');
        
        const response = await fetch('/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                language: language
            })
        });

        const data = await response.json();

        if (response.ok) {
            const audioPlayer = document.getElementById('audioPlayer');
            audioPlayer.src = data.audio_url;
            document.getElementById('audioSection').style.display = 'block';
            audioPlayer.play();
            showStatus('Playing audio...', 'success');
        } else {
            showStatus('Error: ' + (data.error || 'Speech generation failed'), 'error');
        }
    } catch (error) {
        showStatus('Error: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Copy Kannada text to clipboard
function copyToClipboard() {
    const kannadaText = document.getElementById('kannadaText').value;
    
    if (!kannadaText) {
        showStatus('Nothing to copy', 'error');
        return;
    }

    navigator.clipboard.writeText(kannadaText).then(() => {
        showStatus('Kannada text copied to clipboard!', 'success');
    }).catch(err => {
        showStatus('Failed to copy: ' + err.message, 'error');
        console.error('Error copying to clipboard:', err);
    });
}

// Clear English text
function clearEnglish() {
    document.getElementById('englishText').value = '';
    document.getElementById('englishText').focus();
}

// Clear Kannada text
function clearKannada() {
    document.getElementById('kannadaText').value = '';
}

// Set example text
function setExample(text) {
    document.getElementById('englishText').value = text;
    document.getElementById('englishText').focus();
    // Auto-translate
    translateText();
}

// Keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
    // Ctrl+Enter to translate
    document.getElementById('englishText').addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            translateText();
        }
    });

    // Focus on English text input on page load
    document.getElementById('englishText').focus();
});

// Allow Enter key in textarea for newlines but Ctrl+Enter for translation
document.getElementById('englishText').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        translateText();
    }
});

