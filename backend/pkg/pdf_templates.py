def get_classic_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
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
            .certificate-wrapper { width: 95%; height: 90%; border: 1.5px solid {{ primary_color }}; padding: 5px; }
            .certificate-content { width: 100%; height: 100%; border: 4px solid {{ primary_color }}; padding: 2rem; text-align: center; display: flex; flex-direction: column; position: relative; }
            header { flex-shrink: 0; margin-bottom: 1rem; }
            .logo { max-height: 80px; max-width: 150px; margin-bottom: 1rem; }
            .cert-title { font-size: 2.5rem; font-weight: 700; color: {{ primary_color }}; text-transform: uppercase; letter-spacing: 0.2em; }
            main { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }
            .cert-subtitle { font-size: 1.1rem; color: {{ body_font_color }}; }
            .cert-recipient { font-size: 3.5rem; font-weight: 700; color: {{ body_font_color }}; margin: 1rem 0; }
            .cert-body { font-size: 1.1rem; color: {{ body_font_color }}; }
            .cert-course { font-size: 1.5rem; font-weight: 700; color: {{ secondary_color }}; text-transform: uppercase; margin-top: 1rem; }
            footer { flex-shrink: 0; display: flex; justify-content: space-between; width: 80%; margin: 2rem auto 0; }
            .signature-block { width: 45%; }
            .signature-line { border-top: 1.5px solid {{ body_font_color }}; padding-top: 0.5rem; font-weight: 600; min-height: 60px; display: flex; align-items: center; justify-content: center; }
            .signature-label { font-size: 0.8rem; color: #666; }
            .qr-code { position: absolute; bottom: 1rem; right: 1rem; }
            .verification-id { position: absolute; bottom: 1rem; left: 1rem; font-size: 0.7rem; color: #999; }
            .signature-text { font-family: 'Dancing Script', cursive; font-size: 2.5rem; color: #333; }
            .signature-image { max-height: 50px; max-width: 100%; object-fit: contain; }
            
            /* --- NEW STYLES FOR EXTRA FIELDS --- */
            .extra-fields-container { margin-top: 1.5rem; font-size: 0.9rem; color: {{ body_font_color }}; }
            .extra-field { display: inline-block; margin: 0 1rem; }
            .extra-field-label { font-weight: bold; }
            /* --- END OF NEW STYLES --- */

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

                    <!-- --- NEW LOGIC TO DISPLAY EXTRA FIELDS --- -->
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
                    <!-- --- END OF EXTRA FIELDS LOGIC --- -->

                </main>
                <footer>
                    <div class="signature-block">
                        <div class="signature-line">{{ issue_date }}</div>
                        <p class="signature-label">Date</p>
                    </div>
                    <div class="signature-block">
                        <div class="signature-line">
                            {% if signature_image_base64 %}
                                <img src="data:image/png;base64,{{ signature_image_base64 }}" alt="Signature" class="signature-image">
                            {% else %}
                                <p class="signature-text">{{ signature }}</p>
                            {% endif %}
                        </div>
                        <p class="signature-label">Signature</p>
                    </div>
                </footer>
                <div class="qr-code"> <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" style="width: 70px; height: 70px;"> </div>
                <div class="verification-id"> <p>Verify at {{ frontend_url }}<br>ID: {{ verification_id }}</p> </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_modern_pdf_template():
    # Similar changes are made here for consistency.
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8"><title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
            @page { size: A4 landscape; margin: 0; }
            /* ... other styles ... */
            .cert-course { font-size: 2.2rem; font-weight: 700; color: {{ secondary_color }}; }
            .footer { margin-top: auto; padding-top: 1.5rem; border-top: 2px solid {{ primary_color }}; display: flex; justify-content: space-between; font-size: 0.9rem; color: #6b7280; }
            .signature-text { font-family: 'Dancing Script', cursive; font-size: 2rem; color: #333; line-height: 1; }
            .signature-image { max-height: 40px; max-width: 150px; object-fit: contain; }

            /* --- NEW STYLES FOR EXTRA FIELDS --- */
            .extra-fields-container { margin: 1.5rem 0; font-size: 1rem; color: #4b5563; border-left: 3px solid {{ primary_color }}; padding-left: 1rem; }
            .extra-field { margin-bottom: 0.5rem; }
            .extra-field-label { font-weight: bold; }
            /* --- END OF NEW STYLES --- */
        </style>
    </head>
    <body>
        <div class="sidebar">
            <!-- ... sidebar content ... -->
        </div>
        <div class="main-content">
            <h1 class="cert-title">{{ custom_text.get('title', 'Certificate of Achievement') }}</h1>
            <h2 class="cert-recipient">{{ recipient_name }}</h2>
            <p class="cert-body">{{ custom_text.get('body', 'has successfully completed') }}</p>
            <p class="cert-course">{{ course_title }}</p>

            <!-- --- NEW LOGIC TO DISPLAY EXTRA FIELDS --- -->
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
            <!-- --- END OF EXTRA FIELDS LOGIC --- -->

            <div class="footer">
                <!-- ... footer content ... -->
            </div>
        </div>
    </body>
    </html>
    """