from flask import Blueprint, request, jsonify, render_template_string, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import db, Certificate, Template, User
import csv
from io import StringIO, BytesIO
import qrcode
import base64
import os
from weasyprint import HTML
from ..extensions import mail
from flask_mail import Message
import uuid
from ..pdf_templates import get_classic_pdf_template, get_modern_pdf_template

certificate_bp = Blueprint('certificates', __name__)

def parse_flexible_date(date_string):
    formats_to_try = ['%Y-%m-%d', '%m/%d/%Y', '%m-%d-%Y', '%d-%b-%Y']
    for fmt in formats_to_try:
        try: return datetime.strptime(date_string, fmt).date()
        except ValueError: continue
    raise ValueError(f"Date '{date_string}' could not be parsed.")

def get_image_as_base64(image_path):
    if not image_path: return None
    try:
        # Image paths from the visual editor might already be full paths
        if image_path.startswith('/uploads/'):
             full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        else: # Fallback for old system
             full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))

        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file: return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e: current_app.logger.error(f"Error encoding image {image_path}: {e}")
    return None

# --- THIS IS THE NEW FEATURE (ENHANCED) ---
def _generate_visual_certificate_pdf_in_memory(certificate, template, issuer):
    """Generates a PDF for a template created with the visual editor."""
    layout_data = template.layout_data or {}
    elements = layout_data.get('elements', [])
    background = layout_data.get('background', {})
    # Read canvas dimensions, defaulting to A4 Landscape for backward compatibility
    canvas_config = layout_data.get('canvas', {'width': 842, 'height': 595})
    page_width = canvas_config.get('width', 842)
    page_height = canvas_config.get('height', 595)

    # Data to replace placeholders
    dynamic_data = {
        "{{recipient_name}}": certificate.recipient_name,
        "{{course_title}}": certificate.course_title,
        "{{issue_date}}": certificate.issue_date.strftime('%B %d, %Y'),
        "{{issuer_name}}": certificate.issuer_name,
        "{{verification_id}}": certificate.verification_id,
        "{{signature}}": certificate.signature or certificate.issuer_name
    }
    
    # Generate QR code
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    qr.add_data(verification_url)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
    dynamic_data["{{qr_code}}"] = f'<img src="data:image/png;base64,{qr_base64}" style="width: 100%; height: 100%;" />'

    html_elements = []
    for el in elements:
        style = (
            f'position: absolute; '
            f'box-sizing: border-box; '
            f'left: {el["x"]}px; '
            f'top: {el["y"]}px; '
            f'width: {el["width"]}px; '
            f'height: {el["height"]}px; '
            f'transform-origin: 0 0; '
            f'transform: rotate({el.get("rotation", 0)}deg); '
        )
        content = ''
        el_type = el.get('type')

        if el_type == 'text' or el_type == 'placeholder':
            text = el.get('text', '')
            # Replace placeholders
            for placeholder, value in dynamic_data.items():
                 if placeholder in text:
                    text = text.replace(placeholder, str(value))
            
            style += (
                f'font-family: {el.get("fontFamily", "sans-serif")}; '
                f'font-size: {el.get("fontSize", 16)}px; '
                f'color: {el.get("fill", "#000")}; '
                f'text-align: {el.get("align", "left")}; '
                f'font-style: {"italic" if "italic" in el.get("fontStyle", "") else "normal"}; '
                f'font-weight: {"bold" if "bold" in el.get("fontStyle", "") else "normal"}; '
                'line-height: 1.2; '
                'word-wrap: break-word; ' # Enable text wrapping
            )
            content = text.replace('\\n', '<br>').replace('\n', '<br>')
        
        elif el_type == 'image':
            src = el.get('src')
            if src:
                base64_img = get_image_as_base64(src)
                if base64_img:
                    content = f'<img src="data:image/png;base64,{base64_img}" style="width: 100%; height: 100%; object-fit: contain;">'

        elif el_type == 'shape':
             style += (
                f'background-color: {el.get("fill", "transparent")}; '
                f'border: {el.get("strokeWidth", 0)}px solid {el.get("stroke", "transparent")}; '
                f'border-radius: {el.get("cornerRadius", 0)}px; '
             )
        
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
                width: {page_width}px;
                height: {page_height}px;
                position: relative;
                overflow: hidden;
                {background_style}
            }}
        </style>
    </head>
    <body>
        <div class="certificate-container">
            {''.join(html_elements)}
        </div>
    </body>
    </html>
    """
    
    pdf_buffer = BytesIO()
    try:
        HTML(string=html_template, base_url=os.path.dirname(__file__)).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)
        return pdf_buffer
    except Exception as e:
        current_app.logger.error(f"Visual PDF generation error for cert {certificate.id}: {e}")
        raise
# --- END OF NEW FEATURE ---

def _generate_certificate_pdf_in_memory(certificate):
    template = Template.query.get_or_404(certificate.template_id)
    issuer = User.query.get_or_404(certificate.user_id)
    
    # --- THIS IS THE FIX ---
    # Route to the correct PDF generator based on the template's layout style.
    if template.layout_style == 'visual':
        return _generate_visual_certificate_pdf_in_memory(certificate, template, issuer)
    # --- END OF FIX ---
    
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    qr.add_data(verification_url)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')

    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)
    signature_image_base64 = get_image_as_base64(issuer.signature_image_url)
    
    context = {
        "recipient_name": certificate.recipient_name,
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
        "extra_fields": certificate.extra_fields or {}
    }

    html_template = {'classic': get_classic_pdf_template(), 'modern': get_modern_pdf_template()}.get(template.layout_style)
    html_content = render_template_string(html_template, **context)
    
    pdf_buffer = BytesIO()
    try:
        HTML(string=html_content).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)
        return pdf_buffer
    except Exception as e:
        current_app.logger.error(f"PDF generation error for cert {certificate.id}: {e}")
        raise

def allowed_file(filename): return filename.lower().endswith('.csv')

@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required()
def get_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id: return jsonify({"msg": "Permission denied"}), 403
    
    try:
        pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
        return Response(pdf_buffer, mimetype='application/pdf', headers={'Content-Disposition': f'attachment; filename=certificate_{certificate.verification_id}.pdf'})
    except Exception as e:
        return jsonify({"msg": "Failed to generate PDF"}), 500

def _create_email_message(certificate, pdf_buffer):
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Certificate is Ready!</title>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; margin: 0; padding: 0; background-color: #f4f7f6; }}
            .container {{ width: 100%; max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee; }}
            .header img {{ max-height: 60px; }}
            .content {{ padding: 20px 0; text-align: center; }}
            .content h1 {{ color: #333333; font-size: 24px; }}
            .content p {{ color: #555555; line-height: 1.6; font-size: 16px; }}
            .course-name {{ font-size: 20px; font-weight: bold; color: #2563EB; margin: 10px 0; }}
            .button-container {{ text-align: center; padding: 20px 0; }}
            .button {{ background-color: #2563EB; color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }}
            .footer {{ text-align: center; font-size: 12px; color: #999999; padding-top: 20px; border-top: 1px solid #eeeeee; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="{ current_app.config['FRONTEND_URL'] }/images/certbadge.png" alt="CertifyMe Logo">
            </div>
            <div class="content">
                <h1>Congratulations, {certificate.recipient_name}!</h1>
                <p>You have been awarded a certificate for successfully completing:</p>
                <p class="course-name">{certificate.course_title}</p>
                <p>This credential was issued by <strong>{certificate.issuer_name}</strong>.</p>
                <p>Your official certificate is attached to this email. You can also view and verify its authenticity online at any time by clicking the button below.</p>
            </div>
            <div class="button-container">
                <a href="{verification_url}" class="button" target="_blank">View & Verify Certificate</a>
            </div>
            <div class="footer">
                <p>This certificate was issued via CertifyMe.</p>
                <p>Verification ID: {certificate.verification_id}</p>
            </div>
        </div>
    </body>
    </html>
    """
    msg = Message(
        subject=f"Your Certificate for {certificate.course_title}",
        sender=('CertifyMe', current_app.config.get('MAIL_USERNAME')),
        recipients=[certificate.recipient_email],
        html=html_body
    )
    msg.attach(f"certificate_{certificate.verification_id}.pdf", "application/pdf", pdf_buffer.getvalue())
    return msg

@certificate_bp.route('/', methods=['POST'])
@jwt_required()
def create_certificate():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    required_fields = ['template_id', 'recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    template = Template.query.get(data['template_id'])
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found or permission denied"}), 404

    if user.cert_quota <= 0:
        return jsonify({"msg": "Insufficient certificate quota remaining"}), 403

    try:
        issue_date = parse_flexible_date(data['issue_date'])
        extra_fields = data.get('extra_fields', {})

        certificate = Certificate(
            user_id=user_id,
            template_id=template.id,
            group_id=data.get('group_id'),
            recipient_name=data['recipient_name'],
            recipient_email=data['recipient_email'],
            course_title=data['course_title'],
            issuer_name=data['issuer_name'],
            issue_date=issue_date,
            signature=data.get('signature'),
            extra_fields=extra_fields,
            verification_id=str(uuid.uuid4())
        )
        user.cert_quota -= 1
        db.session.add(certificate)
        db.session.commit()

        try:
            pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
            msg = _create_email_message(certificate, pdf_buffer)
            mail.send(msg)
            certificate.sent_at = datetime.utcnow()
            db.session.commit()
            current_app.logger.info(f"Certificate {certificate.id} created and emailed to {certificate.recipient_email}")
        except Exception as e:
            current_app.logger.error(f"Email sending error for cert {certificate.id}: {e}")
            db.session.rollback()
            return jsonify({"msg": "Certificate created but failed to send email"}), 201

        return jsonify({
            "msg": "Certificate created and emailed",
            "certificate_id": certificate.id,
            "verification_id": certificate.verification_id
        }), 201
    except ValueError as e:
        return jsonify({"msg": f"Invalid date format: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Error creating certificate: {e}")
        return jsonify({"msg": "Failed to create certificate"}), 500

@certificate_bp.route('/', methods=['GET'])
@jwt_required()
def get_certificates():
    user_id = int(get_jwt_identity())
    certificates = Certificate.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': cert.id, 'recipient_name': cert.recipient_name, 
        'recipient_email': cert.recipient_email, 'course_title': cert.course_title,
        'issue_date': cert.issue_date.isoformat(), 'status': cert.status,
        'verification_id': cert.verification_id, 'sent_at': cert.sent_at.isoformat() if cert.sent_at else None,
        'template_id': cert.template_id, 'group_id': cert.group_id,
        'extra_fields': cert.extra_fields
    } for cert in certificates]), 200

@certificate_bp.route('/<int:cert_id>', methods=['GET'])
@jwt_required()
def get_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403
    
    template = Template.query.get_or_404(certificate.template_id)
    cert_data = {
        'id': certificate.id, 'recipient_name': certificate.recipient_name, 
        'recipient_email': certificate.recipient_email, 'course_title': certificate.course_title, 
        'issue_date': certificate.issue_date.isoformat(), 'issuer_name': certificate.issuer_name, 
        'signature': certificate.signature, 'verification_id': certificate.verification_id, 
        'status': certificate.status, 'extra_fields': certificate.extra_fields
    }
    template_data = {
        'id': template.id, 'title': template.title, 'logo_url': template.logo_url, 
        'background_url': template.background_url, 'primary_color': template.primary_color, 
        'secondary_color': template.secondary_color, 'body_font_color': template.body_font_color, 
        'font_family': template.font_family, 'layout_style': template.layout_style, 
        'is_public': template.is_public, 'custom_text': template.custom_text
    }
    return jsonify({ "certificate": cert_data, "template": template_data }), 200

@certificate_bp.route('/bulk', methods=['POST'])
@jwt_required()
def bulk_create_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if 'file' not in request.files: return jsonify({"msg": "No file part"}), 400
    
    file = request.files['file']
    if not file or not allowed_file(file.filename): return jsonify({"msg": "Invalid file type, must be CSV"}), 400
    
    template_id = request.form.get('template_id')
    group_id = request.form.get('group_id')
    if not template_id or not group_id: return jsonify({"msg": "Template ID and Group ID are required"}), 400
    
    template = Template.query.get(template_id)
    if not template or (not template.is_public and template.user_id != user_id): return jsonify({"msg": "Template not found or permission denied"}), 404
    
    try:
        csv_text = file.read().decode('utf-8-sig')
        csv_data = StringIO(csv_text)
        reader = csv.DictReader(csv_data)
        
        if reader.fieldnames:
            reader.fieldnames = [h.lower().strip().replace(' ', '_') for h in reader.fieldnames]

        standard_headers = {'recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date', 'signature'}
        required_headers = {'recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date'}
        
        all_headers = set(reader.fieldnames or [])
        if not required_headers.issubset(all_headers):
            missing = required_headers - all_headers
            return jsonify({"msg": f"CSV is missing required columns: {', '.join(missing)}"}), 400

        extra_headers = list(all_headers - standard_headers)
        
        created, errors, certs_to_add = 0, [], []
        for i, row in enumerate(reader):
            row_num = i + 2 # Account for header row
            if user.cert_quota <= 0:
                errors.append({"row": row_num, "msg": "Insufficient certificate quota remaining"})
                continue
            try:
                for field in required_headers:
                    if not row.get(field, '').strip():
                        raise KeyError(f"'{field}' column cannot be empty.")
                
                issue_date = parse_flexible_date(row['issue_date'])
                extra_fields_data = {header: row[header] for header in extra_headers if row.get(header)}

                new_cert = Certificate(
                    user_id=user_id, 
                    template_id=template.id, 
                    group_id=group_id, 
                    recipient_name=row['recipient_name'], 
                    recipient_email=row['recipient_email'], 
                    course_title=row['course_title'], 
                    issuer_name=row['issuer_name'], 
                    issue_date=issue_date, 
                    signature=row.get('signature'),
                    extra_fields=extra_fields_data
                )
                certs_to_add.append(new_cert)
                user.cert_quota -= 1
                created += 1
            except (ValueError, KeyError) as e:
                errors.append({"row": row_num, "msg": f"Invalid data: {str(e)}"})
        
        db.session.bulk_save_objects(certs_to_add)
        db.session.commit()
        
        if errors: return jsonify({"msg": f"Processed with {len(errors)} errors.", "created": created, "errors": errors}), 207
        return jsonify({"msg": f"Successfully created {created} certificates"}), 201
    except Exception as e:
        current_app.logger.error(f"CSV Error: {e}")
        return jsonify({"msg": f"Failed to process CSV file: {str(e)}"}), 500

@certificate_bp.route('/bulk-template', methods=['GET'])
@jwt_required()
def download_bulk_template():
    output = StringIO()
    writer = csv.writer(output)
    headers = ['recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date', 'signature']
    writer.writerow(headers)
    output.seek(0)
    return Response(output, mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=certifyme_bulk_template.csv"})

@certificate_bp.route('/<int:cert_id>/send', methods=['POST'])
@jwt_required()
def send_certificate_email(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403
    
    try:
        pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
        msg = _create_email_message(certificate, pdf_buffer)
        mail.send(msg)
        certificate.sent_at = datetime.utcnow()
        db.session.commit()
        current_app.logger.info(f"Certificate {certificate.id} emailed to {certificate.recipient_email}")
        return jsonify({"msg": "Certificate emailed successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Email sending error for cert {certificate.id}: {e}")
        return jsonify({"msg": "Failed to send email"}), 500

@certificate_bp.route('/bulk-send', methods=['POST'])
@jwt_required()
def send_bulk_emails():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    certificate_ids = data.get('certificate_ids', [])
    if not certificate_ids:
        return jsonify({"msg": "No certificate IDs provided"}), 400

    sent, errors = 0, []
    for cert_id in certificate_ids:
        certificate = Certificate.query.get(cert_id)
        if not certificate or certificate.user_id != user_id:
            errors.append({"certificate_id": cert_id, "msg": "Certificate not found or permission denied"})
            continue
        
        try:
            pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
            msg = _create_email_message(certificate, pdf_buffer)
            mail.send(msg)
            certificate.sent_at = datetime.utcnow()
            sent += 1
        except Exception as e:
            errors.append({"certificate_id": cert_id, "msg": str(e)})
    
    db.session.commit()
    if errors:
        return jsonify({"msg": f"Sent {sent} emails with {len(errors)} errors", "sent": sent, "errors": errors}), 207
    return jsonify({"msg": f"Successfully sent {sent} emails"}), 200

@certificate_bp.route('/verify/<string:verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404

    template = Template.query.get_or_404(certificate.template_id)
    issuer = User.query.get_or_404(certificate.user_id)
    
    return jsonify({
        "certificate": {
            "id": certificate.id,
            "recipient_name": certificate.recipient_name,
            "recipient_email": certificate.recipient_email,
            "course_title": certificate.course_title,
            "issue_date": certificate.issue_date.isoformat(),
            "issuer_name": certificate.issuer_name,
            "status": certificate.status,
            "verification_id": certificate.verification_id,
            "extra_fields": certificate.extra_fields
        },
        "template": {
            "title": template.title,
            "primary_color": template.primary_color,
            "secondary_color": template.secondary_color,
            "font_family": template.font_family,
            "layout_style": template.layout_style,
            "custom_text": template.custom_text
        },
        "issuer": {
            "name": issuer.name,
            "email": issuer.email
        }
    }), 200

@certificate_bp.route('/<int:cert_id>/status', methods=['PUT'])
@jwt_required()
def update_certificate_status(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403
    
    data = request.get_json()
    status = data.get('status')
    if status not in ['valid', 'revoked']:
        return jsonify({"msg": "Invalid status"}), 400
    
    certificate.status = status
    db.session.commit()
    current_app.logger.info(f"Certificate {certificate.id} status updated to {status}")
    return jsonify({"msg": f"Certificate status updated to {status}"}), 200