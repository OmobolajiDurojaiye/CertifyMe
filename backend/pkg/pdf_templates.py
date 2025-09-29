def get_classic_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;500;700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            body { 
                margin: 0; 
                padding: 0; 
                width: 297mm; 
                height: 210mm; 
                font-family: '{{ font_family }}', 'Roboto', sans-serif; 
                background: white;
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover;
                background-position: center;
                {% endif %}
                display: flex; 
                align-items: center; 
                justify-content: center;
            }
            .certificate-wrapper { 
                width: 95%; 
                height: 90%; 
                border: 8px double {{ primary_color }};
                background: rgba(255, 255, 255, 0.95); 
                box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
                position: relative; 
                display: flex;
                flex-direction: column;
            }
            .top-border {
                height: 12px;
                border-bottom: 4px solid {{ primary_color }};
                background: linear-gradient(to right, {{ primary_color }}, {{ secondary_color }});
                flex-shrink: 0;
            }
            .certificate-content { 
                flex-grow: 1;
                padding: 1rem 2.5rem; 
                text-align: center; 
                display: flex; 
                flex-direction: column; 
                justify-content: center;
                align-items: center;
            }
            .logo { 
                max-height: 100px; 
                max-width: 120px; 
                margin-bottom: 0.5rem; 
                object-fit: contain; 
            }
            .cert-title { 
                font-size: 2.5rem; 
                font-weight: 700; 
                color: {{ primary_color }}; 
                text-transform: uppercase; 
                letter-spacing: 0.1em;
                font-family: 'Playfair Display', serif;
                margin: 0;
            }
            .cert-subtitle { 
                font-size: 1.1rem; 
                color: #4B5EAA; 
                font-style: italic; 
                margin: 0.2rem 0;
            }
            .cert-recipient { 
                font-size: 3rem; 
                font-weight: 900; 
                color: {{ body_font_color }}; 
                margin: 0.5rem 0; 
                font-family: 'Georgia', serif;
            }
            .cert-body { 
                font-size: 1.2rem; 
                color: #4B5EAA; 
                font-style: italic; 
                margin: 0.2rem 0;
            }
            .cert-course { 
                font-size: 1.8rem; 
                font-weight: 700; 
                color: {{ secondary_color }}; 
                text-transform: uppercase; 
                margin: 0.5rem 0;
                font-family: 'Roboto', sans-serif;
            }
            .cert-date-text {
                font-size: 1.2rem;
                color: {{ body_font_color }};
                margin-top: 0.5rem;
            }
            .footer { 
                margin-top: auto; 
                padding-top: 1rem; 
                display: flex; 
                justify-content: space-around; 
                align-items: flex-start;
                width: 100%;
                font-size: 1rem; 
                color: {{ body_font_color }};
            }
            .signature-block {
                width: 45%;
                text-align: center;
            }
            .signature-value {
                font-size: 1.1rem;
                font-weight: 500;
                margin-bottom: 0.2rem;
            }
            .signature-image { 
                max-height: 45px; 
                max-width: 180px; 
                object-fit: contain; 
                margin-bottom: 0.2rem;
            }
            .signature-line {
                width: 60%;
                margin: 0.1rem auto;
                border: none;
                border-top: 1px solid {{ primary_color }};
            }
            .signature-label {
                font-size: 0.8rem;
                color: #6B7280;
            }
            .qr-block {
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                text-align: center;
                background: white;
                padding: 0.25rem;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .qr-block p {
                font-size: 0.6rem;
                margin: 0;
                color: #333;
                font-family: monospace;
            }
        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="top-border"></div>
            <div class="certificate-content">
                
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" class="logo" alt="Logo">
                {% endif %}
                
                <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Completion') }}</h1>
                <p class="cert-subtitle">This is to certify that</p>
                <h2 class="cert-recipient">{{ recipient_name }}</h2>
                <p class="cert-body">{{ custom_text.get('body', 'has successfully completed the course') }}</p>
                <p class="cert-course">{{ course_title }}</p>
                <p class="cert-date-text">Awarded on {{ issue_date }}</p>

                <div class="footer">
                    <div class="signature-block">
                        {% if signature_image_base64 %}
                        <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                        <p class="signature-value">{{ signature }}</p>
                        {% endif %}
                        <hr class="signature-line" />
                        <p class="signature-label">Authorized Signature</p>
                    </div>
                    <div class="signature-block">
                        <p class="signature-value">{{ issuer_name }}</p>
                        <hr class="signature-line" />
                        <p class="signature-label">Issuer</p>
                    </div>
                </div>

                <div class="qr-block">
                    <img src="data:image/png;base64,{{ qr_base64 }}" style="width: 70px; height: 70px;">
                    <p>{{ verification_id }}</p>
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
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Georgia&family=Dancing+Script:wght@700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            body { 
                margin: 0; padding: 0; width: 297mm; height: 210mm; 
                font-family: '{{ font_family }}', 'Lato', sans-serif; 
                background: white;
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover; background-position: center;
                {% endif %}
                display: flex; align-items: center; justify-content: center;
            }
            .certificate-wrapper { 
                width: 95%; height: 90%; border: 6px solid {{ primary_color }}; 
                border-radius: 12px; overflow: hidden; display: flex; 
            }
            .sidebar { 
                width: 35%; padding: 1rem; 
                background: linear-gradient(135deg, {{ primary_color }}, {{ secondary_color }}); 
                display: flex; flex-direction: column; justify-content: space-between; 
                align-items: center; color: white; 
            }
            .main-content { 
                width: 65%; padding: 2rem; background: rgba(255, 255, 255, 0.9); 
                display: flex; flex-direction: column; 
            }
            .logo { max-width: 100px; max-height: 100px; object-fit: contain; justify-self: center; margin-bottom: 1rem; align-self: center; padding-left: 0.5rem; }
            .cert-title { font-size: 2.5rem; font-weight: 700; color: {{ primary_color }}; text-transform: uppercase; }
            .cert-recipient { font-size: 3rem; font-weight: 700; color: {{ body_font_color }}; }
            .cert-body { font-size: 1.2rem; color: {{ body_font_color }}; }
            .cert-course { font-size: 2.2rem; font-weight: 700; color: {{ secondary_color }}; text-transform: uppercase; }
            .extra-fields-container { 
                margin: 1.5rem 0; font-size: 1rem; color: #4B5563; 
                border-left: 3px solid {{ primary_color }}; padding-left: 1rem; 
            }
            .extra-field { margin-bottom: 0.5rem; }
            .extra-field-label { font-weight: bold; text-transform: uppercase; }
            .footer { 
                margin-top: auto; padding-top: 1.5rem; 
                border-top: 2px solid {{ primary_color }}; 
                display: flex; justify-content: space-between; 
                font-size: 0.9rem; color: #6B7280; 
            }
            .signature-text { 
                font-family: 'Dancing Script', cursive; 
                font-size: 1.2rem; color: {{ body_font_color }}; 
            }
            .signature-image { max-height: 40px; max-width: 150px; object-fit: contain; }
            .qr-code { text-align: center; }
            .verification-id { font-size: 0.8rem; font-weight: bold; margin-top: 0.5rem; }
        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="sidebar">
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" class="logo" alt="Logo">
                {% endif %}
                <div class="qr-code">
                    <p>Verification ID</p>
                    <p class="verification-id">{{ verification_id }}</p>
                    <img src="data:image/png;base64,{{ qr_base64 }}" style="width: 80px; height: 80px;">
                </div>
            </div>
            <div class="main-content">
                <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Achievement') }}</h1>
                <h2 class="cert-recipient">{{ recipient_name }}</h2>
                <p class="cert-body">{{ custom_text.get('body', 'has successfully completed') }}</p>
                <p class="cert-course">{{ course_title }}</p>
                <p class="cert-body">Awarded on {{ issue_date }}</p>
                {% if extra_fields %}
                <div class="extra-fields-container">
                    {% for key, value in extra_fields.items() %}
                    <div class="extra-field">
                        <span class="extra-field-label">{{ key|replace('_', ' ')|title }}:</span>
                        <span>{{ value }}</span>
                    </div>
                    {% endfor %}
                </div>
                {% endif %}
                <div class="footer">
                    <div>
                        {% if signature_image_base64 %}
                        <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                        <p class="signature-text">{{ signature }}</p>
                        {% endif %}
                        <p>Authorized Signature</p>
                    </div>
                    <div>
                        <p class="signature-text">{{ issuer_name }}</p>
                        <p>Issuer</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """