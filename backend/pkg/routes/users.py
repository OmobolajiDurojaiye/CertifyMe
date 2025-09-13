import os
from flask import Blueprint, jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models import User, db

users_bp = Blueprint('users', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "cert_quota": user.cert_quota,
        "signature_image_url": user.signature_image_url # --- SEND SIGNATURE URL ---
    }), 200


# --- NEW ENDPOINT FOR SIGNATURE UPLOAD ---
@users_bp.route('/me/signature', methods=['POST'])
@jwt_required()
def upload_signature():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    if 'signature' not in request.files:
        return jsonify({"msg": "No signature file part"}), 400

    file = request.files['signature']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    if file and allowed_file(file.filename):
        # Create a secure, unique filename
        filename = secure_filename(f"user_{user_id}_signature.png")
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file
        file.save(file_path)
        
        # Update user record in the database
        user.signature_image_url = f"/uploads/{filename}"
        db.session.commit()
        
        return jsonify({
            "msg": "Signature uploaded successfully", 
            "signature_image_url": user.signature_image_url
        }), 200
    else:
        return jsonify({"msg": "File type not allowed. Please use PNG, JPG, or JPEG."}), 400