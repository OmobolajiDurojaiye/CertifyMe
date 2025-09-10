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
    formats_to_try = [
        '%Y-%m-%d',  # YYYY-MM-DD
        '%m/%d/%Y',  # MM/DD/YYYY
        '%m-%d-%Y',  # MM-DD-YYYY
        '%d-%b-%Y',  # DD-Mon-YYYY
    ]
    for fmt in formats_to_try:
        try:
            return datetime.strptime(date_string, fmt).date()
        except ValueError:
            continue
    raise ValueError(f"Date '{date_string}' could not be parsed. Use a format like YYYY-MM-DD or MM/DD/YYYY.")

def get_image_as_base64(image_path):
    if not image_path:
        return None
    try:
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        current_app.logger.error(f"Error encoding image {image_path}: {e}")
    return None

def allowed_file(filename):
    return filename.lower().endswith('.csv')

@certificate_bp.route('/', methods=['POST'])
@jwt_required()
def create_certificate():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No data provided"}), 400

    template_id = data.get('template_id')
    recipient_name = data.get('recipient_name')
    recipient_email = data.get('recipient_email')
    course_title = data.get('course_title')
    issuer_name = data.get('issuer_name')
    issue_date_str = data.get('issue_date')
    signature = data.get('signature')

    if not all([template_id, recipient_name, recipient_email, course_title, issuer_name, issue_date_str]):
        return jsonify({"msg": "Missing required fields"}), 400

    try:
        issue_date = parse_flexible_date(issue_date_str)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    template = Template.query.get(template_id)
    if not template:
        return jsonify({"msg": "Template not found"}), 404

    if not template.is_public and template.user_id != user_id:
        return jsonify({"msg": "You do not have permission to use this template"}), 403

    if template.layout_style not in ['classic', 'modern']:
        return jsonify({"msg": "Unsupported template layout"}), 400

    user = User.query.get(user_id)
    if user.cert_quota <= 0:
        return jsonify({"msg": "You have reached your certificate creation quota"}), 403

    verification_id = str(uuid.uuid4())

    new_certificate = Certificate(
        user_id=user_id,
        template_id=template_id,
        recipient_name=recipient_name,
        recipient_email=recipient_email,
        course_title=course_title,
        issuer_name=issuer_name,
        issue_date=issue_date,
        signature=signature,
        verification_id=verification_id
    )

    db.session.add(new_certificate)
    user.cert_quota -= 1
    db.session.commit()

    return jsonify({"msg": "Certificate created successfully", "certificate_id": new_certificate.id}), 201

@certificate_bp.route('/', methods=['GET'])
@jwt_required()
def get_certificates():
    user_id = int(get_jwt_identity())
    certificates = Certificate.query.filter_by(user_id=user_id).order_by(Certificate.created_at.desc()).all()
    certificates_data = [{
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
    } for c in certificates]
    return jsonify(certificates_data), 200

@certificate_bp.route('/<int:cert_id>', methods=['GET'])
@jwt_required()
def get_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404
    if certificate.user_id != user_id:
        return jsonify({"msg": "You do not have permission to view this certificate"}), 403

    certificate_data = {
        'id': certificate.id,
        'template_id': certificate.template_id,
        'recipient_name': certificate.recipient_name,
        'recipient_email': certificate.recipient_email,
        'course_title': certificate.course_title,
        'issuer_name': certificate.issuer_name,
        'issue_date': certificate.issue_date.isoformat(),
        'signature': certificate.signature,
        'verification_id': certificate.verification_id,
        'status': certificate.status,
        'sent_at': certificate.sent_at.isoformat() if certificate.sent_at else None,
        'created_at': certificate.created_at.isoformat()
    }
    return jsonify(certificate_data), 200

@certificate_bp.route('/<int:cert_id>', methods=['PUT'])
@jwt_required()
def update_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404
    if certificate.user_id != user_id:
        return jsonify({"msg": "You do not have permission to update this certificate"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"msg": "No data provided"}), 400

    template_id = data.get('template_id')
    if template_id:
        template = Template.query.get(template_id)
        if not template:
            return jsonify({"msg": "Template not found"}), 404
        if not template.is_public and template.user_id != user_id:
            return jsonify({"msg": "You do not have permission to use this template"}), 403
        if template.layout_style not in ['classic', 'modern']:
            return jsonify({"msg": "Unsupported template layout"}), 400
        certificate.template_id = template_id

    if 'recipient_name' in data:
        certificate.recipient_name = data['recipient_name']
    if 'recipient_email' in data:
        certificate.recipient_email = data['recipient_email']
    if 'course_title' in data:
        certificate.course_title = data['course_title']
    if 'issuer_name' in data:
        certificate.issuer_name = data['issuer_name']
    if 'issue_date' in data:
        try:
            certificate.issue_date = parse_flexible_date(data['issue_date'])
        except ValueError as e:
            return jsonify({"msg": str(e)}), 400
    if 'signature' in data:
        certificate.signature = data['signature']

    db.session.commit()
    return jsonify({"msg": "Certificate updated successfully"}), 200

@certificate_bp.route('/<int:cert_id>', methods=['DELETE'])
@jwt_required()
def delete_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404
    if certificate.user_id != user_id:
        return jsonify({"msg": "You do not have permission to delete this certificate"}), 403

    db.session.delete(certificate)
    db.session.commit()
    return jsonify({"msg": "Certificate deleted successfully"}), 200

@certificate_bp.route('/verify/<verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first()
    if not certificate:
        return jsonify({"msg": "Invalid verification ID"}), 404

    template = Template.query.get(certificate.template_id)
    if not template:
        return jsonify({"msg": "Associated template not found"}), 404

    certificate_data = {
        'recipient_name': certificate.recipient_name,
        'course_title': certificate.course_title,
        'issue_date': certificate.issue_date.isoformat(),
        'issuer_name': certificate.issuer_name,
        'signature': certificate.signature,
        'verification_id': certificate.verification_id,
        'status': certificate.status,
    }
    
    template_data = {
        'title': template.title,
        'logo_url': template.logo_url,
        'background_url': template.background_url,
        'primary_color': template.primary_color,
        'secondary_color': template.secondary_color,
        'body_font_color': template.body_font_color,
        'font_family': template.font_family,
        'layout_style': template.layout_style,
    }

    return jsonify({
        "certificate": certificate_data,
        "template": template_data
    }), 200

@certificate_bp.route('/bulk', methods=['POST'])
@jwt_required()
def bulk_create_certificates():
    user_id = int(get_jwt_identity())
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type, must be CSV"}), 400

    template_id = request.form.get('template_id')
    if not template_id:
        return jsonify({"msg": "Template ID is required"}), 400

    template = Template.query.get(template_id)
    if not template:
        return jsonify({"msg": "Template not found"}), 404
    if not template.is_public and template.user_id != user_id:
        return jsonify({"msg": "You do not have permission to use this template"}), 403
    if template.layout_style not in ['classic', 'modern']:
        return jsonify({"msg": "Unsupported template layout"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    try:
        csv_data = StringIO(file.read().decode('utf-8'))
        reader = csv.DictReader(csv_data)
        required_fields = {'recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date'}
        if not all(field in reader.fieldnames for field in required_fields):
            return jsonify({"msg": "CSV missing required columns: recipient_name, recipient_email, course_title, issuer_name, issue_date"}), 400

        created = 0
        errors = []

        for row in reader:
            try:
                if user.cert_quota <= 0:
                    errors.append({"row": row, "msg": "Quota exceeded"})
                    continue

                recipient_name = row['recipient_name'].strip()
                recipient_email = row['recipient_email'].strip()
                course_title = row['course_title'].strip()
                issuer_name = row['issuer_name'].strip()
                issue_date_str = row['issue_date'].strip()
                signature = row.get('signature', '').strip()

                if not all([recipient_name, recipient_email, course_title, issuer_name, issue_date_str]):
                    errors.append({"row": row, "msg": "Missing required fields"})
                    continue

                issue_date = parse_flexible_date(issue_date_str)

                new_cert = Certificate(
                    user_id=user_id,
                    template_id=template_id,
                    recipient_name=recipient_name,
                    recipient_email=recipient_email,
                    course_title=course_title,
                    issuer_name=issuer_name,
                    issue_date=issue_date,
                    signature=signature,
                    verification_id=str(uuid.uuid4())
                )
                db.session.add(new_cert)
                user.cert_quota -= 1
                created += 1
            except ValueError as e:
                errors.append({"row": row, "msg": str(e)})
            except Exception as e:
                current_app.logger.error(f"Error processing row {row}: {e}")
                errors.append({"row": row, "msg": "Unexpected error"})

        db.session.commit()

        if errors:
            return jsonify({"msg": f"Created {created} certificates with errors", "created": created, "errors": errors}), 207
        return jsonify({"msg": f"Successfully created {created} certificates", "created": created}), 201

    except Exception as e:
        current_app.logger.error(f"Error processing CSV: {e}")
        return jsonify({"msg": "Failed to process CSV file"}), 500

@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required()
def get_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404

    template = Template.query.get(certificate.template_id)
    if not template:
        return jsonify({"msg": "Template not found"}), 404
    if not template.is_public and certificate.user_id != user_id:
        return jsonify({"msg": "You do not have permission to access this certificate"}), 403
    if template.layout_style not in ['classic', 'modern']:
        return jsonify({"msg": "Unsupported template layout"}), 400

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')

    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)

    html_template = {
        'classic': get_classic_pdf_template(),
        'modern': get_modern_pdf_template()
    }.get(template.layout_style, get_classic_pdf_template())

    html_content = render_template_string(
        html_template,
        recipient_name=certificate.recipient_name,
        course_title=certificate.course_title,
        issue_date=certificate.issue_date.strftime('%B %d, %Y'),
        signature=certificate.signature or certificate.issuer_name,
        issuer_name=certificate.issuer_name,
        verification_id=certificate.verification_id,
        logo_base64=logo_base64,
        background_base64=background_base64,
        primary_color=template.primary_color,
        secondary_color=template.secondary_color,
        body_font_color=template.body_font_color,
        font_family=template.font_family,
        qr_base64=qr_base64
    )

    try:
        pdf = HTML(string=html_content).write_pdf()
        return Response(
            pdf,
            mimetype='application/pdf',
            headers={
                'Content-Disposition': f'attachment; filename=certificate_{certificate.verification_id}.pdf'
            }
        )
    except Exception as e:
        current_app.logger.error(f"Error generating PDF: {e}")
        return jsonify({"msg": "Failed to generate PDF"}), 500

@certificate_bp.route('/<int:cert_id>/send', methods=['POST'])
@jwt_required()
def send_certificate_email(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get(cert_id)
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404
    if certificate.user_id != user_id:
        return jsonify({"msg": "You do not have permission to send this certificate"}), 403

    template = Template.query.get(certificate.template_id)
    if not template:
        return jsonify({"msg": "Template not found"}), 404
    if template.layout_style not in ['classic', 'modern']:
        return jsonify({"msg": "Unsupported template layout"}), 400

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_buffer = BytesIO()
    qr_img.save(qr_buffer, format="PNG")
    qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')

    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)

    html_template = {
        'classic': get_classic_pdf_template(),
        'modern': get_modern_pdf_template()
    }.get(template.layout_style, get_classic_pdf_template())

    html_content = render_template_string(
        html_template,
        recipient_name=certificate.recipient_name,
        course_title=certificate.course_title,
        issue_date=certificate.issue_date.strftime('%B %d, %Y'),
        signature=certificate.signature or certificate.issuer_name,
        issuer_name=certificate.issuer_name,
        verification_id=certificate.verification_id,
        logo_base64=logo_base64,
        background_base64=background_base64,
        primary_color=template.primary_color,
        secondary_color=template.secondary_color,
        body_font_color=template.body_font_color,
        font_family=template.font_family,
        qr_base64=qr_base64
    )

    pdf_buffer = BytesIO()
    try:
        HTML(string=html_content).write_pdf(pdf_buffer)
    except Exception as e:
        current_app.logger.error(f"Error generating PDF for email: {e}")
        return jsonify({"msg": "Failed to generate PDF for email"}), 500

    msg = Message(
        subject=f"Your Certificate for {certificate.course_title}",
        recipients=[certificate.recipient_email],
        body=f"""
Dear {certificate.recipient_name},

Congratulations on completing {certificate.course_title}! Attached is your certificate.

Verify your certificate at: {verification_url}

Best regards,
{certificate.issuer_name}
        """
    )
    msg.attach(
        f"certificate_{certificate.verification_id}.pdf",
        "application/pdf",
        pdf_buffer.getvalue()
    )

    try:
        mail.send(msg)
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
    if not data:
        return jsonify({"msg": "No data provided"}), 400
    certificate_ids = data.get('certificate_ids', [])

    if not certificate_ids:
        return jsonify({"msg": "No certificate IDs provided"}), 400

    sent_certs = []
    errors = []

    for cert_id in certificate_ids:
        certificate = Certificate.query.get(cert_id)
        if not certificate:
            errors.append({"certificate_id": cert_id, "msg": "Certificate not found"})
            continue
        if certificate.user_id != user_id:
            errors.append({"certificate_id": cert_id, "msg": "You do not have permission to send this certificate"})
            continue

        template = Template.query.get(certificate.template_id)
        if not template:
            errors.append({"certificate_id": cert_id, "msg": "Template not found"})
            continue
        if template.layout_style not in ['classic', 'modern']:
            errors.append({"certificate_id": cert_id, "msg": "Unsupported template layout"})
            continue

        qr = qrcode.QRCode(version=1, box_size=10, border=4)
        verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
        qr.add_data(verification_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = BytesIO()
        qr_img.save(qr_buffer, format="PNG")
        qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')

        logo_base64 = get_image_as_base64(template.logo_url)
        background_base64 = get_image_as_base64(template.background_url)

        html_template = {
            'classic': get_classic_pdf_template(),
            'modern': get_modern_pdf_template()
        }.get(template.layout_style, get_classic_pdf_template())

        html_content = render_template_string(
            html_template,
            recipient_name=certificate.recipient_name,
            course_title=certificate.course_title,
            issue_date=certificate.issue_date.strftime('%B %d, %Y'),
            signature=certificate.signature or certificate.issuer_name,
            issuer_name=certificate.issuer_name,
            verification_id=certificate.verification_id,
            logo_base64=logo_base64,
            background_base64=background_base64,
            primary_color=template.primary_color,
            secondary_color=template.secondary_color,
            body_font_color=template.body_font_color,
            font_family=template.font_family,
            qr_base64=qr_base64
        )

        pdf_buffer = BytesIO()
        try:
            HTML(string=html_content).write_pdf(pdf_buffer)
        except Exception as e:
            current_app.logger.error(f"Error generating PDF for cert {cert_id}: {e}")
            errors.append({"certificate_id": cert_id, "msg": f"Failed to generate PDF: {str(e)}"})
            continue

        msg = Message(
            subject=f"Your Certificate for {certificate.course_title}",
            recipients=[certificate.recipient_email],
            body=f"""
Dear {certificate.recipient_name},

Congratulations on completing {certificate.course_title}! Attached is your certificate.

Verify your certificate at: {verification_url}

Best regards,
{certificate.issuer_name}
            """
        )
        msg.attach(
            f"certificate_{certificate.verification_id}.pdf",
            "application/pdf",
            pdf_buffer.getvalue()
        )

        try:
            mail.send(msg)
            certificate.sent_at = datetime.utcnow()
            sent_certs.append(cert_id)
        except Exception as e:
            current_app.logger.error(f"Failed to send email for cert {cert_id}: {e}")
            errors.append({"certificate_id": cert_id, "msg": f"Failed to send email: {str(e)}"})

    db.session.commit()

    if errors and not sent_certs:
        return jsonify({"msg": "Failed to send any emails", "errors": errors}), 500
    elif errors:
        return jsonify({"msg": f"Sent {len(sent_certs)} emails with some errors", "sent": sent_certs, "errors": errors}), 207
    return jsonify({"msg": f"Successfully sent {len(sent_certs)} emails", "sent": sent_certs}), 200