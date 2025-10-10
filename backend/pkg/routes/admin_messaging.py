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
    header_image_url = data.get('header_image_url')

    if not all([subject, html_body, recipient_ids]):
        return jsonify({"msg": "Subject, body, and recipients are required"}), 400

    # --- THIS IS THE FIX ---
    # Sanitize the HTML to prevent XSS but allow a wide range of formatting tags and styles
    # from the rich text editor.
    
    # Convert the default frozenset of tags to a list so we can add to it.
    allowed_tags = list(bleach.sanitizer.ALLOWED_TAGS) + [
        'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'b', 'i', 'u', 'a', 'img', 
        'div', 'span', 'strong', 'em', 'ol', 'ul', 'li', 'blockquote', 'pre',
        'sub', 'sup', 'hr'
    ]
    
    # Allow attributes needed for links, images, and crucially, inline styles.
    allowed_attrs = {
        **bleach.sanitizer.ALLOWED_ATTRIBUTES,
        'a': ['href', 'title', 'target'],
        'img': ['src', 'alt', 'style', 'width', 'height'],
        '*': ['style'] # Allow style attribute on any tag for formatting like text-align.
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

    try:
        send_bulk_email(users, subject, clean_html, header_image_url=header_image_url)
        return jsonify({"msg": f"Email successfully sent to {len(users)} users."}), 200
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