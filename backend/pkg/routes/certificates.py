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
from pkg.pdf_templates import get_classic_pdf_template, get_modern_pdf_template

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
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file: return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e: current_app.logger.error(f"Error encoding image {image_path}: {e}")
    return None

def allowed_file(filename): return filename.lower().endswith('.csv')

def check_and_handle_expiry(user):
    """Checks if a starter plan has expired and reverts user to free if so."""
    if user.role == 'starter' and user.subscription_expiry and user.subscription_expiry < datetime.utcnow():
        user.role = 'free'
        user.cert_quota = 10  # Reset to default free quota
        user.subscription_expiry = None
        db.session.commit()
        current_app.logger.info(f"User {user.id} starter plan expired, reverted to free.")
        return True
    return False

@certificate_bp.route('/', methods=['POST'])
@jwt_required()
def create_certificate():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    check_and_handle_expiry(user) # Check for expiry before proceeding

    data = request.get_json()
    if not data: return jsonify({"msg": "No data provided"}), 400
    required_fields = ['template_id', 'recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date']
    if not all(field in data for field in required_fields): return jsonify({"msg": "Missing required fields"}), 400
    
    try: issue_date = parse_flexible_date(data['issue_date'])
    except ValueError as e: return jsonify({"msg": str(e)}), 400
    
    template = Template.query.get(data['template_id'])
    if not template: return jsonify({"msg": "Template not found"}), 404
    if not template.is_public and template.user_id != user_id: return jsonify({"msg": "Permission denied"}), 403
    
    if user.role == 'free' and user.cert_quota <= 0:
        return jsonify({"msg": "Certificate quota reached. Please upgrade your plan."}), 403

    new_certificate = Certificate(user_id=user_id, template_id=data['template_id'], recipient_name=data['recipient_name'], recipient_email=data['recipient_email'], course_title=data['course_title'], issuer_name=data['issuer_name'], issue_date=issue_date, signature=data.get('signature'), verification_id=str(uuid.uuid4()))
    db.session.add(new_certificate)
    if user.role == 'free':
        user.cert_quota -= 1
    db.session.commit()
    return jsonify({"msg": "Certificate created successfully", "certificate_id": new_certificate.id}), 201

@certificate_bp.route('/', methods=['GET'])
@jwt_required()
def get_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    check_and_handle_expiry(user) # Check for expiry when user views their certs
    certs = Certificate.query.filter_by(user_id=user_id).order_by(Certificate.created_at.desc()).all()
    return jsonify([{'id': c.id, 'template_id': c.template_id, 'recipient_name': c.recipient_name, 'recipient_email': c.recipient_email, 'course_title': c.course_title, 'issuer_name': c.issuer_name, 'issue_date': c.issue_date.isoformat(), 'signature': c.signature, 'verification_id': c.verification_id, 'status': c.status, 'sent_at': c.sent_at.isoformat() if c.sent_at else None, 'created_at': c.created_at.isoformat()} for c in certs]), 200


@certificate_bp.route('/<int:cert_id>', methods=['GET'])
@jwt_required()
def get_certificate(cert_id):
    user_id = int(get_jwt_identity())
    c = Certificate.query.get(cert_id)
    if not c or c.user_id != user_id:
        return jsonify({"msg": "Certificate not found or permission denied"}), 404
    return jsonify({
        'id': c.id,
        'template_id': c.template_id,
        'recipient_name': c.recipient_name,
        'recipient_email': c.recipient_email,
        'course_title': c.course_title,
        'issuer_name': c.issuer_name,
        'issue_date': c.issue_date.isoformat(),
        'signature': c.signature,
        'verification_id': c.verification_id,
        'status': c.status,
        'sent_at': c.sent_at.isoformat() if c.sent_at else None,
        'created_at': c.created_at.isoformat()
    }), 200


@certificate_bp.route('/<int:cert_id>', methods=['PUT'])
@jwt_required()
def update_certificate(cert_id):
    user_id = int(get_jwt_identity())
    cert = Certificate.query.get(cert_id)
    if not cert or cert.user_id != user_id: return jsonify({"msg": "Certificate not found or permission denied"}), 404
    data = request.get_json()
    for field in ['recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'signature', 'template_id']:
        if field in data: setattr(cert, field, data[field])
    if 'issue_date' in data:
        try: cert.issue_date = parse_flexible_date(data['issue_date'])
        except ValueError as e: return jsonify({"msg": str(e)}), 400
    db.session.commit()
    return jsonify({"msg": "Certificate updated successfully"}), 200
@certificate_bp.route('/<int:cert_id>', methods=['DELETE'])
@jwt_required()
def delete_certificate(cert_id):
    user_id = int(get_jwt_identity())
    cert = Certificate.query.get(cert_id)
    if not cert or cert.user_id != user_id: return jsonify({"msg": "Certificate not found or permission denied"}), 404
    db.session.delete(cert)
    db.session.commit()
    return jsonify({"msg": "Certificate deleted successfully"}), 200
@certificate_bp.route('/verify/<verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first_or_404()
    template = Template.query.get_or_404(certificate.template_id)
    return jsonify({ "certificate": { 'recipient_name': certificate.recipient_name, 'course_title': certificate.course_title, 'issue_date': certificate.issue_date.isoformat(), 'issuer_name': certificate.issuer_name, 'signature': certificate.signature, 'verification_id': certificate.verification_id, 'status': certificate.status }, "template": { 'title': template.title, 'logo_url': template.logo_url, 'background_url': template.background_url, 'primary_color': template.primary_color, 'secondary_color': template.secondary_color, 'body_font_color': template.body_font_color, 'font_family': template.font_family, 'layout_style': template.layout_style } }), 200

@certificate_bp.route('/bulk', methods=['POST'])
@jwt_required()
def bulk_create_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    check_and_handle_expiry(user) # Check for expiry first

    if 'file' not in request.files: return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if not file or not allowed_file(file.filename): return jsonify({"msg": "Invalid file type, must be CSV"}), 400
    
    template_id = request.form.get('template_id')
    group_id = request.form.get('group_id') # <-- GET THE GROUP ID FROM THE FORM
    
    if not template_id or not group_id:
        return jsonify({"msg": "Template ID and Group ID are required"}), 400

    template = Template.query.get(template_id)
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found or permission denied"}), 404

    try:
        csv_data = StringIO(file.read().decode('utf-8'))
        reader = csv.DictReader(csv_data)
        created, errors = 0, []
        
        certs_to_add = []
        
        for row in reader:
            if user.role == 'free' and user.cert_quota <= 0:
                errors.append({"row": row, "msg": "Quota exceeded"})
                continue
            try:
                new_cert = Certificate(
                    user_id=user_id,
                    template_id=template.id,
                    group_id=group_id, # <-- ADD THE GROUP ID
                    recipient_name=row['recipient_name'],
                    recipient_email=row['recipient_email'],
                    course_title=row['course_title'],
                    issuer_name=row['issuer_name'],
                    issue_date=parse_flexible_date(row['issue_date']),
                    signature=row.get('signature')
                )
                certs_to_add.append(new_cert)
                if user.role == 'free':
                    user.cert_quota -= 1
                created += 1
            except (ValueError, KeyError) as e:
                errors.append({"row": row, "msg": f"Missing or invalid data: {str(e)}"})
        
        db.session.bulk_save_objects(certs_to_add) # More efficient bulk insert
        db.session.commit()
        
        if errors: return jsonify({"msg": f"Created {created} certificates with errors", "created": created, "errors": errors}), 207
        return jsonify({"msg": f"Successfully created {created} certificates"}), 201
    except Exception as e:
        current_app.logger.error(f"CSV Error: {e}")
        return jsonify({"msg": "Failed to process CSV file"}), 500
    
@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required()
def get_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate or certificate.user_id != user_id: return jsonify({"msg": "Not found or permission denied"}), 404
    template = Template.query.get(certificate.template_id)
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)
    html_template = {'classic': get_classic_pdf_template(), 'modern': get_modern_pdf_template()}.get(template.layout_style)
    html_content = render_template_string(html_template, recipient_name=certificate.recipient_name, course_title=certificate.course_title, issue_date=certificate.issue_date.strftime('%B %d, %Y'), signature=certificate.signature or certificate.issuer_name, issuer_name=certificate.issuer_name, verification_id=certificate.verification_id, logo_base64=logo_base64, background_base64=background_base64, primary_color=template.primary_color, secondary_color=template.secondary_color, body_font_color=template.body_font_color, font_family=template.font_family, qr_base64=qr_base64)
    try:
        pdf = HTML(string=html_content).write_pdf()
        return Response(pdf, mimetype='application/pdf', headers={'Content-Disposition': f'attachment; filename=certificate_{certificate.verification_id}.pdf'})
    except Exception as e: current_app.logger.error(f"PDF Error: {e}"); return jsonify({"msg": "Failed to generate PDF"}), 500

# --- START OF EMAIL FIXES ---

def _create_email_message(certificate, template, pdf_buffer):
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: 20px auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
            .header {{ text-align: center; padding-bottom: 20px; border-bottom: 1px solid #dddddd; }}
            .header img {{ max-height: 50px; }}
            .content {{ padding: 20px 0; }}
            .content h1 {{ color: #333333; }}
            .content p {{ color: #555555; line-height: 1.6; }}
            .button-container {{ text-align: center; padding: 20px 0; }}
            .button {{ background-color: #2563EB; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; }}
            .footer {{ text-align: center; font-size: 12px; color: #888888; padding-top: 20px; border-top: 1px solid #dddddd; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://certifyme.com.ng/images/certbadge.png" alt="CertifyMe Logo">
            </div>
            <div class="content">
                <h1>Congratulations, {certificate.recipient_name}!</h1>
                <p>You have been awarded a certificate for successfully completing the course:</p>
                <h2 style="color: #333;">{certificate.course_title}</h2>
                <p>This credential was issued by <strong>{certificate.issuer_name}</strong>.</p>
                <p>Your certificate is attached to this email. You can also view and verify its authenticity online by clicking the button below.</p>
            </div>
            <div class="button-container">
                <a href="{verification_url}" class="button">Verify Certificate</a>
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
        html=html_body  # Use the new html body
    )
    msg.attach(f"certificate_{certificate.verification_id}.pdf", "application/pdf", pdf_buffer.getvalue())
    return msg

@certificate_bp.route('/<int:cert_id>/send', methods=['POST'])
@jwt_required()
def send_certificate_email(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate or certificate.user_id != user_id:
        return jsonify({"msg": "Certificate not found or permission denied"}), 404
    template = Template.query.get(certificate.template_id)

    # Simplified PDF Generation
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}")
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
    
    context = {
        "recipient_name": certificate.recipient_name, "course_title": certificate.course_title,
        "issue_date": certificate.issue_date.strftime('%B %d, %Y'), "signature": certificate.signature or certificate.issuer_name,
        "issuer_name": certificate.issuer_name, "verification_id": certificate.verification_id,
        "logo_base64": get_image_as_base64(template.logo_url), "background_base64": get_image_as_base64(template.background_url),
        "primary_color": template.primary_color, "secondary_color": template.secondary_color,
        "body_font_color": template.body_font_color, "font_family": template.font_family,
        "qr_base64": base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
    }
    html_template = {'classic': get_classic_pdf_template(), 'modern': get_modern_pdf_template()}.get(template.layout_style)
    html_content = render_template_string(html_template, **context)
    
    pdf_buffer = BytesIO()
    try: HTML(string=html_content).write_pdf(pdf_buffer)
    except Exception as e:
        current_app.logger.error(f"Error generating PDF for email: {e}")
        return jsonify({"msg": "Failed to generate PDF for email"}), 500

    try:
        msg = _create_email_message(certificate, template, pdf_buffer)
        mail.send(msg) # Using the simple send method
        certificate.sent_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Email sent successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {e}")
        return jsonify({"msg": f"Failed to send email: {str(e)}"}), 500

@certificate_bp.route('/bulk-send', methods=['POST'])
@jwt_required()
def bulk_send_emails():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data or 'certificate_ids' not in data:
        return jsonify({"msg": "No certificate IDs provided"}), 400
    
    sent_certs, errors = [], []

    for cert_id in data['certificate_ids']:
        certificate = Certificate.query.get(cert_id)
        if not certificate or certificate.user_id != user_id:
            errors.append({"certificate_id": cert_id, "msg": "Not found or permission denied"})
            continue
        
        template = Template.query.get(certificate.template_id)
        if not template:
            errors.append({"certificate_id": cert_id, "msg": "Template not found"})
            continue

        # Simplified PDF Generation
        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        qr.add_data(f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}")
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = BytesIO(); qr_img.save(qr_buffer, format="PNG")
        
        context = {
            "recipient_name": certificate.recipient_name, "course_title": certificate.course_title,
            "issue_date": certificate.issue_date.strftime('%B %d, %Y'), "signature": certificate.signature or certificate.issuer_name,
            "issuer_name": certificate.issuer_name, "verification_id": certificate.verification_id,
            "logo_base64": get_image_as_base64(template.logo_url), "background_base64": get_image_as_base64(template.background_url),
            "primary_color": template.primary_color, "secondary_color": template.secondary_color,
            "body_font_color": template.body_font_color, "font_family": template.font_family,
            "qr_base64": base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
        }
        html_template = {'classic': get_classic_pdf_template(), 'modern': get_modern_pdf_template()}.get(template.layout_style)
        html_content = render_template_string(html_template, **context)

        pdf_buffer = BytesIO()
        try: HTML(string=html_content).write_pdf(pdf_buffer)
        except Exception as e:
            errors.append({"certificate_id": cert_id, "msg": f"PDF generation failed: {e}"})
            continue

        try:
            msg = _create_email_message(certificate, template, pdf_buffer)
            mail.send(msg)
            certificate.sent_at = datetime.utcnow()
            sent_certs.append(cert_id)
        except Exception as e:
            errors.append({"certificate_id": cert_id, "msg": f"Email sending failed: {e}"})

    db.session.commit()

    if errors:
        return jsonify({"msg": f"Processed with errors. Sent: {len(sent_certs)}", "sent": sent_certs, "errors": errors}), 207
    return jsonify({"msg": f"Successfully sent {len(sent_certs)} emails"}), 200
