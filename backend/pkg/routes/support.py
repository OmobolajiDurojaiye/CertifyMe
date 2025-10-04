import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models import db, User, SupportTicket, SupportMessage

support_bp = Blueprint('support', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_support_image(file):
    if file and allowed_file(file.filename):
        filename = secure_filename(f"support_{uuid.uuid4().hex[:12]}.{file.filename.rsplit('.', 1)[1].lower()}")
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        return f"/uploads/{filename}"
    return None

@support_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    user_id = int(get_jwt_identity())
    # Handle multipart/form-data instead of JSON
    subject = request.form.get('subject')
    message = request.form.get('message')
    file = request.files.get('file')

    if not subject or not message:
        return jsonify({"msg": "Subject and message are required"}), 400

    image_url = save_support_image(file)

    new_ticket = SupportTicket(user_id=user_id, subject=subject)
    db.session.add(new_ticket)
    db.session.flush()

    first_message = SupportMessage(
        ticket_id=new_ticket.id,
        user_id=user_id,
        content=message,
        image_url=image_url     
    )
    db.session.add(first_message)
    db.session.commit()

    return jsonify({"msg": "Support ticket created successfully", "ticket_id": new_ticket.id}), 201

@support_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket_details(ticket_id):
    user_id = int(get_jwt_identity())
    ticket = SupportTicket.query.get_or_404(ticket_id)

    if ticket.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403                                                                                                                                                                                                                                                                                                        

    messages = ticket.messages.order_by(SupportMessage.created_at.asc()).all()
    
    return jsonify({
        'id': ticket.id,
        'subject': ticket.subject,
        'status': ticket.status,
        'messages': [{
            'id': m.id,
            'content': m.content,
            # --- THIS IS THE FIX ---
            # Construct the full, absolute URL for the image
            'image_url': f"{request.url_root.rstrip('/')}{m.image_url}" if m.image_url else None,
            # --- END OF FIX ---
            'created_at': m.created_at.isoformat(),
            'sender_type': 'admin' if m.admin_id else 'user',
            'sender_name': m.sender_admin.name if m.admin_id else m.sender_user.name
        } for m in messages]
    }), 200

@support_bp.route('/tickets/<int:ticket_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_ticket(ticket_id):
    user_id = int(get_jwt_identity())
    ticket = SupportTicket.query.get_or_404(ticket_id)

    if ticket.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    content = request.form.get('message')
    file = request.files.get('file')

    if not content:
        return jsonify({"msg": "Message content is required"}), 400

    image_url = save_support_image(file)

    new_message = SupportMessage(
        ticket_id=ticket.id, 
        user_id=user_id, 
        content=content,
        image_url=image_url
    )
    
    if ticket.status == 'closed':
        ticket.status = 'open'
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({"msg": "Reply sent successfully"}), 200

# get_user_tickets route remains unchanged
@support_bp.route('/tickets', methods=['GET'])
@jwt_required()
def get_user_tickets():
    user_id = int(get_jwt_identity())
    tickets = SupportTicket.query.filter_by(user_id=user_id).order_by(SupportTicket.updated_at.desc()).all()
    
    return jsonify([{
        'id': t.id,
        'subject': t.subject,
        'status': t.status,
        'created_at': t.created_at.isoformat(),
        'updated_at': t.updated_at.isoformat()
    } for t in tickets]), 200