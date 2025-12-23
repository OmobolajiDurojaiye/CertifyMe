def get_classic_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Roboto:wght@400;500;700&display=swap');
            
            @page { 
                size: A4 landscape; 
                margin: 0; 
            }
            
            body { 
                margin: 0; 
                padding: 0; 
                width: 297mm; 
                height: 210mm; 
                font-family: '{{ font_family }}', 'Roboto', sans-serif; 
                background: white;
                display: flex; 
                align-items: center; 
                justify-content: center;
            }

            .certificate-wrapper { 
                width: 95%; 
                height: 90%; 
                background: white; 
                position: relative; 
                display: flex;
                flex-direction: column;
                border: 8px double {{ primary_color }};
                border-radius: 12px;
                overflow: hidden;
                
                /* Background Image Logic */
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover;
                background-position: center;
                {% endif %}
            }

            .top-bar {
                height: 12px;
                border-bottom: 4px solid {{ primary_color }};
                background: linear-gradient(to right, {{ primary_color }}, {{ secondary_color }});
                flex-shrink: 0;
            }

            .content { 
                flex-grow: 1;
                padding: 2rem; 
                text-align: center; 
                display: flex; 
                flex-direction: column; 
                justify-content: center;
                align-items: center;
            }

            .logo { 
                width: 120px; 
                height: 120px; 
                object-fit: contain; 
                margin-bottom: 1rem; 
            }

            .title { 
                font-size: 2.5rem; 
                font-weight: 700; 
                color: {{ primary_color }}; 
                text-transform: uppercase; 
                letter-spacing: 0.05em;
                margin: 0;
                line-height: 1.2;
            }

            .subtitle { 
                font-size: 1.1rem; 
                color: #4B5EAA; 
                font-style: italic; 
                margin: 0.5rem 0;
            }

            .recipient { 
                font-size: 3rem; 
                font-weight: 800;
                color: {{ body_font_color }}; 
                margin: 0.5rem 0; 
                font-family: 'Georgia', serif;
            }

            .body-text { 
                font-size: 1.2rem; 
                color: #4B5EAA; 
                font-style: italic; 
                margin: 0.5rem 0;
            }

            .course-title { 
                font-size: 1.8rem; 
                font-weight: 700; 
                color: {{ secondary_color }}; 
                text-transform: uppercase; 
                margin: 1rem 0;
            }

            .date-text {
                font-size: 1.2rem;
                color: {{ body_font_color }};
                margin-bottom: 1.5rem;
            }

            .footer { 
                margin-top: auto; 
                padding-top: 1.5rem; 
                display: flex; 
                justify-content: space-around; 
                width: 100%;
            }

            .signature-block {
                width: 40%;
                text-align: center;
            }

            .signature-text {
                font-family: '{{ font_family }}', sans-serif;
                font-size: 1.1rem;
                font-weight: 600;
                color: {{ body_font_color }};
                margin-bottom: 0.25rem;
            }
            
            .signature-image {
                max-height: 50px;
                max-width: 180px;
                object-fit: contain;
                margin-bottom: 0.25rem;
            }

            .signature-line {
                width: 70%;
                margin: 4px auto;
                border: none;
                border-top: 1px solid {{ primary_color }};
            }

            .signature-label {
                font-size: 0.9rem;
                color: #6B7280;
            }

            .qr-container {
                position: absolute;
                bottom: 1rem;
                right: 1rem;
                background: white;
                padding: 5px;
                border-radius: 6px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="top-bar"></div>
            <div class="content">
                
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" class="logo" alt="Logo">
                {% endif %}
                
                <h1 class="title">{{ custom_text.get('title', 'Certificate of Completion') }}</h1>
                <p class="subtitle">This is to certify that</p>
                
                <h2 class="recipient">{{ recipient_name }}</h2>
                
                <p class="body-text">{{ custom_text.get('body', 'has successfully completed the course') }}</p>
                
                <p class="course-title">{{ course_title }}</p>
                
                <div class="footer">
                    <div class="signature-block">
                        <p class="signature-text">{{ issue_date }}</p>
                        <hr class="signature-line" />
                        <p class="signature-label">Date</p>
                    </div>
                    <div class="signature-block">
                        {% if signature_image_base64 %}
                            <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                            <p class="signature-text">{{ signature }}</p>
                        {% endif %}
                        <hr class="signature-line" />
                        <p class="signature-label">Signature</p>
                    </div>
                </div>

                <div class="qr-container">
                    <img src="data:image/png;base64,{{ qr_base64 }}" style="width: 64px; height: 64px;">
                </div>
                <div style="position: absolute; bottom: 1rem; left: 1rem; font-size: 0.8rem; color: #6B7280;">
                    Issued by: {{ issuer_name }}
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
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Georgia&display=swap');
            
            @page { 
                size: A4 landscape; 
                margin: 0; 
            }
            
            body { 
                margin: 0; 
                padding: 0; 
                width: 297mm; 
                height: 210mm; 
                font-family: '{{ font_family }}', 'Lato', sans-serif; 
                background: white;
                display: flex; 
                align-items: center; 
                justify-content: center;
            }

            .certificate-wrapper { 
                width: 95%; 
                height: 90%; 
                border: 6px solid {{ primary_color }}; 
                border-radius: 12px; 
                overflow: hidden; 
                display: flex; 
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                
                {% if background_base64 %}
                background-image: url('data:image/png;base64,{{ background_base64 }}');
                background-size: cover;
                background-position: center;
                {% else %}
                background: white;
                {% endif %}
            }

            /* --- SIDEBAR (35%) --- */
            .sidebar { 
                width: 35%; 
                height: 100%;
                background: linear-gradient(135deg, {{ primary_color }}, {{ secondary_color }}); 
                display: block; 
                position: relative; 
                text-align: center;
                color: white; 
                box-sizing: border-box;
            }

            .top-section {
                padding: 2rem 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .logo { 
                width: 6rem; 
                height: 6rem; 
                object-fit: cover; 
                border-radius: 50%; 
                border: 4px solid white; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); 
                margin-bottom: 1rem;
                background: white;
            }

            .sidebar-issuer-name {
                font-weight: 700;
                text-transform: uppercase;
                font-size: 0.9rem;
                letter-spacing: 0.1em;
                margin: 0;
                padding: 0 10px;
                line-height: 1.4;
            }

            .qr-box-wrapper {
                position: absolute;
                bottom: 2rem;
                left: 0;
                right: 0;
                display: flex;
                justify-content: center;
            }

            .qr-box {
                background: white;
                padding: 6px;
                border-radius: 6px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            /* --- MAIN CONTENT (65%) --- */
            .main-content { 
                width: 65%; 
                padding: 3rem 3rem 2rem 3rem;
                display: flex; 
                flex-direction: column; 
                justify-content: space-between;
                background-color: rgba(255, 255, 255, 0.95);
                position: relative;
                box-sizing: border-box;
                height: 100%;
            }

            .text-content-wrapper {
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
            }

            .title { 
                font-weight: 300; 
                text-transform: uppercase;
                margin-bottom: 1.5rem;
                font-size: 1.6rem;
                letter-spacing: 0.15em;
                color: {{ primary_color }};
            }

            .recipient { 
                font-weight: 800; 
                margin-bottom: 1.5rem;
                font-size: 2.8rem;
                font-family: 'Georgia', serif;
                color: {{ body_font_color }};
                line-height: 1.1;
            }

            .body-text { 
                font-style: italic;
                margin-bottom: 1.5rem;
                font-size: 1.1rem;
                color: #666;
            }

            .course-title { 
                font-weight: 700;
                text-transform: uppercase;
                margin-bottom: 0;
                font-size: 1.5rem;
                letter-spacing: 0.05em;
                color: {{ secondary_color }};
            }

            .date-line {
                font-size: 1rem;
                color: {{ body_font_color }};
                margin-top: 1.5rem;
            }

            .footer { 
                width: 100%;
                padding-top: 1.5rem; 
                border-top: 2px solid {{ primary_color }}; 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end;
                font-size: 0.9rem; 
            }

            .signature-block {
                text-align: left;
            }
            
            .signature-block-right {
                text-align: right;
            }

            .signature-text {
                font-size: 1.2rem;
                font-weight: 600;
                color: {{ body_font_color }};
                margin-bottom: 0.2rem;
                font-family: '{{ font_family }}', sans-serif;
            }
            
            .signature-image {
                max-height: 50px;
                max-width: 160px;
                object-fit: contain;
                margin-bottom: 0.2rem;
                display: block;
            }

            .signature-label {
                color: #6B7280; 
                margin: 0;
                font-size: 0.85rem;
            }

        </style>
    </head>
    <body>
        <div class="certificate-wrapper">
            <div class="sidebar">
                <div class="top-section">
                    {% if logo_base64 %}
                    <img src="data:image/png;base64,{{ logo_base64 }}" class="logo" alt="Logo">
                    {% endif %}
                    <p class="sidebar-issuer-name">{{ issuer_name }}</p>
                </div>
                
                <div class="qr-box-wrapper">
                    <div class="qr-box">
                        <img src="data:image/png;base64,{{ qr_base64 }}" style="width: 72px; height: 72px;">
                        <div style="font-size: 0.6rem; color: #333; margin-top: 2px;">{{ verification_id }}</div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="text-content-wrapper">
                    <div class="title">{{ custom_text.get('title', 'Certificate of Completion') }}</div>
                    <div class="recipient">{{ recipient_name }}</div>
                    <div class="body-text">{{ custom_text.get('body', 'has successfully completed the course') }}</div>
                    <div class="course-title">{{ course_title }}</div>
                    <div class="date-line">Awarded on {{ issue_date }}</div>
                </div>
                
                <div class="footer">
                    <div class="signature-block">
                        {% if signature_image_base64 %}
                            <img src="data:image/png;base64,{{ signature_image_base64 }}" class="signature-image">
                        {% else %}
                            <div class="signature-text">{{ signature }}</div>
                        {% endif %}
                        <div class="signature-label">Authorized Signature</div>
                    </div>
                    
                    <div class="signature-block signature-block-right">
                        <div class="signature-text">{{ issuer_name }}</div>
                        <div class="signature-label">Issuer</div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

def get_receipt_pdf_template():
    return """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Payment Receipt</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            @page { size: A4 portrait; margin: 0; }
            body { 
                margin: 0; padding: 0; width: 210mm; height: 297mm; 
                font-family: 'Inter', sans-serif; 
                background: white;
                color: {{ body_font_color }};
            }
            .container {
                width: 85%;
                margin: 40px auto;
            }
            
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 50px; }
            .logo { height: 60px; object-fit: contain; }
            .company-info { text-align: right; font-size: 0.9rem; color: #6B7280; }
            .company-name { font-weight: 700; font-size: 1.2rem; color: {{ primary_color }}; margin-bottom: 5px; }
            
            .receipt-title-box { 
                background: {{ primary_color }}; color: white; 
                padding: 15px 25px; margin-bottom: 40px; 
                display: flex; justify-content: space-between; align-items: center;
                border-radius: 6px;
            }
            .receipt-label { font-size: 1.8rem; font-weight: 700; text-transform: uppercase; }
            .receipt-id { font-family: monospace; font-size: 1rem; opacity: 0.9; }
            
            .details-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .detail-group { flex: 1; }
            .detail-label { font-size: 0.8rem; text-transform: uppercase; color: #9CA3AF; letter-spacing: 1px; margin-bottom: 5px; }
            .detail-value { font-size: 1.1rem; font-weight: 600; color: {{ secondary_color }}; }
            
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .items-table th { text-align: left; padding: 15px; background: #F3F4F6; color: #4B5563; font-weight: 600; text-transform: uppercase; font-size: 0.8rem; }
            .items-table td { padding: 15px; border-bottom: 1px solid #E5E7EB; }
            .item-desc { font-weight: 600; font-size: 1rem; }
            .item-total { font-weight: 700; font-size: 1.1rem; color: {{ primary_color }}; text-align: right; }
            
            .total-section { display: flex; justify-content: flex-end; margin-bottom: 60px; }
            .total-box { width: 40%; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
            .total-row.final { border-bottom: none; font-size: 1.4rem; font-weight: 700; color: {{ primary_color }}; margin-top: 10px; }
            
            .footer { 
                position: absolute; bottom: 40px; left: 0; right: 0; 
                text-align: center; font-size: 0.9rem; color: #9CA3AF;
                border-top: 1px solid #E5E7EB; padding-top: 20px;
                width: 85%; margin: 0 auto;
            }
            .paid-stamp {
                border: 3px solid #10B981; color: #10B981;
                font-size: 2rem; font-weight: 800; text-transform: uppercase;
                padding: 10px 20px; border-radius: 8px; transform: rotate(-10deg);
                position: absolute; top: 350px; right: 100px; opacity: 0.2;
            }
            
            .qr-code { position: absolute; bottom: 80px; left: 40px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                {% if logo_base64 %}
                <img src="data:image/png;base64,{{ logo_base64 }}" class="logo">
                {% else %}
                <div style="font-size: 2rem; font-weight: bold; color: {{ primary_color }};">{{ issuer_name }}</div>
                {% endif %}
                
                <div class="company-info">
                    <div class="company-name">{{ issuer_name }}</div>
                    <div>Payment Receipt</div>
                    <div>{{ issue_date }}</div>
                </div>
            </div>
            
            <div class="receipt-title-box">
                <span class="receipt-label">{{ custom_text.get('title', 'PAYMENT RECEIPT') }}</span>
                <span class="receipt-id">#{{ verification_id[:8].upper() }}</span>
            </div>
            
            <div class="details-grid">
                <div class="detail-group">
                    <div class="detail-label">Bill To</div>
                    <div class="detail-value">{{ recipient_name }}</div>
                    {% if recipient_email %}
                    <div style="font-size: 0.9rem; margin-top: 4px; color: #666;">{{ recipient_email }}</div>
                    {% endif %}
                </div>
                <div class="detail-group" style="text-align: right;">
                    <div class="detail-label">Payment Date</div>
                    <div class="detail-value">{{ issue_date }}</div>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="item-desc">{{ course_title }}</td>
                        <td class="item-total">{{ custom_text.get('body', 'Total Paid') }}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-box">
                    <div class="total-row final">
                        <span>Total Paid</span>
                        <span>{{ course_title.split('-')[-1] if '-' in course_title else 'PAID' }}</span>
                    </div>
                </div>
            </div>
            
            <div class="paid-stamp">PAID</div>
            
            <div class="qr-code">
                <img src="data:image/png;base64,{{ qr_base64 }}" style="width: 80px;">
            </div>
            
            <div class="footer">
                <p>Thank you for your business.</p>
                <p style="font-size: 0.8rem; margin-top: 5px;">Auth Signature: {{ signature }}</p>
                <p style="font-size: 0.7rem; margin-top: 5px;">Verification ID: {{ verification_id }}</p>
            </div>
        </div>
    </body>
    </html>
    """