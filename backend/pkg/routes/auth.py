from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, decode_token
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from bcrypt import hashpw, gensalt, checkpw
from datetime import datetime, timedelta
from ..models import User
from ..extensions import db
from ..utils.email_utils import send_password_reset_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not all(key in data for key in ['name', 'email', 'password']):
        return jsonify({"msg": "Missing name, email, or password"}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered"}), 409

    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt())

    new_user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hashed_password.decode('utf-8')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(key in data for key in ['email', 'password']):
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        # Update the last_login timestamp upon successful login
        user.last_login = datetime.utcnow()
        db.session.commit()
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Bad email or password"}), 401

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    # To prevent user enumeration, always return a success-like message.
    # The actual email is only sent if the user exists.
    if user:
        try:
            # Create a short-lived token specifically for password reset
            reset_token = create_access_token(
                identity=str(user.id), 
                expires_delta=timedelta(minutes=15),
                additional_claims={'purpose': 'password_reset'}
            )
            
            # Assuming FRONTEND_URL is configured in your Flask app
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{reset_token}"
            
            send_password_reset_email(user, reset_url)
            current_app.logger.info(f"Password reset email sent for user {user.id}")

        except Exception as e:
            current_app.logger.error(f"Failed to send password reset email: {e}")
            # Still return a generic message to the client for security
            pass

    return jsonify({"msg": "If an account with that email exists, a password reset link has been sent."}), 200


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({"msg": "Token and new password are required"}), 400

    try:
        # Manually decode the token to verify its signature, expiry, and purpose
        decoded_token = decode_token(token)
        
        # Verify this token is specifically for password reset
        if decoded_token.get('purpose') != 'password_reset':
            return jsonify({"msg": "Invalid token type"}), 401
        
        user_id = int(decoded_token['sub'])
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Hash the new password and update the user record
        hashed_password = hashpw(new_password.encode('utf-8'), gensalt())
        user.password_hash = hashed_password.decode('utf-8')
        db.session.commit()

        return jsonify({"msg": "Password has been reset successfully. You can now log in."}), 200

    except ExpiredSignatureError:
        return jsonify({"msg": "Password reset link has expired."}), 401
    except InvalidTokenError:
        return jsonify({"msg": "Invalid or malformed token."}), 401
    except Exception as e:
        current_app.logger.error(f"Error during password reset: {e}")
        return jsonify({"msg": "An unexpected error occurred."}), 500