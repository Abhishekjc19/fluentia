# Resume Upload Feature Setup

## Overview

The application now supports resume upload to generate personalized interview questions based on your experience and skills.

## Features Added:

1. **Resume Upload**: Upload PDF, DOCX, DOC, or TXT resumes (max 5MB)
2. **AI-Personalized Questions**: Questions are generated based on your resume content
3. **Voice Input**: Answer questions using voice instead of typing
4. **Speech-to-Text**: Automatic transcription using browser's Web Speech API

## Python Setup (Required for Resume Parsing)

### Install Python

1. Download Python 3.8+ from [python.org](https://www.python.org/downloads/)
2. During installation, make sure to check "Add Python to PATH"
3. Verify installation:
   ```bash
   python --version
   ```

### Install Dependencies

Run the following command in the backend directory:

```bash
cd backend
python -m pip install -r requirements.txt
```

This installs:

- `PyPDF2`: For PDF resume parsing
- `python-docx`: For DOCX/DOC resume parsing

### Without Python

If Python is not installed, the application will still work:

- Resume upload feature won't work
- Generic interview questions will be used instead
- Voice input will still function (browser-based)

## Usage

### 1. Starting an Interview with Resume

1. Go to **Interview Setup** page
2. Select interview type (Tech or HR)
3. Click **"Choose file"** to upload your resume
4. Click **"Start Interview"**
5. Questions will be personalized based on your resume

### 2. Using Voice Input

1. During the interview, toggle to **Voice mode**
2. Click **"Start Voice Recording"**
3. Speak your answer clearly
4. Click **"Stop Recording"** when done
5. Review the transcribed text
6. Submit your answer

### Browser Compatibility

- **Voice Input**: Chrome, Edge (full support)
- **Camera**: All modern browsers
- **Resume Upload**: All modern browsers

## Technical Details

### Resume Parser

- **Location**: `backend/src/utils/resume_parser.py`
- **Supported Formats**: PDF, DOCX, DOC, TXT
- **Max Size**: 5MB
- **Processing**: Text extraction with metadata

### Voice Recognition

- **API**: Web Speech API (browser-native)
- **Language**: English (US)
- **Mode**: Continuous recognition with interim results
- **Automatic**: Real-time transcription

### API Endpoints Updated

- `POST /api/interviews/start`: Now accepts `multipart/form-data` with optional `resume` file
- Response includes `resumeBasedQuestions: boolean` flag

## Troubleshooting

### Resume Upload Not Working

- Ensure Python is installed and in PATH
- Check Python dependencies are installed
- Verify file format is supported
- Check file size is under 5MB

### Voice Input Not Working

- Use Chrome or Edge browser
- Allow microphone permissions when prompted
- Check microphone is not used by another application
- Ensure HTTPS or localhost (required for Web Speech API)

### Questions Not Personalized

- Verify resume was uploaded successfully
- Check backend logs for parsing errors
- Fallback: Generic questions will be used if parsing fails

## Next Steps

1. Install Python if not already installed
2. Install Python dependencies
3. Restart the backend server
4. Test resume upload feature
5. Try voice input during interview

## Contact

If you encounter issues, check the console logs or contact support.
