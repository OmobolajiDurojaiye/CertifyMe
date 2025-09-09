from flask import Blueprint, request, jsonify, render_template_string, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from ..models import db, Certificate, Template, User
import csv
from io import StringIO, BytesIO
import qrcode
import base64
import os
from weasyprint import HTML, CSS

certificate_bp = Blueprint('certificates', __name__)

def get_image_as_base64(image_path):
    """Helper function to convert local image files to base64 strings."""
    if not image_path:
        return None
    try:
        # Construct the full path from the UPLOAD_FOLDER
        full_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(image_path))
        if os.path.exists(full_path):
            with open(full_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
    except Exception as e:
        print(f"Error encoding image {image_path}: {e}")
    return None

@certificate_bp.route('/', methods=['POST'])
@jwt_required(locations=["headers"])
def create_certificate():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.cert_quota <= 0:
        return jsonify({"msg": "Certificate quota exceeded"}), 403

    data = request.get_json()

    required_fields = ['recipient_name', 'course_title', 'issue_date', 'template_id']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    template_id = data.get('template_id')
    template = Template.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({"msg": "Template not found or does not belong to user"}), 404

    try:
        issue_date_obj = datetime.strptime(data['issue_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400

    new_certificate = Certificate(
        user_id=user_id, 
        template_id=template.id, 
        recipient_name=data['recipient_name'],
        course_title=data['course_title'], 
        issue_date=issue_date_obj,
        signature=data.get('signature', '')
    )
    
    user.cert_quota -= 1
    
    db.session.add(new_certificate)
    db.session.commit()
    
    return jsonify({
        "msg": "Certificate created successfully", 
        "id": new_certificate.id,
        "verification_id": new_certificate.verification_id,
        "remaining_quota": user.cert_quota
    }), 201

@certificate_bp.route('/bulk', methods=['POST'])
@jwt_required(locations=["headers"])
def bulk_create_certificates():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if 'file' not in request.files or 'template_id' not in request.form:
        return jsonify({"msg": "Missing CSV file or template_id"}), 400

    template_id = request.form.get('template_id')
    template = Template.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({"msg": "Template not found or does not belong to user"}), 404

    csv_file = request.files['file']
    if not csv_file.filename.endswith('.csv'):
        return jsonify({"msg": "File must be a CSV"}), 400

    try:
        # Read CSV file
        stream = StringIO(csv_file.stream.read().decode("UTF-8"))
        csv_reader = csv.DictReader(stream)
        required_fields = ['recipient_name', 'course_title', 'issue_date']
        if not all(field in csv_reader.fieldnames for field in required_fields):
            return jsonify({"msg": "CSV missing required fields: recipient_name, course_title, issue_date"}), 400

        certificates = []
        errors = []
        for row in csv_reader:
            if user.cert_quota <= 0:
                errors.append({"row": row, "error": "Certificate quota exceeded"})
                break

            try:
                issue_date = datetime.strptime(row['issue_date'], '%Y-%m-%d').date()
                certificate = Certificate(
                    user_id=user_id,
                    template_id=template_id,
                    recipient_name=row['recipient_name'],
                    course_title=row['course_title'],
                    issue_date=issue_date,
                    signature=row.get('signature', '')
                )
                certificates.append(certificate)
                user.cert_quota -= 1
            except ValueError:
                errors.append({"row": row, "error": "Invalid date format. Use YYYY-MM-DD."})

        if certificates:
            db.session.add_all(certificates)
            db.session.commit()

        response = {
            "msg": "Bulk certificate creation processed",
            "created": len(certificates),
            "errors": errors
        }
        return jsonify(response), 201 if certificates else 400
    except Exception as e:
        return jsonify({"msg": f"Error processing CSV: {str(e)}"}), 400

@certificate_bp.route('/', methods=['GET'])
@jwt_required(locations=["headers"])
def get_user_certificates():
    user_id = int(get_jwt_identity())
    certificates = Certificate.query.filter_by(user_id=user_id).order_by(Certificate.created_at.desc()).all()
    certs_data = [{
        'id': c.id, 
        'recipient_name': c.recipient_name, 
        'course_title': c.course_title,
        'issue_date': c.issue_date.isoformat(),
        'signature': c.signature,
        'status': c.status,
        'verification_id': c.verification_id
    } for c in certificates]
    return jsonify(certs_data), 200

@certificate_bp.route('/<int:cert_id>', methods=['PUT'])
@jwt_required(locations=["headers"])
def update_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found or does not belong to user"}), 404

    data = request.get_json()
    if 'recipient_name' in data:
        certificate.recipient_name = data['recipient_name']
    if 'course_title' in data:
        certificate.course_title = data['course_title']
    if 'issue_date' in data:
        try:
            certificate.issue_date = datetime.strptime(data['issue_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"msg": "Invalid date format. Use YYYY-MM-DD."}), 400
    if 'signature' in data:
        certificate.signature = data['signature']
    if 'status' in data:
        certificate.status = data['status']

    db.session.commit()
    
    return jsonify({"msg": "Certificate updated successfully"}), 200

@certificate_bp.route('/<int:cert_id>', methods=['DELETE'])
@jwt_required(locations=["headers"])
def delete_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found or does not belong to user"}), 404

    db.session.delete(certificate)
    db.session.commit()
    
    return jsonify({"msg": "Certificate deleted successfully"}), 200

@certificate_bp.route('/<int:cert_id>', methods=['GET'])
@jwt_required(locations=["headers"])
def get_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found or does not belong to user"}), 404

    cert_data = {
        'id': certificate.id,
        'recipient_name': certificate.recipient_name,
        'course_title': certificate.course_title,
        'issue_date': certificate.issue_date.isoformat(),
        'signature': certificate.signature,
        'status': certificate.status,
        'verification_id': certificate.verification_id,
        'template_id': certificate.template_id
    }
    return jsonify(cert_data), 200
    
@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required(locations=["headers"])
def generate_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.filter_by(id=cert_id, user_id=user_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404

    template = Template.query.get(certificate.template_id)
    if not template:
        return jsonify({"msg": "Template not found"}), 404

    # Generate QR code
    # NOTE: The URL should point to your frontend's verification page
    verification_url = f"http://localhost:3000/verify/{certificate.verification_id}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(verification_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill='black', back_color='white')
    
    buffered_qr = BytesIO()
    qr_img.save(buffered_qr, format="PNG")
    qr_base64 = base64.b64encode(buffered_qr.getvalue()).decode('utf-8')

    # Get logo and background as base64
    logo_base64 = get_image_as_base64(template.logo_url)
    background_base64 = get_image_as_base64(template.background_url)

    # HTML Template for the PDF
    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Certificate</title>
        <style>
            @page { size: A4 landscape; margin: 0; }
            body {
                margin: 0;
                padding: 0;
                font-family: '{{ font_family }}', serif;
                text-align: center;
                color: #333;
                background-color: #f8f9fa;
                {% if background_base64 %}
                background-image: url(data:image/jpeg;base64,{{ background_base64 }});
                background-size: cover;
                background-position: center;
                {% endif %}
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
                padding: 40px;
            }
            .container {
                position: relative;
                width: 100%;
                max-width: 900px;
            }
            .logo {
                max-width: 120px;
                margin-bottom: 20px;
            }
            h1 {
                font-size: 3em;
                color: {{ primary_color }};
                margin-bottom: 20px;
            }
            p { font-size: 1.2em; margin: 8px 0; }
            strong { font-weight: bold; }
            .signature-block {
                margin-top: 50px;
                border-top: 2px solid {{ primary_color }};
                padding-top: 10px;
                width: 300px;
                margin-left: auto;
                margin-right: auto;
                text-align: left;
                color: {{ primary_color }};
            }
            .footer {
                position: absolute;
                bottom: -20px;
                right: 20px;
                font-size: 0.8em;
                color: #6c757d;
                text-align: right;
            }
            .qr-code {
                position: absolute;
                bottom: 0px;
                left: 20px;
                width: 80px;
                height: 80px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            {% if logo_base64 %}
            <img src="data:image/png;base64,{{ logo_base64 }}" alt="Logo" class="logo">
            {% endif %}

            <h1>Certificate of Achievement</h1>
            <p>Awarded to <strong>{{ recipient_name }}</strong></p>
            <p>For successfully completing <strong>{{ course_title }}</strong></p>
            <p>Issued on {{ issue_date }}</p>

            {% if signature %}
            <div class="signature-block">
                Signed: {{ signature }}
            </div>
            {% endif %}

            <div class="footer">
                Verification ID: {{ verification_id }}
            </div>
            <img src="data:image/png;base64,{{ qr_base64 }}" alt="QR Code" class="qr-code">
        </div>
    </body>
    </html>
    """
    
    html_content = render_template_string(
        html_template,
        recipient_name=certificate.recipient_name,
        course_title=certificate.course_title,
        issue_date=certificate.issue_date.strftime('%B %d, %Y'),
        signature=certificate.signature,
        verification_id=certificate.verification_id,
        logo_base64=logo_base64,
        background_base64=background_base64,
        primary_color=template.primary_color,
        font_family=template.font_family,
        qr_base64=qr_base64
    )

    pdf_file = HTML(string=html_content).write_pdf()

    return Response(
        pdf_file,
        mimetype="application/pdf",
        headers={"Content-Disposition": f"attachment;filename=certificate_{certificate.verification_id}.pdf"}
    )


@certificate_bp.route('/verify/<string:verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found", "status": "invalid"}), 404

    template = Template.query.get(certificate.template_id)
    user = User.query.get(certificate.user_id)

    cert_data = {
        'id': certificate.id,
        'recipient_name': certificate.recipient_name,
        'course_title': certificate.course_title,
        'issue_date': certificate.issue_date.isoformat(),
        'signature': certificate.signature,
        'status': certificate.status,
        'verification_id': certificate.verification_id,
        'template': {
            'title': template.title,
            'logo_url': template.logo_url,
            'background_url': template.background_url,
            'primary_color': template.primary_color,
            'font_family': template.font_family
        } if template else None,
        'issuer': user.name if user else 'Unknown'
    }
    return jsonify({"msg": "Certificate verified", "status": certificate.status, "certificate": cert_data}), 200