# pdf_templates.py
def get_classic_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @page {
                size: A4 landscape;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                width: 297mm;
                height: 210mm;
                font-family: '{{ font_family }}', 'Georgia', serif;
                background: #F8FAFC;
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover;
                background-position: center;
                {% endif %}
                position: relative;
                overflow: hidden;
            }
            .certificate {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                border: 8px double {{ primary_color }};
                background: white;
                box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                position: relative;
            }
            .border-top {
                border-bottom: 4px solid {{ primary_color }};
                background: linear-gradient(to right, {{ primary_color }}, {{ secondary_color }});
                height: 20px;
            }
            .content {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 2.5rem;
                gap: 1rem;
            }
            .logo {
                width: 140px;
                height: 140px;
                object-fit: contain;
                margin-bottom: 1.5rem;
                border: 3px solid {{ secondary_color }};
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.1);
            }
            .title {
                font-size: 2.8rem;
                font-weight: 800;
                color: {{ primary_color }};
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
            }
            .certify {
                font-size: 1.3rem;
                color: #4B5EAA;
                margin-bottom: 0.5rem;
                font-style: italic;
                font-weight: 500;
            }
            .recipient {
                font-size: 3.2rem;
                font-weight: 900;
                color: {{ body_font_color }};
                margin-bottom: 1rem;
                font-family: 'Georgia', serif;
                letter-spacing: 0.02em;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
            }
            .completed {
                font-size: 1.3rem;
                color: #4B5EAA;
                margin-bottom: 0.5rem;
                font-style: italic;
                font-weight: 500;
            }
            .course {
                font-size: 2rem;
                font-weight: 700;
                color: {{ secondary_color }};
                margin-bottom: 2rem;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.05);
            }
            .footer {
                display: flex;
                justify-content: space-around;
                width: 100%;
                margin-top: 2rem;
                padding-top: 1.5rem;
                border-top: 2px dashed {{ primary_color }};
            }
            .footer div {
                text-align: center;
                flex: 1;
            }
            .footer p {
                font-weight: 600;
                margin-bottom: 0.5rem;
                color: {{ body_font_color }};
                font-size: 1.2rem;
            }
            .footer hr {
                width: 70%;
                margin: 0.5rem auto;
                border-top: 2px solid {{ primary_color }};
                border-radius: 2px;
            }
            .footer span {
                color: #6B7280;
                font-size: 0.95rem;
                font-weight: 500;
            }
            .qr-code {
                position: absolute;
                bottom: 2rem;
                right: 2rem;
                width: 100px;
                height: 100px;
                background: white;
                padding: 8px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .issuer {
                position: absolute;
                bottom: 2rem;
                left: 2rem;
                font-size: 1.2rem;
                color: {{ body_font_color }};
                font-weight: 600;
                background: rgba(255,255,255,0.9);
                padding: 0.5rem 1rem;
                border-radius: 20px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .verification {
                position: absolute;
                bottom: 1rem;
                left: 50%;
                transform: translateX(-50%);
                font-size: 0.9rem;
                color: #6B7280;
                background: rgba(255,255,255,0.8);
                padding: 0.25rem 1rem;
                border-radius: 15px;
                font-weight: 500;
            }
            @media print {
                body { background: white !important; }
                .certificate { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="border-top"></div>
            <div class="content">
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
                {% endif %}
                <h1 class="title">Certificate of Completion</h1>
                <p class="certify">This is to certify that</p>
                <h2 class="recipient">{{ recipient_name }}</h2>
                <p class="completed">has successfully completed the course</p>
                <p class="course">{{ course_title }}</p>
                <div class="footer">
                    <div>
                        <p>{{ issue_date }}</p>
                        <hr>
                        <span>Date</span>
                    </div>
                    <div>
                        <p>{{ signature or issuer_name }}</p>
                        <hr>
                        <span>Signature</span>
                    </div>
                </div>
                <div class="qr-code">
                    <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" style="width:100%; height:100%;">
                </div>
                <div class="issuer">Issued by: {{ issuer_name }}</div>
                <div class="verification">Verification ID: {{ verification_id }}</div>
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
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @page {
                size: A4 landscape;
                margin: 0;
            }
            body {
                margin: 0;
                padding: 0;
                width: 297mm;
                height: 210mm;
                font-family: '{{ font_family }}', 'Helvetica Neue', sans-serif;
                background: #1E293B;
                color: white;
                display: flex;
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover;
                background-position: center;
                {% endif %}
                position: relative;
                overflow: hidden;
            }
            .certificate {
                width: 100%;
                height: 100%;
                display: flex;
                border: 6px solid {{ primary_color }};
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                background: rgba(255,255,255,0.08);
                backdrop-filter: blur(10px);
            }
            .left-sidebar {
                width: 35%;
                padding: 3rem 2rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, {{ primary_color }}, {{ secondary_color }});
                border-right: 3px solid {{ secondary_color }};
                position: relative;
                overflow: hidden;
            }
            .left-sidebar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1), transparent);
                pointer-events: none;
            }
            .logo {
                width: 9rem;
                height: 9rem;
                border-radius: 50%;
                border: 4px solid white;
                object-fit: cover;
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                background: white;
                z-index: 1;
            }
            .issuer {
                font-weight: 800;
                font-size: 1.4rem;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: white;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                z-index: 1;
                margin-top: 1rem;
            }
            .qr-container {
                background-color: white;
                padding: 0.6rem;
                border-radius: 12px;
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
                z-index: 1;
            }
            .qr-code {
                width: 110px;
                height: 110px;
            }
            .content {
                width: 65%;
                padding: 3.5rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: rgba(255,255,255,0.12);
                backdrop-filter: blur(5px);
                position: relative;
                overflow: hidden;
            }
            .content::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, rgba(255,255,255,0.05), transparent);
                pointer-events: none;
            }
            .title {
                font-size: 2rem;
                font-weight: 300;
                text-transform: uppercase;
                letter-spacing: 0.2em;
                color: {{ primary_color }};
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                z-index: 1;
            }
            .recipient {
                font-size: 3.5rem;
                font-weight: 900;
                margin: 1rem 0;
                font-family: 'Georgia', serif;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
                letter-spacing: 0.03em;
                z-index: 1;
            }
            .description {
                color: #E5E7EB;
                font-size: 1.3rem;
                margin-bottom: 1rem;
                font-style: italic;
                font-weight: 500;
                z-index: 1;
            }
            .course {
                font-size: 1.8rem;
                font-weight: 800;
                margin-bottom: 2rem;
                color: {{ secondary_color }};
                text-transform: uppercase;
                letter-spacing: 0.08em;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
                z-index: 1;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                margin-top: 3rem;
                font-size: 1.2rem;
                color: #E5E7EB;
                border-top: 2px solid {{ primary_color }};
                padding-top: 1.5rem;
                z-index: 1;
            }
            .footer p {
                margin: 0;
                font-weight: 600;
            }
            .footer code {
                background: rgba(0,0,0,0.2);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.9rem;
            }
            @media print {
                body { background: white !important; }
                .certificate { box-shadow: none; backdrop-filter: none; }
                .left-sidebar::before, .content::before { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="left-sidebar">
                <div>
                    {% if logo_base64 %}
                    <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
                    {% endif %}
                    <p class="issuer">{{ issuer_name }}</p>
                </div>
                <div class="qr-container">
                    <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
                </div>
            </div>
            <div class="content">
                <h1 class="title">Certificate of Achievement</h1>
                <h2 class="recipient">{{ recipient_name }}</h2>
                <p class="description">has successfully completed</p>
                <p class="course">{{ course_title }}</p>
                <div class="footer">
                    <div>
                        <p>Date: {{ issue_date }}</p>
                        <p>Signature: {{ signature or issuer_name }}</p>
                    </div>
                    <p><code>Verification ID: {{ verification_id }}</code></p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """