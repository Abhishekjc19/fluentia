#!/usr/bin/env python3
"""
Resume Parser Utility
Extracts text content from PDF and DOCX resumes
"""

import sys
import json
import os
from pathlib import Path

def parse_pdf(file_path):
    """Parse PDF resume and extract text"""
    try:
        import PyPDF2
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except ImportError:
        return {"error": "PyPDF2 not installed. Run: pip install PyPDF2"}
    except Exception as e:
        return {"error": f"Error parsing PDF: {str(e)}"}

def parse_docx(file_path):
    """Parse DOCX resume and extract text"""
    try:
        from docx import Document
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except ImportError:
        return {"error": "python-docx not installed. Run: pip install python-docx"}
    except Exception as e:
        return {"error": f"Error parsing DOCX: {str(e)}"}

def parse_txt(file_path):
    """Parse plain text resume"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except Exception as e:
        return {"error": f"Error reading text file: {str(e)}"}

def parse_resume(file_path):
    """Main function to parse resume based on file extension"""
    if not os.path.exists(file_path):
        return {"error": f"File not found: {file_path}"}
    
    file_extension = Path(file_path).suffix.lower()
    
    if file_extension == '.pdf':
        text = parse_pdf(file_path)
    elif file_extension in ['.docx', '.doc']:
        text = parse_docx(file_path)
    elif file_extension == '.txt':
        text = parse_txt(file_path)
    else:
        return {"error": f"Unsupported file format: {file_extension}"}
    
    if isinstance(text, dict) and "error" in text:
        return text
    
    # Extract basic information (simple extraction)
    lines = text.split('\n')
    
    return {
        "success": True,
        "full_text": text,
        "line_count": len(lines),
        "char_count": len(text),
        "preview": text[:500] if len(text) > 500 else text
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python resume_parser.py <file_path>"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = parse_resume(file_path)
    print(json.dumps(result, indent=2))
