def get_classic_pdf_template():
    # This new "Formal" design is inspired by your "Certificate of Honour" screenshot.
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Certificate</title>
        <style>
            @page { size: A4 landscape; margin: 0; }
            body { 
                margin: 0; padding: 0; width: 297mm; height: 210mm; 
                font-family: '{{ font_family }}', 'Times New Roman', serif; 
                background: white; 
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover; background-position: center;
                {% endif %}
                display: flex; align-items: center; justify-content: center;
            }
            .certificate-wrapper {
                width: 95%; height: 90%;
                border: 1.5px solid {{ primary_color }};
                padding: 5px;
            }
            .certificate-content {
                width: 100%; height: 100%;
                border: 4px solid {{ primary_color }};
                padding: 2rem;
                text-align: center;
                display: flex; flex-direction: column;
                position: relative;
            }
            header {
                flex-shrink: 0;
                margin-bottom: 1rem;
            }
            .logo { max-height: 80px; max-width: 150px; margin-bottom: 1rem; }
            .cert-title {
                font-size: 2.5rem; font-weight: 700; color: {{ primary_color }};
                text-transform: uppercase; letter-spacing: 0.2em;
            }
            main {
                flex-grow: 1;
                display: flex; flex-direction: column; justify-content: center;
            }
            .cert-subtitle { font-size: 1.1rem; color: {{ body_font_color }}; }
            .cert-recipient {
                font-size: 3.5rem; font-weight: 700;
                color: {{ body_font_color }}; margin: 1rem 0;
            }
            .cert-body { font-size: 1.1rem; color: {{ body_font_color }}; }
            .cert-course {
                font-size: 1.5rem; font-weight: 700;
                color: {{ secondary_color }}; text-transform: uppercase;
                margin-top: 1rem;
            }
            footer {
                flex-shrink: 0;
                display: flex; justify-content: space-between;
                width: 80%; margin: 2rem auto 0;
            }
            .signature-block { width: 45%; }
            .signature-line {
                border-top: 1.5px solid {{ body_font_color }};
                padding-top: 0.5rem; font-size: 1rem; font-weight: 600;
            }
            .signature-label { font-size: 0.8rem; color: #666; }
            .qr-code { position: absolute; bottom: 1rem; right: 1rem; }
            .verification-id {
                position: absolute; bottom: 1rem; left: 1rem;
                font-size: 0.7rem; color: #999;
            }
        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="certificate-content">
                <header>
                    {% if logo_base64 %}<img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">{% endif %}
                    <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Completion') }}</h1>
                </header>
                <main>
                    <p class="cert-subtitle">This is to certify that</p>
                    <h2 class="cert-recipient">{{ recipient_name }}</h2>
                    <p class="cert-body">{{ custom_text.get('body', 'has successfully completed the course') }}</p>
                    <p class="cert-course">{{ course_title }}</p>
                </main>
                <footer>
                    <div class="signature-block">
                        <p class="signature-line">{{ issue_date }}</p>
                        <p class="signature-label">Date</p>
                    </div>
                    <div class="signature-block">
                        <p class="signature-line">{{ signature }}</p>
                        <p class="signature-label">Signature</p>
                    </div>
                </footer>
                <div class="qr-code">
                    <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" style="width: 70px; height: 70px;">
                </div>
                <div class="verification-id">
                    <p>Verify at {{ frontend_url }}<br>ID: {{ verification_id }}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_modern_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Certificate</title>
        <style>
            @page { size: A4 landscape; margin: 0; }
            body { 
                margin: 0; padding: 0; width: 297mm; height: 210mm; 
                font-family: '{{ font_family }}', sans-serif; 
                background: #111827;
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover; background-position: center;
                {% endif %}
                display: flex;
            }
            .sidebar {
                width: 38%; background-color: {{ primary_color }}; color: white;
                display: flex; flex-direction: column; justify-content: space-between;
                align-items: center; padding: 3rem; text-align: center;
            }
            .logo { 
                width: 130px; height: 130px; object-fit: contain; background: white;
                border-radius: 50%; padding: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            .issuer-name { font-size: 1.5rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 1.5rem; }
            .qr-code { background: white; padding: 8px; border-radius: 8px; }
            .qr-code img { width: 100px; height: 100px; }
            .main-content {
                width: 62%; padding: 3rem 4rem;
                display: flex; flex-direction: column; justify-content: center;
                color: {{ body_font_color }}; background-color: white;
            }
            .cert-title { font-size: 1.2rem; text-transform: uppercase; letter-spacing: 0.3em; color: #9ca3af; }
            .cert-recipient {
                font-size: 4rem; font-weight: 800;
                color: {{ primary_color }}; margin: 0.5rem 0;
            }
            .cert-body { font-size: 1.2rem; color: #4b5563; margin-bottom: 2rem; }
            .cert-course { font-size: 2.2rem; font-weight: 700; color: {{ secondary_color }}; }
            .footer { 
                margin-top: auto; padding-top: 1.5rem; 
                border-top: 2px solid {{ primary_color }};
                display: flex; justify-content: space-between; 
                font-size: 0.9rem; color: #6b7280;
            }
            .footer-item { display: flex; flex-direction: column; }
            .footer-label { font-weight: bold; margin-bottom: 0.25rem; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div>
                {% if logo_base64 %}<img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">{% endif %}
                <p class="issuer-name">{{ issuer_name }}</p>
            </div>
            <div class="qr-code">
                <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code">
            </div>
        </div>
        <div class="main-content">
            <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Achievement') }}</h1>
            <h2 class="cert-recipient">{{ recipient_name }}</h2>
            <p class="cert-body">{{ custom_text.get('body', 'has successfully completed') }}</p>
            <p class="cert-course">{{ course_title }}</p>
            <div class="footer">
                <div class="footer-item">
                    <span class="footer-label">Date Issued</span>
                    <span>{{ issue_date }}</span>
                </div>
                <div class="footer-item">
                    <span class="footer-label">Signature</span>
                    <span>{{ signature }}</span>
                </div>
                <div class="footer-item" style="text-align: right;">
                    <span class="footer-label">Verification ID</span>
                    <span>{{ verification_id }}</span>
                </div>
            </div>
        </div>
    </body>
    </html>
    """