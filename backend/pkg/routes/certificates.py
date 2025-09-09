from flask import Blueprint, request, jsonify, render_template_string, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import db, Certificate, Template, User
import csv
from io import StringIO, BytesIO
import qrcode
import base64
import os
from weasyprint import HTML, CSS
from ..extensions import mail 
from flask_mail import Message

certificate_bp = Blueprint('certificates', __name__)

def parse_flexible_date(date_string):
    """
    Tries to parse a date string from a list of common formats.
    """
    # List of formats to try, in order of preference
    formats_to_try = [
        '%Y-%m-%d',  # YYYY-MM-DD
        '%m/%d/%Y',  # MM/DD/YYYY
        '%m-%d-%Y',  # MM-DD-YYYY
        '%d-%b-%Y',  # DD-Mon-YYYY (e.g., 25-Dec-2024)
    ]
    for fmt in formats_to_try:
        try:
            return datetime.strptime(date_string, fmt).date()
        except ValueError:
            continue
    # If no format matches, raise an error
    raise ValueError(f"Date '{date_string}' could not be parsed. Use a common format like YYYY-MM-DD or MM/DD/YYYY.")

# --- Helper functions for image encoding and templates ---
def get_image_as_base64(image_path):
    if not image_path: return None
    try:
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image {image_path}: {e}")
    return None

def get_modern_pdf_template():
    """Enhanced Modern Template - Clean, sophisticated, and minimalist"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            html, body { 
                width: 100%; 
                height: 100%; 
                font-family: 'Inter', '{{ font_family }}', sans-serif; 
                overflow: hidden;
            }
            
            body { 
                display: flex; 
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                position: relative;
            }
            
            /* Subtle background pattern */
            body::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0);
                background-size: 40px 40px;
                opacity: 0.4;
                z-index: 0;
            }
            
            .sidebar { 
                width: 35%; 
                background: linear-gradient(135deg, {{ primary_color }} 0%, {{ secondary_color }} 100%);
                padding: 60px 40px; 
                display: flex; 
                flex-direction: column; 
                justify-content: space-between; 
                align-items: center; 
                text-align: center; 
                color: white; 
                position: relative;
                z-index: 1;
            }
            
            /* Elegant decorative elements */
            .sidebar::before {
                content: '';
                position: absolute;
                top: 40px; right: -20px;
                width: 40px; height: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
                z-index: -1;
            }
            
            .sidebar::after {
                content: '';
                position: absolute;
                bottom: 80px; left: -15px;
                width: 30px; height: 30px;
                background: rgba(255,255,255,0.08);
                border-radius: 50%;
                z-index: -1;
            }
            
            .main-content {
                width: 65%;
                padding: 80px 60px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: #ffffff;
                color: #1a202c;
                position: relative;
                z-index: 1;
            }
            
            /* Elegant accent line */
            .main-content::before {
                content: '';
                position: absolute;
                top: 0; left: 0;
                width: 100px; height: 4px;
                background: linear-gradient(90deg, {{ primary_color }}, {{ secondary_color }});
                border-radius: 2px;
            }
            
            .logo-container {
                position: relative;
                margin-bottom: 30px;
            }
            
            .logo { 
                width: 100px; 
                height: 100px; 
                object-fit: cover; 
                border-radius: 20px; 
                border: 3px solid rgba(255,255,255,0.2); 
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
            }
            
            .issuer-name { 
                font-size: 1.1em; 
                font-weight: 600; 
                margin-top: 20px; 
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            
            .qr-container {
                position: relative;
            }
            
            .qr-code { 
                width: 90px; 
                height: 90px; 
                background: rgba(255,255,255,0.95); 
                padding: 8px; 
                border-radius: 16px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                backdrop-filter: blur(10px);
            }
            
            /* Typography hierarchy */
            .certificate-title { 
                font-size: 1.4em; 
                color: {{ primary_color }}; 
                margin: 0 0 20px 0; 
                font-weight: 300; 
                letter-spacing: 2px; 
                text-transform: uppercase;
                position: relative;
            }
            
            .certificate-title::after {
                content: '';
                position: absolute;
                bottom: -8px; left: 0;
                width: 60px; height: 2px;
                background: {{ primary_color }};
                opacity: 0.6;
            }
            
            .recipient-name { 
                font-size: 3.8em; 
                color: #1a202c; 
                margin: 30px 0; 
                font-weight: 700; 
                line-height: 1.1;
                letter-spacing: -0.5px;
            }
            
            .completion-text { 
                font-size: 1.2em; 
                color: #4a5568; 
                margin: 10px 0;
                font-weight: 400;
            }
            
            .course-title { 
                font-size: 2em; 
                font-weight: 600; 
                margin: 25px 0 40px 0; 
                color: {{ primary_color }};
                line-height: 1.3;
            }
            
            /* Enhanced footer */
            .footer-section {
                margin-top: auto;
                padding-top: 40px;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
                font-size: 0.95em;
            }
            
            .footer-item { 
                text-align: center;
                position: relative;
            }
            
            .footer-item p { 
                font-weight: 600; 
                color: #2d3748; 
                margin-bottom: 8px;
                font-size: 1.1em;
            }
            
            .footer-item span { 
                font-size: 0.85em; 
                color: #718096;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Verification ID styling */
            .verification-item {
                text-align: right;
                font-size: 0.85em;
                color: #718096;
            }
            
            .verification-item p {
                font-weight: 500;
                margin-bottom: 4px;
            }
            
            .verification-item span {
                font-family: 'Monaco', monospace;
                background: #f7fafc;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
            }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div>
                <div class="logo-container">
                    {% if logo_base64 %}
                    <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
                    {% endif %}
                </div>
                <p class="issuer-name">{{ issuer_name }}</p>
            </div>
            <div class="qr-container">
                <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
            </div>
        </div>
        <div class="main-content">
            <div>
                <h1 class="certificate-title">Certificate of Achievement</h1>
                <h2 class="recipient-name">{{ recipient_name }}</h2>
                <p class="completion-text">has successfully completed the course</p>
                <p class="course-title">{{ course_title }}</p>
            </div>
            <div class="footer-section">
                <div class="footer">
                    <div class="footer-item">
                        <p>{{ signature }}</p>
                        <span>Authorized Signature</span>
                    </div>
                    <div class="footer-item">
                        <p>{{ issue_date }}</p>
                        <span>Date of Issue</span>
                    </div>
                    <div class="footer-item verification-item">
                        <p>Verification ID</p>
                        <span>{{ verification_id }}</span>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_classic_pdf_template():
    """Enhanced Classic Template - Timeless elegance with refined details"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
            @page { size: A4 landscape; margin: 0; }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                margin: 0; 
                padding: 40px; 
                font-family: 'Crimson Text', '{{ font_family }}', serif; 
                text-align: center; 
                color: {{ body_font_color }}; 
                height: 100vh; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                background: linear-gradient(45deg, #fefefe 0%, #f8f9fa 100%);
                position: relative;
                overflow: hidden;
            }
            
            /* Ornate corner decorations */
            body::before, body::after {
                content: '';
                position: absolute;
                width: 120px; height: 120px;
                background-image: 
                    radial-gradient(circle at center, {{ primary_color }}22 2px, transparent 2px),
                    radial-gradient(circle at center, {{ secondary_color }}15 1px, transparent 1px);
                background-size: 20px 20px, 10px 10px;
            }
            
            body::before {
                top: 20px; left: 20px;
                border-top: 4px solid {{ primary_color }};
                border-left: 4px solid {{ primary_color }};
            }
            
            body::after {
                bottom: 20px; right: 20px;
                border-bottom: 4px solid {{ primary_color }};
                border-right: 4px solid {{ primary_color }};
            }
            
            /* Elegant outer border */
            .certificate-border {
                position: absolute;
                top: 20px; left: 20px; right: 20px; bottom: 20px;
                border: 3px double {{ primary_color }};
                border-radius: 8px;
                z-index: 1;
            }
            
            /* Inner content border */
            .content-wrapper { 
                padding: 50px; 
                border: 2px solid {{ secondary_color }}; 
                width: calc(100% - 80px); 
                height: calc(100% - 80px); 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                background: rgba(255,255,255,0.9);
                border-radius: 4px;
                position: relative;
                z-index: 2;
                backdrop-filter: blur(10px);
            }
            
            /* Decorative flourishes */
            .content-wrapper::before {
                content: '❦';
                position: absolute;
                top: 30px;
                font-size: 2em;
                color: {{ primary_color }};
                opacity: 0.6;
            }
            
            .logo { 
                max-width: 100px; 
                margin-bottom: 25px; 
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .certificate-header { 
                font-family: 'Playfair Display', serif;
                font-size: 3.2em; 
                color: {{ primary_color }}; 
                margin-bottom: 20px; 
                font-variant: small-caps; 
                font-weight: 600;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
                letter-spacing: 2px;
            }
            
            .presented-text { 
                font-size: 1.3em; 
                margin: 15px 0; 
                font-style: italic;
                color: #4a5568;
            }
            
            .recipient-name { 
                font-family: 'Playfair Display', serif; 
                font-size: 4.2em; 
                font-weight: 700; 
                margin: 25px 0; 
                color: {{ body_font_color }}; 
                text-shadow: 0 2px 8px rgba(0,0,0,0.1);
                letter-spacing: -1px;
                position: relative;
            }
            
            /* Elegant underline for recipient name */
            .recipient-name::after {
                content: '';
                position: absolute;
                bottom: -10px; left: 50%; transform: translateX(-50%);
                width: 200px; height: 2px;
                background: linear-gradient(90deg, transparent, {{ primary_color }}, transparent);
                opacity: 0.7;
            }
            
            .completion-text { 
                font-size: 1.3em; 
                margin: 20px 0; 
                color: #4a5568;
            }
            
            .course-title { 
                font-size: 2.2em; 
                font-weight: 600; 
                color: {{ primary_color }};
                margin: 20px 0 40px 0;
                font-family: 'Playfair Display', serif;
            }
            
            .footer { 
                display: flex; 
                justify-content: space-around; 
                width: 85%; 
                margin-top: 50px;
            }
            
            .footer-item { 
                text-align: center; 
                position: relative;
            }
            
            .footer-item p { 
                margin: 0; 
                font-weight: 600; 
                border-top: 2px solid {{ primary_color }}; 
                padding-top: 12px; 
                min-width: 180px; 
                font-size: 1.1em;
                background: linear-gradient(0deg, rgba(255,255,255,0.8), transparent);
                backdrop-filter: blur(5px);
            }
            
            .footer-item span { 
                font-size: 0.95em; 
                color: #666; 
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 500;
            }
            
            .qr-position { 
                position: absolute; 
                bottom: 50px; 
                left: 50px; 
                z-index: 3;
            }
            
            .qr-code { 
                width: 75px; 
                height: 75px; 
                border: 3px solid white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
        </style>
    </head>
    <body>
        <div class="certificate-border"></div>
        <div class="content-wrapper">
            {% if logo_base64 %}
            <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
            {% endif %}
            <h1 class="certificate-header">Certificate of Completion</h1>
            <p class="presented-text">This certificate is proudly presented to</p>
            <p class="recipient-name">{{ recipient_name }}</p>
            <p class="completion-text">in recognition of the successful completion of</p>
            <p class="course-title">{{ course_title }}</p>
            <div class="footer">
                <div class="footer-item">
                    <p>{{ issue_date }}</p>
                    <span>Date</span>
                </div>
                <div class="footer-item">
                    <p>{{ signature }}</p>
                    <span>Authorized Signature</span>
                </div>
            </div>
        </div>
        <div class="qr-position">
            <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
        </div>
    </body>
    </html>
    """

def get_corporate_pdf_template():
    """Enhanced Corporate Template - Professional and sophisticated"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@300;400;600;700&family=Montserrat:wght@400;500;600;700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Source Sans Pro', '{{ font_family }}', sans-serif; 
                height: 100vh; 
                display: flex; 
                flex-direction: column; 
                background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                position: relative;
            }
            
            /* Subtle geometric background */
            body::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: 
                    linear-gradient(30deg, transparent 40%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.1) 60%, transparent 60%);
                background-size: 100px 100px;
                z-index: 0;
            }
            
            .header { 
                background: linear-gradient(135deg, {{ primary_color }} 0%, {{ secondary_color }} 100%); 
                color: white; 
                padding: 30px 60px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                position: relative;
                z-index: 2;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            /* Elegant header accent */
            .header::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0; right: 0;
                height: 4px;
                background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1), rgba(255,255,255,0.3));
            }
            
            .header .logo { 
                max-height: 70px; 
                max-width: 180px; 
                filter: brightness(0) invert(1);
                border-radius: 4px;
            }
            
            .header .issuer { 
                text-align: right; 
                font-weight: 600; 
                font-size: 1.3em;
                font-family: 'Montserrat', sans-serif;
                letter-spacing: 0.5px;
            }
            
            .main { 
                flex-grow: 1; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                text-align: center; 
                padding: 80px 60px;
                background: white;
                position: relative;
                z-index: 1;
            }
            
            /* Decorative side accents */
            .main::before, .main::after {
                content: '';
                position: absolute;
                top: 50%; transform: translateY(-50%);
                width: 4px; height: 150px;
                background: linear-gradient(180deg, {{ primary_color }}, {{ secondary_color }});
                border-radius: 2px;
            }
            
            .main::before { left: 60px; }
            .main::after { right: 60px; }
            
            .certificate-type { 
                font-size: 1.3em; 
                color: #718096; 
                margin-bottom: 20px;
                text-transform: uppercase;
                letter-spacing: 2px;
                font-weight: 300;
            }
            
            .main h1 { 
                font-family: 'Montserrat', sans-serif;
                font-size: 4.5em; 
                color: {{ body_font_color }}; 
                margin: 0 0 30px 0; 
                font-weight: 700;
                letter-spacing: -2px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .completion-text { 
                font-size: 1.3em; 
                color: #4a5568; 
                margin: 20px 0;
                font-weight: 400;
            }
            
            .course-title { 
                font-size: 2.5em; 
                color: {{ primary_color }}; 
                font-weight: 600; 
                margin: 25px 0;
                font-family: 'Montserrat', sans-serif;
                line-height: 1.2;
                position: relative;
            }
            
            /* Elegant course title accent */
            .course-title::before, .course-title::after {
                content: '';
                position: absolute;
                top: 50%; transform: translateY(-50%);
                width: 60px; height: 2px;
                background: {{ secondary_color }};
                opacity: 0.6;
            }
            
            .course-title::before { left: -100px; }
            .course-title::after { right: -100px; }
            
            .footer { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                padding: 40px 60px; 
                border-top: 3px solid {{ secondary_color }};
                background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
                position: relative;
                z-index: 2;
            }
            
            .footer::before {
                content: '';
                position: absolute;
                top: 0; left: 50%; transform: translateX(-50%);
                width: 100px; height: 3px;
                background: {{ primary_color }};
                margin-top: -1.5px;
            }
            
            .footer-item { 
                text-align: center; 
                position: relative;
            }
            
            .signature-line {
                border-bottom: 2px solid {{ body_font_color }};
                padding-bottom: 8px;
                margin-bottom: 8px;
                min-width: 200px;
            }
            
            .footer-item p { 
                margin: 0; 
                font-weight: 600; 
                font-size: 1.2em; 
                color: {{ body_font_color }};
            }
            
            .footer-item span { 
                font-size: 0.95em; 
                color: #718096; 
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 500;
            }
            
            .qr-container {
                position: relative;
            }
            
            .qr-code { 
                width: 90px; 
                height: 90px;
                border: 4px solid white;
                border-radius: 8px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.15);
            }
        </style>
    </head>
    <body>
        <div class="header">
            {% if logo_base64 %}
            <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
            {% endif %}
            <div class="issuer">{{ issuer_name }}</div>
        </div>
        <div class="main">
            <p class="certificate-type">Certificate of Completion</p>
            <h1>{{ recipient_name }}</h1>
            <p class="completion-text">has successfully completed the program</p>
            <p class="course-title">{{ course_title }}</p>
        </div>
        <div class="footer">
            <div class="footer-item">
                <div class="signature-line">
                    <p>{{ signature }}</p>
                </div>
                <span>Authorized Signature</span>
            </div>
            <div class="qr-container">
                <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
            </div>
            <div class="footer-item">
                <div class="signature-line">
                    <p>{{ issue_date }}</p>
                </div>
                <span>Date of Issue</span>
            </div>
        </div>
    </body>
    </html>
    """

def get_creative_pdf_template():
    """Enhanced Creative Template - Bold, modern, and visually striking"""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
            @page { size: A4 landscape; margin: 0; }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
                margin: 0; 
                padding: 0; 
                font-family: 'Space Grotesk', '{{ font_family }}', sans-serif; 
                height: 100vh; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
                color: white; 
                position: relative;
                overflow: hidden;
            }
            
            /* Dynamic background elements */
            .bg-elements {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 0;
            }
            
            .bg-shape1 { 
                position: absolute; 
                top: -10%; 
                right: -5%; 
                width: 40%; 
                height: 60%; 
                background: linear-gradient(135deg, {{ primary_color }}40, {{ secondary_color }}20);
                clip-path: polygon(30% 0%, 100% 0%, 70% 100%, 0% 100%);
                filter: blur(1px);
            }
            
            .bg-shape2 { 
                position: absolute; 
                bottom: -10%; 
                left: -5%; 
                width: 35%; 
                height: 50%; 
                background: linear-gradient(45deg, {{ secondary_color }}35, {{ primary_color }}15);
                clip-path: circle(50% at 30% 70%);
                filter: blur(2px);
            }
            
            .bg-grid {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: 
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
                background-size: 50px 50px;
                opacity: 0.4;
            }
            
            .content { 
                z-index: 1; 
                width: 90%; 
                max-width: 1000px;
                padding: 60px;
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(20px);
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                position: relative;
            }
            
            /* Glowing accent border */
            .content::before {
                content: '';
                position: absolute;
                top: -2px; left: -2px; right: -2px; bottom: -2px;
                background: linear-gradient(135deg, {{ primary_color }}, {{ secondary_color }}, {{ primary_color }});
                border-radius: 22px;
                z-index: -1;
                opacity: 0.6;
                filter: blur(4px);
            }
            
            .header { 
                display: flex; 
                align-items: center; 
                justify-content: space-between;
                margin-bottom: 50px;
                padding-bottom: 30px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            
            .logo-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .logo { 
                max-height: 70px; 
                border-radius: 12px;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.1);
            }
            
            .issuer { 
                font-size: 1.4em; 
                font-weight: 600;
                color: {{ primary_color }};
                text-shadow: 0 0 20px rgba(255,255,255,0.1);
            }
            
            .certificate-badge {
                background: linear-gradient(135deg, {{ primary_color }}20, {{ secondary_color }}20);
                padding: 8px 16px;
                border-radius: 20px;
                border: 1px solid {{ primary_color }}40;
                font-size: 0.9em;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-weight: 500;
            }
            
            .main-content {
                text-align: center;
                margin: 60px 0;
            }
            
            .award-text { 
                font-size: 1.3em; 
                font-weight: 300; 
                margin-bottom: 20px;
                color: #cbd5e1;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            
            .recipient-name { 
                font-size: 5em; 
                font-weight: 700; 
                margin: 30px 0; 
                line-height: 1;
                background: linear-gradient(135deg, #ffffff, {{ primary_color }}, #ffffff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 0 30px rgba(255,255,255,0.2);
                letter-spacing: -2px;
            }
            
            .course-title { 
                font-size: 2.5em; 
                font-weight: 600; 
                color: {{ primary_color }}; 
                margin: 30px 0;
                line-height: 1.2;
                text-shadow: 0 0 20px {{ primary_color }}40;
            }
            
            .achievement-line {
                width: 200px;
                height: 2px;
                background: linear-gradient(90deg, transparent, {{ secondary_color }}, transparent);
                margin: 30px auto;
                position: relative;
            }
            
            .achievement-line::before {
                content: '';
                position: absolute;
                left: 50%; top: 50%;
                transform: translate(-50%, -50%);
                width: 8px; height: 8px;
                background: {{ secondary_color }};
                border-radius: 50%;
                box-shadow: 0 0 10px {{ secondary_color }};
            }
            
            .footer { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
                margin-top: 80px; 
                padding-top: 40px; 
                border-top: 1px solid rgba(255,255,255,0.1);
                position: relative;
            }
            
            /* Glowing footer accent */
            .footer::before {
                content: '';
                position: absolute;
                top: 0; left: 50%; transform: translateX(-50%);
                width: 100px; height: 1px;
                background: linear-gradient(90deg, transparent, {{ primary_color }}, transparent);
                box-shadow: 0 0 10px {{ primary_color }};
            }
            
            .footer-left { 
                text-align: left;
                flex: 1;
            }
            
            .footer-left p { 
                margin: 8px 0; 
                font-size: 1.1em;
            }
            
            .date-label, .signature-label, .id-label {
                color: #94a3b8;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 1px;
                font-size: 0.85em;
            }
            
            .date-value, .signature-value {
                color: white;
                font-weight: 600;
                font-size: 1.1em;
            }
            
            .verification-id {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.75em;
                color: #64748b;
                background: rgba(255,255,255,0.05);
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid rgba(255,255,255,0.1);
                display: inline-block;
                margin-top: 4px;
            }
            
            .qr-container {
                position: relative;
                margin-left: 40px;
            }
            
            .qr-code { 
                width: 100px; 
                height: 100px;
                border-radius: 12px;
                border: 2px solid rgba(255,255,255,0.2);
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                background: rgba(255,255,255,0.95);
                padding: 8px;
            }
            
            .qr-glow {
                position: absolute;
                top: -4px; left: -4px; right: -4px; bottom: -4px;
                background: linear-gradient(135deg, {{ primary_color }}40, {{ secondary_color }}40);
                border-radius: 16px;
                z-index: -1;
                filter: blur(8px);
            }
        </style>
    </head>
    <body>
        <div class="bg-elements">
            <div class="bg-shape1"></div>
            <div class="bg-shape2"></div>
            <div class="bg-grid"></div>
        </div>
        
        <div class="content">
            <div class="header">
                <div class="logo-section">
                    {% if logo_base64 %}
                    <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
                    {% endif %}
                    <span class="issuer">{{ issuer_name }}</span>
                </div>
                <div class="certificate-badge">Achievement Certificate</div>
            </div>
            
            <div class="main-content">
                <p class="award-text">This certificate is awarded to</p>
                <h1 class="recipient-name">{{ recipient_name }}</h1>
                <div class="achievement-line"></div>
                <p class="course-title">{{ course_title }}</p>
            </div>
            
            <div class="footer">
                <div class="footer-left">
                    <p><span class="date-label">Issued on:</span> <span class="date-value">{{ issue_date }}</span></p>
                    <p><span class="signature-label">Authorized by:</span> <span class="signature-value">{{ signature }}</span></p>
                    <p><span class="id-label">Verification ID:</span> <span class="verification-id">{{ verification_id }}</span></p>
                </div>
                <div class="qr-container">
                    <div class="qr-glow"></div>
                    <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def generate_pdf_in_memory(certificate, template):
    """Helper to generate PDF bytes for email attachment."""
    frontend_url = current_app.config['FRONTEND_URL']
    verification_url = f"{frontend_url}/verify/{certificate.verification_id}"
    qr_img = qrcode.make(verification_url)
    buffered_qr = BytesIO()
    qr_img.save(buffered_qr, format="PNG")
    qr_base64 = base64.b64encode(buffered_qr.getvalue()).decode('utf-8')
    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)
    
    if template.layout_style == 'modern': html_template = get_modern_pdf_template()
    elif template.layout_style == 'classic': html_template = get_classic_pdf_template()
    elif template.layout_style == 'corporate': html_template = get_corporate_pdf_template()
    elif template.layout_style == 'creative': html_template = get_creative_pdf_template()
    else: html_template = get_modern_pdf_template()

    html_content = render_template_string(
        html_template,
        recipient_name=certificate.recipient_name,
        course_title=certificate.course_title,
        issue_date=certificate.issue_date.strftime('%B %d, %Y'),
        signature=certificate.signature or certificate.issuer_name,
        issuer_name=certificate.issuer_name,
        verification_id=certificate.verification_id,
        logo_base64=logo_base64,
        background_base64=background_base64,
        primary_color=template.primary_color,
        secondary_color=template.secondary_color,
        body_font_color=template.body_font_color,
        font_family=template.font_family,
        qr_base64=qr_base64
    )
    return HTML(string=html_content).write_pdf()

# --- All other routes remain the same ---

@certificate_bp.route('/', methods=['POST'])
@jwt_required(locations=["headers"])
def create_certificate():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user: return jsonify({"msg": "User not found"}), 404
    if user.cert_quota <= 0: return jsonify({"msg": "Certificate quota exceeded"}), 403

    data = request.get_json()
    required_fields = ['recipient_name', 'recipient_email', 'course_title', 'issue_date', 'template_id']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    template_id = data.get('template_id')
    template = Template.query.get(template_id)
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found"}), 404

    try:
        issue_date_obj = parse_flexible_date(data['issue_date'])
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    new_certificate = Certificate(
        user_id=user_id, 
        template_id=template.id, 
        recipient_name=data['recipient_name'],
        recipient_email=data['recipient_email'],
        course_title=data['course_title'], 
        issue_date=issue_date_obj,
        signature=data.get('signature', ''),
        issuer_name=data.get('issuer_name', user.name)
    )
    
    user.cert_quota -= 1
    db.session.add(new_certificate)
    db.session.commit()
    return jsonify({"msg": "Certificate created successfully"}), 201

@certificate_bp.route('/bulk', methods=['POST'])
@jwt_required(locations=["headers"])
def bulk_create_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user: return jsonify({"msg": "User not found"}), 404

    if 'file' not in request.files or 'template_id' not in request.form:
        return jsonify({"msg": "Missing CSV file or template_id"}), 400

    template_id = request.form.get('template_id')
    template = Template.query.get(template_id)
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found"}), 404

    csv_file = request.files['file']
    if not csv_file.filename.endswith('.csv'): return jsonify({"msg": "File must be a CSV"}), 400

    try:
        decoded_content = csv_file.stream.read().decode("utf-8-sig")
        stream = StringIO(decoded_content)
        csv_rows = list(csv.DictReader(stream))

        if not csv_rows:
            return jsonify({"msg": "CSV file is empty or contains no data rows."}), 400

        required_fields = {'recipient_name', 'recipient_email', 'course_title', 'issue_date'}
        processed_headers = {header.strip() for header in csv_rows[0].keys()}
        
        missing_fields = required_fields - processed_headers
        if missing_fields:
            return jsonify({"msg": f"CSV is missing required columns: {', '.join(missing_fields)}"}), 400

        certificates, errors = [], []
        for row in csv_rows:
            if user.cert_quota <= 0:
                errors.append({"row": row, "error": "Certificate quota exceeded"})
                break
            try:
                stripped_row = {k.strip(): v.strip() for k, v in row.items()}

                certificates.append(Certificate(
                    user_id=user_id,
                    template_id=template_id,
                    recipient_name=stripped_row['recipient_name'],
                    recipient_email=stripped_row['recipient_email'],
                    course_title=stripped_row['course_title'],
                    issue_date=parse_flexible_date(stripped_row['issue_date']),
                    signature=stripped_row.get('signature', ''),
                    issuer_name=stripped_row.get('issuer_name', user.name)
                ))
                user.cert_quota -= 1
            except Exception as row_e:
                 errors.append({"row": row, "error": f"Invalid data in row: {str(row_e)}"})
        
        if certificates:
            db.session.add_all(certificates)
            db.session.commit()

        return jsonify({
            "msg": "Bulk certificate creation processed",
            "created": len(certificates), "errors": errors,
            "remaining_quota": user.cert_quota
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error processing CSV file: {str(e)}"}), 500

@certificate_bp.route('/<int:cert_id>', methods=['PUT'])
@jwt_required(locations=["headers"])
def update_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404

    data = request.get_json()
    if 'recipient_name' in data: certificate.recipient_name = data['recipient_name']
    if 'course_title' in data: certificate.course_title = data['course_title']
    if 'issuer_name' in data: certificate.issuer_name = data['issuer_name']
    if 'issue_date' in data:
        try:
            certificate.issue_date = parse_flexible_date(data['issue_date'])
        except ValueError as e:
            return jsonify({"msg": str(e)}), 400
    if 'signature' in data: certificate.signature = data['signature']
    if 'status' in data: certificate.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Certificate updated successfully"}), 200

@certificate_bp.route('/<int:cert_id>/email', methods=['POST'])
@jwt_required(locations=["headers"])
def send_certificate_email(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate: return jsonify({"msg": "Certificate not found"}), 404
    if not certificate.recipient_email: return jsonify({"msg": "Certificate has no recipient email"}), 400
        
    template = Template.query.get(certificate.template_id)
    issuer = User.query.get(certificate.user_id)
    frontend_url = current_app.config['FRONTEND_URL']

    try:
        pdf_data = generate_pdf_in_memory(certificate, template)
        msg = Message(subject=f"Your Certificate for {certificate.course_title}", recipients=[certificate.recipient_email])
        
        verification_url = f"{frontend_url}/verify/{certificate.verification_id}"
        msg.html = render_template_string("""
            <h3>Congratulations, {{ recipient_name }}!</h3>
            <p>You have successfully completed <strong>{{ course_title }}</strong>.</p>
            <p>Your official certificate from {{ issuer_name }} is attached to this email.</p>
            <p>You can also verify your certificate online here: <a href="{{ verification_url }}">Verify Certificate</a></p>
            <br><p>Best regards,<br>The CertifyMe Team</p>
        """, 
        recipient_name=certificate.recipient_name, 
        course_title=certificate.course_title, 
        issuer_name=issuer.name, 
        verification_url=verification_url)
        
        msg.attach(f"certificate-{certificate.verification_id}.pdf", "application/pdf", pdf_data)

        mail.send(msg)
        certificate.sent_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Email sent successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Failed to send email: {str(e)}"}), 500

@certificate_bp.route('/email-bulk', methods=['POST'])
@jwt_required(locations=["headers"])
def send_bulk_emails():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    cert_ids = data.get('certificate_ids', [])
    if not cert_ids: return jsonify({"msg": "No certificate IDs provided"}), 400

    certificates = Certificate.query.filter(Certificate.id.in_(cert_ids), Certificate.user_id == user_id).all()
    issuer = User.query.get(user_id)
    success_sends, failed_sends = [], []
    frontend_url = current_app.config['FRONTEND_URL']

    with mail.connect() as conn:
        for cert in certificates:
            if not cert.recipient_email:
                failed_sends.append({"id": cert.id, "reason": "No recipient email"})
                continue
            try:
                template = Template.query.get(cert.template_id)
                pdf_data = generate_pdf_in_memory(cert, template)
                msg = Message(subject=f"Your Certificate for {cert.course_title}", recipients=[cert.recipient_email])
                
                verification_url = f"{frontend_url}/verify/{cert.verification_id}"
                msg.html = render_template_string("""
                    <h3>Congratulations, {{ recipient_name }}!</h3>
                    <p>Your certificate for <strong>{{ course_title }}</strong> from {{ issuer_name }} is attached.</p>
                    <p>Verify it here: <a href="{{ verification_url }}">Verify Certificate</a></p>
                """, 
                recipient_name=cert.recipient_name, 
                course_title=cert.course_title, 
                issuer_name=issuer.name, 
                verification_url=verification_url)

                msg.attach(f"certificate-{cert.verification_id}.pdf", "application/pdf", pdf_data)
                
                conn.send(msg)
                cert.sent_at = datetime.utcnow()
                success_sends.append(cert.id)
            except Exception as e:
                failed_sends.append({"id": cert.id, "reason": str(e)})
    
    db.session.commit()
    return jsonify({"msg": "Bulk email process completed.", "sent": success_sends, "failed": failed_sends}), 200

@certificate_bp.route('/', methods=['GET'])
@jwt_required(locations=["headers"])
def get_user_certificates():
    user_id = int(get_jwt_identity())
    certificates = Certificate.query.filter_by(user_id=user_id).order_by(Certificate.created_at.desc()).all()
    certs_data = [{
        'id': c.id, 
        'recipient_name': c.recipient_name, 
        'course_title': c.course_title,
        'issue_date': c.issue_date.isoformat(),
        'sent_at': c.sent_at.isoformat() if c.sent_at else None,
        'status': c.status,
        'verification_id': c.verification_id
    } for c in certificates]
    return jsonify(certs_data), 200

@certificate_bp.route('/<int:cert_id>', methods=['DELETE'])
@jwt_required(locations=["headers"])
def delete_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found or does not belong to user"}), 404
    db.session.delete(certificate)
    db.session.commit()
    return jsonify({"msg": "Certificate deleted successfully"}), 200

@certificate_bp.route('/<int:cert_id>', methods=['GET'])
@jwt_required(locations=["headers"])
def get_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found or does not belong to user"}), 404
    cert_data = {'id': certificate.id, 'recipient_name': certificate.recipient_name, 'course_title': certificate.course_title, 'issuer_name': certificate.issuer_name, 'issue_date': certificate.issue_date.isoformat(), 'signature': certificate.signature, 'status': certificate.status, 'verification_id': certificate.verification_id, 'template_id': certificate.template_id}
    return jsonify(cert_data), 200

@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required(locations=["headers"])
def generate_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate: return jsonify({"msg": "Certificate not found"}), 404
    template = Template.query.get(certificate.template_id)
    if not template: return jsonify({"msg": "Template not found"}), 404
    frontend_url = current_app.config['FRONTEND_URL']
    verification_url = f"{frontend_url}/verify/{certificate.verification_id}"
    qr_img = qrcode.make(verification_url)
    buffered_qr = BytesIO()
    qr_img.save(buffered_qr, format="PNG")
    qr_base64 = base64.b64encode(buffered_qr.getvalue()).decode('utf-8')
    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)
    if template.layout_style == 'modern': html_template = get_modern_pdf_template()
    elif template.layout_style == 'classic': html_template = get_classic_pdf_template()
    elif template.layout_style == 'corporate': html_template = get_corporate_pdf_template()
    elif template.layout_style == 'creative': html_template = get_creative_pdf_template()
    else: html_template = get_modern_pdf_template()
    html_content = render_template_string(
        html_template,
        recipient_name=certificate.recipient_name, course_title=certificate.course_title,
        issue_date=certificate.issue_date.strftime('%B %d, %Y'),
        signature=certificate.signature or certificate.issuer_name,
        issuer_name=certificate.issuer_name, verification_id=certificate.verification_id,
        logo_base64=logo_base64, background_base64=background_base64,
        primary_color=template.primary_color, secondary_color=template.secondary_color,
        body_font_color=template.body_font_color, font_family=template.font_family,
        qr_base64=qr_base64
    )
    pdf_file = HTML(string=html_content).write_pdf()
    return Response(pdf_file, mimetype="application/pdf", headers={"Content-Disposition": f"attachment;filename=certificate_{certificate.verification_id}.pdf"})

@certificate_bp.route('/verify/<string:verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found", "status": "invalid"}), 404
    template = Template.query.get(certificate.template_id)
    user = User.query.get(certificate.user_id)
    cert_data = {'id': certificate.id, 'recipient_name': certificate.recipient_name, 'course_title': certificate.course_title, 'issue_date': certificate.issue_date.isoformat(), 'signature': certificate.signature, 'status': certificate.status, 'verification_id': certificate.verification_id, 'issuer_name': certificate.issuer_name, 'template': {'title': template.title, 'logo_url': template.logo_url, 'background_url': template.background_url, 'primary_color': template.primary_color, 'secondary_color': template.secondary_color, 'body_font_color': template.body_font_color, 'font_family': template.font_family, 'layout_style': template.layout_style } if template else None, 'issuer_org': user.name if user else 'Unknown'}
    return jsonify({"msg": "Certificate verified", "status": certificate.status, "certificate": cert_data}), 200