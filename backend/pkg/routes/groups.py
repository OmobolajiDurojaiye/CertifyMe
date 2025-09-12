from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Group, Certificate, Template
from ..extensions import mail
from flask_mail import Message
from datetime import datetime
import qrcode
import base64
from io import BytesIO
from weasyprint import HTML
from flask import render_template_string
from .certificates import get_image_as_base64, _create_email_message
from pkg.pdf_templates import get_classic_pdf_template, get_modern_pdf_template

groups_bp = Blueprint('groups', __name__)

@groups_bp.route('/', methods=['POST'])
@jwt_required()
def create_group():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    name = data.get('name')

    if not name:
        return jsonify({"msg": "Group name is required"}), 400

    new_group = Group(user_id=user_id, name=name)
    db.session.add(new_group)
    db.session.commit()
    
    return jsonify({
        "msg": "Group created successfully",
        "group": { "id": new_group.id, "name": new_group.name, "certificate_count": 0 }
    }), 201

@groups_bp.route('/', methods=['GET'])
@jwt_required()
def get_groups():
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Group.query.filter_by(user_id=user_id).order_by(Group.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    groups_data = []
    for group in pagination.items:
        groups_data.append({
            "id": group.id,
            "name": group.name,
            "certificate_count": len(group.certificates),
            "created_at": group.created_at.isoformat()
        })

    return jsonify({
        "groups": groups_data,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": pagination.page
    }), 200

@groups_bp.route('/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group_details(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.filter_by(id=group_id, user_id=user_id).first_or_404()
    
    certificates_data = [{
        'id': c.id,
        'recipient_name': c.recipient_name,
        'recipient_email': c.recipient_email,
        'course_title': c.course_title,
        'issue_date': c.issue_date.isoformat(),
        'sent_at': c.sent_at.isoformat() if c.sent_at else None
    } for c in group.certificates]

    return jsonify({
        "id": group.id,
        "name": group.name,
        "certificates": certificates_data
    }), 200

@groups_bp.route('/<int:group_id>', methods=['DELETE'])
@jwt_required()
def delete_group(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.filter_by(id=group_id, user_id=user_id).first()

    if not group:
        return jsonify({"msg": "Group not found or permission denied"}), 404

    # Bulk delete associated certificates
    Certificate.query.filter_by(group_id=group.id, user_id=user_id).delete()
    
    db.session.delete(group)
    db.session.commit()
    
    return jsonify({"msg": "Group and all associated certificates deleted successfully"}), 200

@groups_bp.route('/<int:group_id>/send-bulk-email', methods=['POST'])
@jwt_required()
def send_bulk_email_for_group(group_id):
    user_id = int(get_jwt_identity())
    group = Group.query.filter_by(id=group_id, user_id=user_id).first_or_404()

    certificates_to_send = [cert for cert in group.certificates if not cert.sent_at]
    if not certificates_to_send:
        return jsonify({"msg": "All certificates in this group have already been sent."}), 400

    sent_certs, errors = [], []
    with mail.connect() as conn:
        for certificate in certificates_to_send:
            try:
                template = Template.query.get(certificate.template_id)
                if not template:
                    errors.append({"certificate_id": certificate.id, "msg": "Template not found"})
                    continue
                
                # --- PDF Generation Logic (copied from certificates.py) ---
                qr = qrcode.QRCode(version=1, box_size=10, border=4)
                verification_url = f"{current_app.config['FRONTEND_URL']}/verify/{certificate.verification_id}"
                qr.add_data(verification_url)
                qr_img = qr.make_image(fill_color="black", back_color="white")
                qr_buffer = BytesIO()
                qr_img.save(qr_buffer, format="PNG")
                qr_base64 = base64.b64encode(qr_buffer.getvalue()).decode('utf-8')
                logo_base64 = get_image_as_base64(template.logo_url)
                background_base64 = get_image_as_base64(template.background_url)
                html_template = {'classic': get_classic_pdf_template(), 'modern': get_modern_pdf_template()}.get(template.layout_style)
                context = { "recipient_name": certificate.recipient_name, "course_title": certificate.course_title, "issue_date": certificate.issue_date.strftime('%B %d, %Y'), "signature": certificate.signature or certificate.issuer_name, "issuer_name": certificate.issuer_name, "verification_id": certificate.verification_id, "logo_base64": logo_base64, "background_base64": background_base64, "primary_color": template.primary_color, "secondary_color": template.secondary_color, "body_font_color": template.body_font_color, "font_family": template.font_family, "qr_base64": qr_base64 }
                html_content = render_template_string(html_template, **context)
                
                pdf_buffer = BytesIO()
                HTML(string=html_content).write_pdf(pdf_buffer)
                # --- End PDF Generation ---

                msg = _create_email_message(certificate, template, pdf_buffer)
                conn.send(msg)
                
                certificate.sent_at = datetime.utcnow()
                sent_certs.append(certificate.id)
            except Exception as e:
                current_app.logger.error(f"Failed to send email for cert {certificate.id}: {e}")
                errors.append({"certificate_id": certificate.id, "msg": str(e)})

    db.session.commit()
    
    if errors:
        return jsonify({"msg": f"Processed with errors. Sent: {len(sent_certs)}", "sent": sent_certs, "errors": errors}), 207
    return jsonify({"msg": f"Successfully sent {len(sent_certs)} emails"}), 200