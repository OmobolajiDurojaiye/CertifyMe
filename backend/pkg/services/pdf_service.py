import os
import base64
import qrcode
from io import BytesIO
from flask import current_app, render_template_string
from weasyprint import HTML
from ..pdf_templates import (
    get_classic_pdf_template, 
    get_modern_pdf_template, 
    get_receipt_pdf_template
)

def get_image_as_base64(image_path):
    if not image_path:
        return None
    try:
        # Handle both relative (upload) and absolute paths
        if image_path.startswith('/uploads/'):
             full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        else:
             full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))

        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        current_app.logger.error(f"Error encoding image {image_path}: {e}")
    return None

def generate_certificate_pdf(certificate, template, issuer):
    """
    Main entry point for PDF generation.
    Decides whether to use Visual (Canvas) or HTML templates.
    """
    if template.layout_style == 'visual':
        return _generate_visual_pdf(certificate, template, issuer)
    
    return _generate_html_pdf(certificate, template, issuer)

def _generate_visual_pdf(certificate, template, issuer):
    layout_data = template.layout_data or {}
    elements = layout_data.get('elements', [])
    background = layout_data.get('background', {})
    canvas_config = layout_data.get('canvas', {'width': 842, 'height': 595})
    page_width = canvas_config.get('width', 842)
    page_height = canvas_config.get('height', 595)

    # Prepare dynamic data
    extra = certificate.extra_fields or {}
    amount_text = extra.get('amount', 'PAID')

    dynamic_data = {
        "{{recipient_name}}": certificate.recipient_name,
        "{{course_title}}": certificate.course_title,
        "{{issue_date}}": certificate.issue_date.strftime('%B %d, %Y'),
        "{{issuer_name}}": certificate.issuer_name,
        "{{verification_id}}": certificate.verification_id,
        "{{signature}}": certificate.signature or certificate.issuer_name,
        "{{amount}}": amount_text
    }
    
    # Merge any other extra fields into dynamic data
    for key, val in extra.items():
        dynamic_data[f"{{{{{key}}}}}"] = val

    # Generate QR
    qr_base64 = _generate_qr_base64(certificate.verification_id)
    dynamic_data["{{qr_code}}"] = f'<img src="data:image/png;base64,{qr_base64}" style="width: 100%; height: 100%;" />'

    html_elements = []
    for el in elements:
        style = (
            f'position: absolute; left: {el["x"]}px; top: {el["y"]}px; '
            f'width: {el["width"]}px; height: {el["height"]}px; '
            f'transform-origin: 0 0; transform: rotate({el.get("rotation", 0)}deg); '
        )
        content = ''
        el_type = el.get('type')

        if el_type == 'text' or el_type == 'placeholder':
            text = el.get('text', '')
            for placeholder, value in dynamic_data.items():
                 if placeholder in text:
                    text = text.replace(placeholder, str(value))

            style += (
                f'font-family: {el.get("fontFamily", "sans-serif")}; '
                f'font-size: {el.get("fontSize", 16)}px; '
                f'color: {el.get("fill", "#000")}; '
                f'text-align: {el.get("align", "left")}; '
                f'font-style: {el.get("fontStyle", "normal")}; '
                'line-height: 1.2; word-wrap: break-word; display: flex; align-items: center; '
            )
            
            # Vertical alignment helper
            if el.get('align') == 'center': style += 'justify-content: center;'
            elif el.get('align') == 'right': style += 'justify-content: flex-end;'
                
            content = text.replace('\\n', '<br>').replace('\n', '<br>')

        elif el_type == 'image':
            src = el.get('src')
            if src:
                base64_img = get_image_as_base64(src)
                if base64_img:
                    content = f'<img src="data:image/png;base64,{base64_img}" style="width: 100%; height: 100%; object-fit: contain;">'

        html_elements.append(f'<div style="{style}">{content}</div>')

    background_style = ''
    if background.get('fill'):
        background_style += f'background-color: {background["fill"]};'
    if background.get('image'):
         base64_bg = get_image_as_base64(background["image"])
         if base64_bg:
            background_style += f"background-image: url('data:image/png;base64,{base64_bg}'); background-size: cover; background-position: center;"

    html_template = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page {{ size: {page_width}px {page_height}px; margin: 0; }}
            body {{ margin: 0; padding: 0; font-family: sans-serif; }}
            .certificate-container {{
                width: {page_width}px; height: {page_height}px;
                position: relative; overflow: hidden;
                {background_style}
            }}
        </style>
    </head>
    <body>
        <div class="certificate-container">{''.join(html_elements)}</div>
    </body>
    </html>
    """
    return _render_pdf_bytes(html_template)

def _generate_html_pdf(certificate, template, issuer):
    qr_base64 = _generate_qr_base64(certificate.verification_id)
    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)
    signature_image_base64 = get_image_as_base64(issuer.signature_image_url)
    
    # Handle amount logic for receipts
    extra = certificate.extra_fields or {}
    amount = extra.get('amount')
    
    # If no amount in extra_fields, try parsing from course title if it looks like currency
    if not amount and certificate.course_title:
        import re
        match = re.search(r'[$₦]\s?[\d,]+(\.\d{2})?', certificate.course_title)
        amount = match.group(0) if match else "PAID"

    context = {
        "recipient_name": certificate.recipient_name,
        "recipient_email": certificate.recipient_email,
        "course_title": certificate.course_title,
        "issue_date": certificate.issue_date.strftime('%B %d, %Y'),
        "signature": certificate.signature or certificate.issuer_name,
        "issuer_name": certificate.issuer_name,
        "verification_id": certificate.verification_id,
        "frontend_url": current_app.config['FRONTEND_URL'].replace('https://', '').replace('http://', ''),
        "logo_base64": logo_base64,
        "background_base64": background_base64,
        "primary_color": template.primary_color,
        "secondary_color": template.secondary_color,
        "body_font_color": template.body_font_color,
        "font_family": template.font_family,
        "qr_base64": qr_base64,
        "custom_text": template.custom_text or {},
        "signature_image_base64": signature_image_base64,
        "extra_fields": extra,
        "amount": amount
    }

    # Only include supported templates
    html_template_str = {
        'classic': get_classic_pdf_template(), 
        'modern': get_modern_pdf_template(),
        'receipt': get_receipt_pdf_template()
    }.get(template.layout_style, get_modern_pdf_template())
    
    html_content = render_template_string(html_template_str, **context)
    return _render_pdf_bytes(html_content)

def _generate_qr_base64(data):
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{data}"
    qr.add_data(verification_url)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
    return base64.b64encode(qr_buffer.getvalue()).decode('utf-8')

def _render_pdf_bytes(html_content):
    pdf_buffer = BytesIO()
    try:
        HTML(string=html_content).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)
        return pdf_buffer
    except Exception as e:
        current_app.logger.error(f"WeasyPrint PDF generation error: {e}")
        raise