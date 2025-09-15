def get_classic_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@400;500&family=Dancing+Script:wght@700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            body { 
                margin: 0; 
                padding: 0; 
                width: 297mm; 
                height: 210mm; 
                font-family: '{{ font_family }}', 'Playfair Display', serif; 
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
                border-radius: 12px; 
                background: white; 
                box-shadow: 0 12px 24px rgba(0,0,0,0.25); 
                position: relative; 
                overflow: hidden;
            }
            .certificate-content { 
                width: 100%; 
                height: 100%; 
                padding: 2.5rem; 
                text-align: center; 
                display: flex; 
                flex-direction: column; 
                background: linear-gradient(to bottom, rgba(255,255,255,0.97), rgba(240,240,240,0.9));
                border: 3px solid {{ primary_color }}; 
                border-radius: 8px; 
                position: relative;
            }
            .top-border {
                height: 12px; 
                border-bottom: 4px solid {{ primary_color }}; 
                background: linear-gradient(to right, {{ primary_color }}, {{ secondary_color }}); 
                margin-bottom: 1.5rem;
            }
            .corner-decor {
                position: absolute; 
                width: 40px; 
                height: 40px; 
                background: linear-gradient(45deg, {{ primary_color }}, {{ secondary_color }}); 
                opacity: 0.3;
            }
            .corner-decor.top-left { top: -4px; left: -4px; clip-path: polygon(0 0, 100% 0, 0 100%); }
            .corner-decor.top-right { top: -4px; right: -4px; clip-path: polygon(100% 0, 100% 100%, 0 0); }
            .corner-decor.bottom-left { bottom: -4px; left: -4px; clip-path: polygon(0 0, 100% 100%, 0 100%); }
            .corner-decor.bottom-right { bottom: -4px; right: -4px; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
            header { 
                flex-shrink: 0; 
                margin-bottom: 1rem; 
            }
            .logo { 
                max-height: 150px; 
                max-width: 150px; 
                margin-bottom: 1.5rem; 
                object-fit: contain; 
            }
            .cert-title { 
                font-size: 2.8rem; 
                font-weight: 700; 
                color: {{ primary_color }}; 
                text-transform: uppercase; 
                letter-spacing: 0.15em; 
                font-family: 'Playfair Display', serif;
                margin: 0;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .cert-subtitle { 
                font-size: 1.3rem; 
                color: #4B5EAA; 
                font-style: italic; 
                font-family: 'Roboto', sans-serif; 
                margin: 0.75rem 0;
            }
            main { 
                flex-grow: 1; 
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
            }
            .cert-recipient { 
                font-size: 3.5rem; 
                font-weight: 700; 
                color: {{ body_font_color }}; 
                margin: 1.2rem 0; 
                font-family: 'Georgia', serif;
                line-height: 1.2;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .cert-body { 
                font-size: 1.3rem; 
                color: {{ body_font_color }}; 
                font-family: 'Roboto', sans-serif; 
                font-style: italic; 
                margin: 0.75rem 0;
            }
            .cert-course { 
                font-size: 2rem; 
                font-weight: 700; 
                color: {{ secondary_color }}; 
                text-transform: uppercase; 
                margin: 1rem 0; 
                font-family: 'Roboto', sans-serif;
                letter-spacing: 0.1em;
            }
            .extra-fields-container { 
                margin: 1.5rem auto; 
                font-size: 1.1rem; 
                color: #4B5563; 
                border-left: 4px solid {{ primary_color }}; 
                padding: 1rem 1.5rem; 
                text-align: left; 
                width: 75%; 
                background: rgba(245,245,245,0.8); 
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .extra-field { 
                margin-bottom: 0.75rem; 
            }
            .extra-field-label { 
                font-weight: 600; 
                text-transform: uppercase; 
                font-family: 'Roboto', sans-serif;
                color: {{ primary_color }};
            }
            footer { 
                flex-shrink: 0; 
                display: flex; 
                justify-content: space-between; 
                width: 85%; 
                margin: 2rem auto 1.5rem; 
                font-size: 1rem;
            }
            .signature-block { 
                width: 40%; 
                text-align: center; 
            }
            .issuer-block { 
                margin-bottom: 1rem; 
                background: rgba(0,0,0,0.05); 
                padding: 0.5rem; 
                border-radius: 4px; 
            }
            .issuer-name { 
                font-size: 1.2rem; 
                font-weight: 600; 
                color: {{ body_font_color }}; 
                font-family: 'Roboto', sans-serif;
            }
            .issuer-label { 
                font-size: 0.9rem; 
                color: #666; 
                font-family: 'Roboto', sans-serif;
            }
            .signature-line { 
                border-top: 2px solid {{ body_font_color }}; 
                padding-top: 0.75rem; 
                font-weight: 600; 
                font-size: 1.4rem; 
                color: {{ body_font_color }}; 
                font-family: 'Dancing Script', cursive;
                transform: rotate(-2deg);
                min-height: 60px;
            }
            .signature-image { 
                max-height: 60px; 
                max-width: 180px; 
                object-fit: contain; 
                margin-bottom: 0.5rem;
            }
            .signature-label { 
                font-size: 0.9rem; 
                color: #666; 
                font-family: 'Roboto', sans-serif;
            }
            .qr-code { 
                position: absolute; 
                bottom: 1.5rem; 
                right: 1.5rem; 
                background: white; 
                padding: 1rem; 
                border-radius: 8px; 
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                border: 2px solid {{ primary_color }};
                text-align: center;
            }
            .qr-code-label {
                font-size: 0.85rem;
                font-weight: 600;
                color: {{ primary_color }};
                font-family: 'Roboto', sans-serif;
                margin-bottom: 0.5rem;
            }
            .qr-code img { 
                width: 120px; 
                height: 120px; 
            }
            .verification-info { 
                position: absolute; 
                bottom: 1.5rem; 
                left: 1.5rem; 
                font-size: 0.95rem; 
                color: #4B5563; 
                font-family: 'Roboto', sans-serif;
                background: rgba(255,255,255,0.9); 
                padding: 0.5rem; 
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="certificate-content">
                <div class="top-border"></div>
                <div class="corner-decor top-left"></div>
                <div class="corner-decor top-right"></div>
                <div class="corner-decor bottom-left"></div>
                <div class="corner-decor bottom-right"></div>
                <header>
                    {% if logo_base64 %}
                    <img src="data:image/png;base64,{{ logo_base64 }}" class="logo" alt="Logo">
                    {% endif %}
                    <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Completion') }}</h1>
                    <p class="cert-subtitle">This is to certify that</p>
                </header>
                <main>
                    <h2 class="cert-recipient">{{ recipient_name }}</h2>
                    <p class="cert-body">{{ custom_text.get('body', 'has successfully completed the course') }}</p>
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
                </main>
                <footer>
                    <div class="signature-block">
                        <div class="issuer-block">
                            <p class="issuer-name">{{ issuer_name }}</p>
                            <p class="issuer-label">Issuer</p>
                        </div>
                        {% if signature_image_base64 %}
                        <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                        <p class="signature-line">{{ signature or issuer_name }}</p>
                        {% endif %}
                        <p class="signature-label">Authorized Signature</p>
                    </div>
                    <div class="signature-block">
                        <div class="issuer-block">
                            <p class="issuer-name">{{ issuer_name }}</p>
                            <p class="issuer-label">Issuing Authority</p>
                        </div>
                        {% if signature_image_base64 %}
                        <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                        <p class="signature-line">{{ signature or issuer_name }}</p>
                        {% endif %}
                        <p class="signature-label">Authorized Signature</p>
                    </div>
                </footer>
                
                <div class="verification-info">
                    <p>Issued by: {{ issuer_name }}</p>
                    <p>ID: {{ verification_id }}</p>
                    <p>Verify at: {{ frontend_url }}/verify/{{ verification_id }}</p>
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
            .logo { max-width: 100px; max-height: 100px; object-fit: contain; }
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