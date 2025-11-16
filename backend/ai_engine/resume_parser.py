import PyPDF2
from .nlp_utils import extract_skills_from_text, extract_email, extract_phone


def extract_text_from_pdf(pdf_file):
    """Extract text from PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""


def parse_resume(pdf_file):
    """Parse resume and extract structured data."""
    raw_text = extract_text_from_pdf(pdf_file)
    
    if not raw_text:
        return {
            'raw_text': '',
            'skills': [],
            'email': None,
            'phone': None
        }
    
    skills = extract_skills_from_text(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)
    
    return {
        'raw_text': raw_text,
        'skills': skills,
        'email': email,
        'phone': phone
    }
