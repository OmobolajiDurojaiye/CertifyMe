# certificates.py
from flask import Blueprint, request, jsonify, render_template_string, Response, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from ..models import db, Certificate, Template, User, Company
from sqlalchemy import func, case
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
import re
import pandas as pd

certificate_bp = Blueprint('certificates', __name__)


# -------------------------
# Helper utilities
# -------------------------
def parse_flexible_date(date_string):
    """
    Robust date parser that tries many common formats and a few heuristics.
    Returns a date object or raises ValueError.
    """
    if not date_string or not str(date_string).strip():
        raise ValueError("Empty date string")

    s = str(date_string).strip()

    # Natural language helpers
    low = s.lower()
    if low in ("today", "now"):
        return datetime.utcnow().date()
    if low == "yesterday":
        return (datetime.utcnow() - timedelta(days=1)).date()
    if low == "tomorrow":
        return (datetime.utcnow() + timedelta(days=1)).date()

    # Try a list of common formats (both month-first and day-first)
    formats_to_try = [
        "%Y-%m-%d",     # 2025-10-09
        "%d-%m-%Y",     # 09-10-2025
        "%m-%d-%Y",     # 10-09-2025
        "%d/%m/%Y",     # 09/10/2025
        "%m/%d/%Y",     # 10/09/2025
        "%d-%b-%Y",     # 09-Oct-2025
        "%d %b %Y",     # 09 Oct 2025
        "%d %B %Y",     # 09 October 2025
        "%b %d %Y",     # Oct 09 2025
        "%B %d %Y",     # October 09 2025
        "%m/%d/%y",     # 9/11/25
        "%d/%m/%y",     # 11/9/25
        "%d.%m.%Y",     # 09.10.2025
        "%m.%d.%Y",     # 10.09.2025
    ]

    # Clean common separators to single spaces (helps "11 Sept, 2025" etc.)
    s_clean = re.sub(r'[,\s]+', ' ', s).strip()

    # Try direct formats on original and cleaned forms
    for fmt in formats_to_try:
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            pass
        try:
            return datetime.strptime(s_clean, fmt).date()
        except ValueError:
            pass

    # As a last resort: attempt to parse things like '11/9' by assuming current year
    m = re.match(r'^\s*(\d{1,2})[\/\-\.\s](\d{1,2})\s*$', s)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        year = datetime.utcnow().year
        # Heuristic: if first > 12, treat as day-first; otherwise prefer day-first for Nigeria (DD/MM)
        dayfirst = current_app.config.get('DATE_DAYFIRST', True)
        if dayfirst:
            try:
                return datetime(year=year, month=b, day=a).date()
            except ValueError:
                try:
                    return datetime(year=year, month=a, day=b).date()
                except ValueError:
                    pass
        else:
            try:
                return datetime(year=year, month=a, day=b).date()
            except ValueError:
                try:
                    return datetime(year=year, month=b, day=a).date()
                except ValueError:
                    pass

    raise ValueError(f"Invalid or unrecognized date format: '{date_string}'")


def get_image_as_base64(image_path):
    if not image_path:
        return None
    try:
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


def _generate_visual_certificate_pdf_in_memory(certificate, template, issuer):
    layout_data = template.layout_data or {}
    elements = layout_data.get('elements', [])
    background = layout_data.get('background', {})
    canvas_config = layout_data.get('canvas', {'width': 842, 'height': 595})
    page_width = canvas_config.get('width', 842)
    page_height = canvas_config.get('height', 595)

    dynamic_data = {
        "{{recipient_name}}": certificate.recipient_name,
        "{{course_title}}": certificate.course_title,
        "{{issue_date}}": certificate.issue_date.strftime('%B %d, %Y'),
        "{{issuer_name}}": certificate.issuer_name,
        "{{verification_id}}": certificate.verification_id,
        "{{signature}}": certificate.signature or certificate.issuer_name
    }

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
                'word-wrap: break-word; '
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


def _generate_certificate_pdf_in_memory(certificate):
    template = Template.query.get_or_404(certificate.template_id)
    issuer = User.query.get_or_404(certificate.user_id)

    if template.layout_style == 'visual':
        return _generate_visual_certificate_pdf_in_memory(certificate, template, issuer)

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


def allowed_file(filename):
    """Checks if the uploaded file is of an allowed spreadsheet type."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'csv', 'xlsx', 'xls', 'ods'}


def _normalize_email(email):
    """
    Basic email normalization and light auto-fixes.
    - lowercases
    - trims spaces
    - if email looks like 'user@gmail' -> 'user@gmail.com'
    - does not try heavy guessing (keep it safe)
    """
    if not email:
        return ""
    e = email.strip().lower()
    # common providers that might be missing .com/.ng
    providers = ["gmail", "yahoo", "outlook", "hotmail", "icloud"]
    if '@' in e:
        user_part, domain = e.split('@', 1)
        if '.' not in domain:
            for p in providers:
                if domain.startswith(p):
                    domain = domain + ".com"
                    e = f"{user_part}@{domain}"
                    break
    else:
        # if there's no @ but looks like 'user.gmail.com' or 'user@gmail'
        if '.' in e and any(p in e for p in providers):
            # attempt to insert @ before provider
            for p in providers:
                if f".{p}" in e:
                    parts = e.split(f".{p}", 1)
                    e = f"{parts[0]}@{p}{('.' + parts[1]) if parts[1] else '.com'}"
                    break
    return e


def _detect_csv_dialect(sample_text):
    """
    Use csv.Sniffer to detect delimiter. Fallback to comma.
    """
    try:
        sniffer = csv.Sniffer()
        dialect = sniffer.sniff(sample_text, delimiters=[',', ';', '\t', '|'])
        return dialect
    except Exception:
        return csv.get_dialect('excel')  # default comma dialect


# Smart header mapping: common synonyms mapped to standard field names
_HEADER_SYNONYMS = {
    "student_name": "recipient_name",
    "name": "recipient_name",
    "full_name": "recipient_name",
    "recipient": "recipient_name",
    "email": "recipient_email",
    "mail": "recipient_email",
    "e-mail": "recipient_email",
    "course": "course_title",
    "program": "course_title",
    "class": "course_title",
    "issued_by": "issuer_name",
    "issuer": "issuer_name",
    "date": "issue_date",
    "issued_on": "issue_date",
    "sign": "signature",
    "sig": "signature",
    "signature_text": "signature",
}

def _send_issuer_notification_email(issuer, subject, summary_html):
    """
    Sends an email to the issuer (the account owner / company account) for summary notifications.
    """
    try:
        msg = Message(
            subject=subject,
            sender=('CertifyMe', current_app.config.get('MAIL_USERNAME')),
            recipients=[issuer.email],
            html=summary_html
        )
        mail.send(msg)
        current_app.logger.info(f"Issuer notification sent to {issuer.email}")
    except Exception as e:
        current_app.logger.error(f"Failed to send issuer notification to {issuer.email}: {e}")


def _create_issuer_summary_email(issuer_name, count, cert_list, action_type="created"):
    """
    Builds the HTML summary content for issuer notification emails.
    """
    rows_html = "".join([
        f"<tr><td>{i+1}</td><td>{c['recipient_name']}</td><td>{c['course_title']}</td><td>{c['verification_id']}</td></tr>"
        for i, c in enumerate(cert_list)
    ])

    dashboard_url = f"{current_app.config['FRONTEND_URL']}/dashboard"

    html = f"""
    <html>
    <body style="font-family:Arial, sans-serif; background:#f8f9fa; padding:20px;">
        <div style="max-width:600px;margin:auto;background:white;padding:30px;border-radius:8px;">
            <h2 style="color:#2563EB;">CertifyMe — Certificates {action_type.title()}</h2>
            <p>Dear <b>{issuer_name}</b>,</p>
            <p>This is to confirm that <b>{count}</b> certificate{'s' if count > 1 else ''} have been successfully {action_type}.</p>

            <table width="100%" border="1" cellspacing="0" cellpadding="6" style="border-collapse:collapse; margin-top:20px;">
                <thead style="background:#2563EB;color:white;">
                    <tr>
                        <th>#</th><th>Recipient</th><th>Course Title</th><th>Verification ID</th>
                    </tr>
                </thead>
                <tbody>{rows_html}</tbody>
            </table>

            <p style="margin-top:20px;">You can view all your certificates anytime on your dashboard.</p>
            <a href="{dashboard_url}" style="display:inline-block;background:#2563EB;color:white;padding:12px 20px;border-radius:5px;text-decoration:none;margin-top:10px;">Go to Dashboard</a>
            <p style="margin-top:30px;font-size:13px;color:#888;">This message was automatically generated by CertifyMe to confirm your action.</p>
        </div>
    </body>
    </html>
    """
    return html



# -------------------------
# API routes
# -------------------------
@certificate_bp.route('/<int:cert_id>/pdf', methods=['GET'])
@jwt_required()
def get_certificate_pdf(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

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

    # recipient_email is now optional
    required_fields = ['template_id', 'recipient_name', 'course_title', 'issuer_name', 'issue_date']
    if not all(field in data and data[field] for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    template = Template.query.get(data['template_id'])
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found or permission denied"}), 404

    if user.cert_quota <= 0:
        return jsonify({"msg": "Insufficient certificate quota remaining"}), 403

    try:
        issue_date = parse_flexible_date(data['issue_date'])
        extra_fields = data.get('extra_fields', {})
        
        recipient_email = data.get('recipient_email')
        if recipient_email:
            recipient_email = _normalize_email(recipient_email)

        certificate = Certificate(
            user_id=user_id,
            company_id=user.company_id,
            template_id=template.id,
            group_id=data.get('group_id'),
            recipient_name=data['recipient_name'],
            recipient_email=recipient_email, # Can be None
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

        email_sent = False
        email_error = None

        if certificate.recipient_email:
            try:
                pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
                msg = _create_email_message(certificate, pdf_buffer)
                mail.send(msg)
                certificate.sent_at = datetime.utcnow()
                db.session.commit()
                email_sent = True
                
                issuer_summary = [{"recipient_name": certificate.recipient_name, "course_title": certificate.course_title, "verification_id": certificate.verification_id}]
                summary_html = _create_issuer_summary_email(user.name, 1, issuer_summary, action_type="created and sent")
                _send_issuer_notification_email(user, "Certificate Created & Sent — CertifyMe", summary_html)
                current_app.logger.info(f"Certificate {certificate.id} created, emailed to {certificate.recipient_email}, issuer notified.")
            except Exception as e:
                email_error = str(e)
                current_app.logger.error(f"Email sending error for cert {certificate.id}: {e}")
        
        if email_error:
            return jsonify({"msg": "Certificate created, but failed to send email.", "error": email_error, "certificate_id": certificate.id, "verification_id": certificate.verification_id}), 201

        response_msg = "Certificate created" + (" and emailed successfully" if email_sent else " successfully (no recipient email provided)")
        return jsonify({"msg": response_msg, "certificate_id": certificate.id, "verification_id": certificate.verification_id}), 201

    except ValueError as e:
        return jsonify({"msg": f"Invalid date format: {str(e)}"}), 400
    except Exception as e:
        current_app.logger.error(f"Error creating certificate: {e}")
        db.session.rollback()
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
    """
    Smart Bulk Create: Supports CSV, XLSX, XLS. Optional email/signature.
    """
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if 'file' not in request.files: return jsonify({"msg": "No file part"}), 400

    file = request.files['file']
    if not file or not allowed_file(file.filename):
        return jsonify({"msg": "Invalid file type. Please use CSV, XLSX, or XLS."}), 400

    template_id = request.form.get('template_id')
    group_id = request.form.get('group_id')
    if not template_id or not group_id:
        return jsonify({"msg": "Template ID and Group ID are required"}), 400

    template = Template.query.get(template_id)
    if not template or (not template.is_public and template.user_id != user_id):
        return jsonify({"msg": "Template not found or permission denied"}), 404

    try:
        try:
            df = pd.read_excel(file) if file.filename.lower().endswith(('.xlsx', '.xls', '.ods')) else pd.read_csv(file)
        except Exception as e:
            current_app.logger.error(f"Pandas parsing error: {e}")
            return jsonify({"msg": f"Error reading file. Please ensure it is a valid CSV or Excel file."}), 400

        if df.empty: return jsonify({"msg": "The uploaded file is empty or unreadable."}), 400

        df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
        df = df.rename(columns=_HEADER_SYNONYMS)

        required_headers = {'recipient_name', 'course_title', 'issue_date'}
        missing = required_headers - set(df.columns)
        if missing:
            return jsonify({"msg": f"File missing required columns: {', '.join(missing)}"}), 400

        certs_to_add, errors, quota_left = [], [], user.cert_quota
        df = df.where(pd.notnull(df), None)

        for idx, row in df.iterrows():
            row_num = idx + 2 
            if row.isnull().all(): continue
            if quota_left <= 0:
                errors.append({"row": row_num, "msg": "Skipped — quota exhausted"})
                continue
            try:
                recipient_name, course_title, issue_date_raw = row.get('recipient_name'), row.get('course_title'), row.get('issue_date')
                if not all([recipient_name, course_title, issue_date_raw]):
                    errors.append({"row": row_num, "msg": "Missing required data (recipient_name, course_title, or issue_date)."})
                    continue

                recipient_email = _normalize_email(row.get('recipient_email')) if row.get('recipient_email') else None
                cert = Certificate(
                    user_id=user_id, company_id=user.company_id, template_id=template.id, group_id=group_id,
                    recipient_name=str(recipient_name), recipient_email=recipient_email,
                    course_title=str(course_title), issuer_name=str(row.get('issuer_name') or user.name),
                    issue_date=parse_flexible_date(issue_date_raw), signature=str(row.get('signature')) if row.get('signature') else None,
                    verification_id=str(uuid.uuid4())
                )
                certs_to_add.append(cert)
                quota_left -= 1
            except ValueError as e: errors.append({"row": row_num, "msg": f"Date error: {e}"})
            except Exception as e: errors.append({"row": row_num, "msg": str(e)})

        if certs_to_add:
            db.session.bulk_save_objects(certs_to_add)
            user.cert_quota = quota_left
            db.session.commit()
            created_list = [{"recipient_name": c.recipient_name, "course_title": c.course_title, "verification_id": c.verification_id} for c in certs_to_add]
            summary_html = _create_issuer_summary_email(user.name, len(created_list), created_list, action_type="created")
            _send_issuer_notification_email(user, "Certificates Created — CertifyMe", summary_html)

        summary = {"msg": "Bulk processing completed", "created": len(certs_to_add), "errors_count": len(errors), "errors": errors}
        status_code = 201 if certs_to_add and not errors else 207 if errors else 200
        return jsonify(summary), status_code

    except Exception as e:
        current_app.logger.error(f"Bulk create error: {e}")
        db.session.rollback()
        return jsonify({"msg": f"An unexpected error occurred during bulk creation."}), 500


@certificate_bp.route('/bulk-template', methods=['GET'])
@jwt_required()
def download_bulk_template():
    output = StringIO()
    writer = csv.writer(output)
    headers = ['recipient_name', 'recipient_email', 'course_title', 'issuer_name', 'issue_date', 'signature']
    writer.writerow(headers)
    writer.writerow(['Jane Doe', 'jane.doe@example.com', 'Introduction to Python', 'CertifyMe University', '2024-10-22', 'Dr. Smith'])
    writer.writerow(['John Smith', '', 'Advanced Web Development', 'CertifyMe University', '2024-11-15', ''])
    output.seek(0)
    return Response(output, mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=certifyme_bulk_template.csv"})


@certificate_bp.route('/<int:cert_id>/send', methods=['POST'])
@jwt_required()
def send_certificate_email(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id: return jsonify({"msg": "Permission denied"}), 403
    if not certificate.recipient_email: return jsonify({"msg": "No recipient email address on file for this certificate."}), 400
    try:
        pdf_buffer = _generate_certificate_pdf_in_memory(certificate)
        msg = _create_email_message(certificate, pdf_buffer)
        mail.send(msg)
        certificate.sent_at = datetime.utcnow()
        db.session.commit()
        return jsonify({"msg": "Certificate emailed successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Email sending error for cert {cert_id}: {e}")
        return jsonify({"msg": "Failed to send email"}), 500


@certificate_bp.route('/bulk-send', methods=['POST'])
@jwt_required()
def send_bulk_emails():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    certificate_ids = data.get('certificate_ids', [])
    if not certificate_ids: return jsonify({"msg": "No certificate IDs provided"}), 400
    sent, errors = 0, []
    certs_to_send = Certificate.query.filter(Certificate.id.in_(certificate_ids), Certificate.user_id == user_id).all()
    for cert in certs_to_send:
        if not cert.recipient_email:
            errors.append({"certificate_id": cert.id, "msg": "No email address"})
            continue
        try:
            pdf_buffer = _generate_certificate_pdf_in_memory(cert)
            msg = _create_email_message(cert, pdf_buffer)
            mail.send(msg)
            cert.sent_at = datetime.utcnow()
            sent += 1
        except Exception as e: errors.append({"certificate_id": cert.id, "msg": str(e)})
    db.session.commit()
    if sent > 0:
        cert_list = [{"recipient_name": c.recipient_name, "course_title": c.course_title, "verification_id": c.verification_id} for c in certs_to_send if c.sent_at]
        summary_html = _create_issuer_summary_email(user.name, sent, cert_list, action_type="sent")
        _send_issuer_notification_email(user, "Certificates Sent — CertifyMe", summary_html)
    if errors: return jsonify({"msg": f"Sent {sent} emails with {len(errors)} errors", "sent": sent, "errors": errors}), 207
    return jsonify({"msg": f"Successfully sent {sent} emails"}), 200



@certificate_bp.route('/<int:cert_id>', methods=['DELETE'])
@jwt_required()
def delete_certificate(cert_id):
    user_id = int(get_jwt_identity())
    certificate = Certificate.query.get_or_404(cert_id)
    if certificate.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

    try:
        db.session.delete(certificate)
        db.session.commit()
        current_app.logger.info(f"Certificate {cert_id} deleted by user {user_id}")
        return jsonify({"msg": "Certificate deleted successfully"}), 200
    except Exception as e:
        current_app.logger.error(f"Error deleting certificate {cert_id}: {e}")
        db.session.rollback()
        return jsonify({"msg": "Failed to delete certificate"}), 500


@certificate_bp.route('/verify/<string:verification_id>', methods=['GET'])
def verify_certificate(verification_id):
    certificate = Certificate.query.filter_by(verification_id=verification_id).first()
    if not certificate:
        return jsonify({"msg": "Certificate not found"}), 404

    template = Template.query.get_or_404(certificate.template_id)

    company_data = None
    if certificate.company_id:
        company = Company.query.get(certificate.company_id)
        if company:
            company_data = { "id": company.id, "name": company.name }

    certificate_data = {
        "id": certificate.id,
        "recipient_name": certificate.recipient_name,
        "recipient_email": certificate.recipient_email,
        "course_title": certificate.course_title,
        "issue_date": certificate.issue_date.isoformat(),
        "issuer_name": certificate.issuer_name,
        "status": certificate.status,
        "verification_id": certificate.verification_id,
        "signature": certificate.signature,
        "extra_fields": certificate.extra_fields
    }

    template_data = {
        "id": template.id,
        "title": template.title,
        "layout_style": template.layout_style,
        "layout_data": template.layout_data,
        "logo_url": template.logo_url,
        "background_url": template.background_url,
        "primary_color": template.primary_color,
        "secondary_color": template.secondary_color,
        "body_font_color": template.body_font_color,
        "font_family": template.font_family,
        "custom_text": template.custom_text
    }

    return jsonify({
        "certificate": certificate_data,
        "template": template_data,
        "company": company_data
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

@certificate_bp.route('/advanced-search', methods=['GET'])
def advanced_search_certificates():

    try:
        # --- Get parameters ---
        page = request.args.get('page', 1, type=int)
        per_page = 9

        # Filter parameters
        recipient_name = request.args.get('recipient', '').strip()
        # Changed from 'company' to 'issuer' to be more generic
        issuer_name_filter = request.args.get('issuer', '').strip()
        course_title = request.args.get('course', '').strip()
        start_date_str = request.args.get('start_date', '').strip()
        end_date_str = request.args.get('end_date', '').strip()

        # Sorting parameters
        sort_by = request.args.get('sort_by', 'issue_date')
        sort_order = request.args.get('sort_order', 'desc')

        # --- Build Query ---
        # The COALESCE function is key here. It returns the first non-null value.
        # So, it will be Company.name if it exists, otherwise it will be User.name.
        issuer_name_column = func.coalesce(Company.name, User.name).label('issuer_name')

        # The CASE statement determines the issuer type for the frontend.
        issuer_type_column = case(
            (Company.id != None, 'company'),
            else_='individual'
        ).label('issuer_type')

        base_query = db.session.query(
            Certificate.recipient_name,
            Certificate.course_title,
            Certificate.issue_date,
            Certificate.verification_id,
            issuer_name_column,
            issuer_type_column
        ).join(User, Certificate.user_id == User.id) \
         .join(Company, Certificate.company_id == Company.id, isouter=True) # <-- LEFT JOIN HERE

        # Apply filters dynamically
        if len(recipient_name) >= 3:
            base_query = base_query.filter(func.lower(Certificate.recipient_name).like(f"%{recipient_name.lower()}%"))
        if len(issuer_name_filter) >= 2:
            # Filter on the coalesced issuer name column
            base_query = base_query.filter(func.lower(issuer_name_column).like(f"%{issuer_name_filter.lower()}%"))
        if len(course_title) >= 3:
            base_query = base_query.filter(func.lower(Certificate.course_title).like(f"%{course_title.lower()}%"))

        if start_date_str and end_date_str:
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                base_query = base_query.filter(Certificate.issue_date.between(start_date, end_date))
            except ValueError:
                return jsonify({"msg": "Invalid date format. Please use YYYY-MM-DD."}), 400

        # Apply sorting
        sort_column = Certificate.issue_date
        if sort_by == 'recipient_name':
            sort_column = func.lower(Certificate.recipient_name)
        
        if sort_order == 'asc':
            base_query = base_query.order_by(sort_column.asc())
        else:
            base_query = base_query.order_by(sort_column.desc())

        paginated_results = base_query.paginate(page=page, per_page=per_page, error_out=False)

        results = [{
            "recipient_name": cert.recipient_name,
            "course_title": cert.course_title,
            "issue_date": cert.issue_date.isoformat(),
            "verification_id": cert.verification_id,
            "issuer_name": cert.issuer_name,
            "issuer_type": cert.issuer_type # Send type to frontend
        } for cert in paginated_results.items]

        pagination_data = {
            "total": paginated_results.total,
            "pages": paginated_results.pages,
            "page": paginated_results.page,
            "has_next": paginated_results.has_next,
            "has_prev": paginated_results.has_prev,
            "per_page": per_page
        }

        return jsonify({
            "results": results,
            "pagination": pagination_data
        }), 200

    except Exception as e:
        current_app.logger.error(f"Advanced certificate search error: {e}")
        return jsonify({"msg": "An error occurred during the search."}), 500