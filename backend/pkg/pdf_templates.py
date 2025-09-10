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
                font-family: '{{ font_family }}', 'Times New Roman', serif;
                background: #F5F6F5;
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
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            .border-top {
                border-bottom: 4px solid {{ primary_color }};
                background: linear-gradient(to right, {{ primary_color }}, {{ secondary_color }});
            }
            .content {
                flex-grow: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                padding: 2rem;
            }
            .logo {
                width: 140px;
                height: 140px;
                object-fit: contain;
                margin-bottom: 1.5rem;
                border: 2px solid {{ secondary_color }};
                border-radius: 10px;
            }
            .title {
                font-size: 2.5rem;
                font-weight: 700;
                color: {{ primary_color }};
                margin-bottom: 1rem;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .certify {
                font-size: 1.2rem;
                color: #4B5EAA;
                margin-bottom: 0.5rem;
                font-style: italic;
            }
            .recipient {
                font-size: 3rem;
                font-weight: 800;
                color: {{ body_font_color }};
                margin-bottom: 1rem;
                font-family: 'Georgia', serif;
            }
            .completed {
                font-size: 1.2rem;
                color: #4B5EAA;
                margin-bottom: 0.5rem;
                font-style: italic;
            }
            .course {
                font-size: 1.8rem;
                font-weight: 700;
                color: {{ secondary_color }};
                margin-bottom: 1.5rem;
                text-transform: uppercase;
            }
            .footer {
                display: flex;
                justify-content: space-around;
                width: 100%;
                margin-top: 1.5rem;
            }
            .footer div {
                text-align: center;
            }
            .footer p {
                font-weight: 600;
                margin-bottom: 0;
                color: {{ body_font_color }};
                font-size: 1.1rem;
            }
            .footer hr {
                width: 60%;
                margin: 0.5rem auto;
                border-top: 2px solid {{ primary_color }};
            }
            .footer span {
                color: #6c757d;
                font-size: 0.9rem;
            }
            .qr-code {
                position: absolute;
                bottom: 1.5rem;
                right: 1.5rem;
                width: 90px;
                height: 90px;
                background: white;
                padding: 5px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .issuer {
                position: absolute;
                bottom: 1.5rem;
                left: 1.5rem;
                font-size: 1.1rem;
                color: {{ body_font_color }};
                font-weight: 500;
            }
            .verification {
                position: absolute;
                bottom: 0.8rem;
                left: 1.5rem;
                font-size: 0.9rem;
                color: #6c757d;
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
                <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
                <p class="issuer">Issued by: {{ issuer_name }}</p>
                <p class="verification">Verification ID: {{ verification_id }}</p>
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
                background: #1E2A44;
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
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                background: rgba(255,255,255,0.05);
            }
            .left-sidebar {
                width: 35%;
                padding: 2.5rem;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, {{ primary_color }}, {{ secondary_color }});
                border-right: 3px solid {{ secondary_color }};
            }
            .logo {
                width: 8rem;
                height: 8rem;
                border-radius: 50%;
                border: 4px solid white;
                object-fit: cover;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                background: white;
            }
            .issuer {
                font-weight: 700;
                font-size: 1.3rem;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: white;
                text-shadow: 1px 1px 3px rgba(0,0,0,0.2);
            }
            .qr-container {
                background-color: white;
                padding: 0.4rem;
                border-radius: 10px;
                box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            }
            .qr-code {
                width: 100px;
                height: 100px;
            }
            .content {
                width: 65%;
                padding: 3rem;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: rgba(255,255,255,0.1);
            }
            .title {
                font-size: 1.8rem;
                font-weight: 300;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: {{ primary_color }};
                margin-bottom: 0.75rem;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            }
            .recipient {
                font-size: 3.2rem;
                font-weight: 800;
                margin: 0.75rem 0;
                font-family: 'Georgia', serif;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .description {
                color: #E5E7EB;
                font-size: 1.2rem;
                margin-bottom: 0.75rem;
                font-style: italic;
            }
            .course {
                font-size: 1.6rem;
                font-weight: 700;
                margin-bottom: 1.5rem;
                color: {{ secondary_color }};
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            .footer {
                display: flex;
                justify-content: space-between;
                margin-top: 2.5rem;
                font-size: 1.1rem;
                color: #E5E7EB;
                border-top: 2px solid {{ primary_color }};
                padding-top: 1rem;
            }
            .footer p {
                margin: 0;
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
                    <p>Verification ID: {{ verification_id }}</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """