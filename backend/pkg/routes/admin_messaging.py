from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, current_user
from ..models import db, Admin, User
from ..utils.email_utils import send_bulk_email
import bleach

admin_messaging_bp = Blueprint('admin_messaging', __name__)

@admin_messaging_bp.route('/messaging/send-email', methods=['POST'])
@jwt_required()
def handle_send_email():
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    data = request.get_json()
    subject = data.get('subject')
    html_body = data.get('body')
    recipient_ids = data.get('recipients') 

    if not all([subject, html_body, recipient_ids]):
        return jsonify({"msg": "Subject, body, and recipients are required"}), 400

    # --- THIS IS THE FIX ---
    # Convert the frozenset to a list before concatenating
    allowed_tags = list(bleach.sanitizer.ALLOWED_TAGS) + [
        'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'a', 'img', 
        'div', 'span', 'strong', 'em', 'ol', 'ul', 'li', 'blockquote', 'pre'
    ]
    
    # Allow style attributes for basic formatting
    allowed_attrs = {
        **bleach.sanitizer.ALLOWED_ATTRIBUTES,
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'style', 'width', 'height'],
        '*': ['style'] # Allow style attribute on any tag
    }
    
    clean_html = bleach.clean(html_body, tags=allowed_tags, attributes=allowed_attrs)
    # --- END OF FIX ---

    if recipient_ids == 'all':
        users = User.query.filter(User.role != 'suspended').all()
    else:
        if not isinstance(recipient_ids, list):
            return jsonify({"msg": "Recipients must be a list of IDs or 'all'"}), 400
        users = User.query.filter(User.id.in_(recipient_ids), User.role != 'suspended').all()

    if not users:
        return jsonify({"msg": "No valid (non-suspended) recipients found"}), 400

    recipient_emails = [user.email for user in users]

    try:
        send_bulk_email(recipient_emails, subject, clean_html)
        return jsonify({"msg": f"Email successfully sent to {len(recipient_emails)} users."}), 200
    except Exception as e:
        return jsonify({"msg": f"An error occurred while sending emails: {str(e)}"}), 500

@admin_messaging_bp.route('/messaging/recipients', methods=['GET'])
@jwt_required()
def get_recipient_list():
    """Provides a list of all non-suspended users for the email selection dropdown."""
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403
    
    users = User.query.with_entities(User.id, User.name, User.email).filter(User.role != 'suspended').order_by(User.name).all()
    user_list = [{'id': u.id, 'name': u.name, 'email': u.email} for u in users]
    
    return jsonify(user_list), 200