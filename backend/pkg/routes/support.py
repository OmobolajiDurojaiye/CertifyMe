from flask import Blueprint, request, jsonify
from ..utils.email_utils import send_support_email
from ..models import SupportWidgetMessage
from ..extensions import db
import os

support_bp = Blueprint('support', __name__)

@support_bp.route('/message', methods=['POST'])
def send_support_message():
    data = request.get_json()
    email = data.get('email')
    message = data.get('message')
    user_id = data.get('user_id') # Optional
    
    if not email or not message:
        return jsonify({"msg": "Email and message are required."}), 400
    
    # 1. Save to Database
    try:
        new_ticket = SupportWidgetMessage(
            email=email,
            message=message,
            user_id=user_id if user_id else None
        )
        db.session.add(new_ticket)
        db.session.commit()
    except Exception as e:
        return jsonify({"msg": f"Failed to save message: {str(e)}"}), 500
    
    # 2. Send Email Notification
    send_support_email(email, message)
    
    return jsonify({"msg": "Message sent successfully!"}), 200