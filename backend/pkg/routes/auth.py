from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, decode_token
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from bcrypt import hashpw, gensalt, checkpw
from datetime import datetime, timedelta
from ..models import User, Company
from ..extensions import db
from ..utils.email_utils import send_password_reset_email, send_verification_email

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['name', 'email', 'password', 'account_type']
    if not all(key in data for key in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    email = data['email']
    user = User.query.filter_by(email=email).first()

    if user and user.is_verified:
        return jsonify({"msg": "Email already registered"}), 409

    account_type = data.get('account_type', 'individual')
    company_name = data.get('company_name', '').strip()

    if account_type == 'company' and not company_name:
        return jsonify({"msg": "Company name is required for a company account"}), 400

    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt())
    
    if user and not user.is_verified:
        user.name = data['name']
        user.password_hash = hashed_password.decode('utf-8')
        user.set_verification_code()
    else:
        user = User(
            name=data['name'],
            email=email,
            password_hash=hashed_password.decode('utf-8'),
            is_verified=False # Explicitly set to False for new signups
        )
        user.set_verification_code()
        db.session.add(user)

    if account_type == 'company':
        try:
            if not user.id:
                db.session.flush()

            company = Company.query.filter_by(owner_id=user.id).first()
            if not company:
                new_company = Company(name=company_name, owner_id=user.id)
                db.session.add(new_company)
                db.session.flush()
                user.company_id = new_company.id
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error during company registration setup: {e}")
            return jsonify({"msg": "Failed to create company account"}), 500
    
    try:
        send_verification_email(user, user.verification_code)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Failed to send verification email or commit: {e}")
        return jsonify({"msg": "An error occurred during registration."}), 500

    return jsonify({
        "msg": "Registration successful. Please check your email for a verification code."
    }), 201


@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    data = request.get_json()
    if not all(key in data for key in ['email', 'verification_code']):
        return jsonify({"msg": "Missing email or verification code"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({"msg": "User not found or registration incomplete."}), 404

    if user.is_verified:
        return jsonify({"msg": "Email is already verified."}), 400
        
    if user.verification_expiry < datetime.utcnow():
        return jsonify({"msg": "Verification code has expired."}), 401

    if user.verification_code != data['verification_code']:
        return jsonify({"msg": "Invalid verification code."}), 401

    user.is_verified = True
    user.verification_code = None
    user.verification_expiry = None
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "msg": "Email verified successfully. You are now logged in.",
        "access_token": access_token
    }), 200


@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"msg": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "User not found."}), 404
        
    if user.is_verified:
        return jsonify({"msg": "This account is already verified."}), 200

    try:
        user.set_verification_code()
        db.session.commit()
        send_verification_email(user, user.verification_code)
        return jsonify({"msg": "A new verification code has been sent to your email."}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error resending verification email: {e}")
        return jsonify({"msg": "An error occurred while resending the code."}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(key in data for key in ['email', 'password']):
        return jsonify({"msg": "Missing email or password"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if user and checkpw(data['password'].encode('utf-8'), user.password_hash.encode('utf-8')):
        if not user.is_verified:
            # Send a specific error for unverified users
            return jsonify({
                "msg": "Your account is not verified. Please check your email.",
                "unverified": True
            }), 403

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

    if user:
        try:
            reset_token = create_access_token(
                identity=str(user.id), 
                expires_delta=timedelta(minutes=15),
                additional_claims={'purpose': 'password_reset'}
            )
            
            frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
            reset_url = f"{frontend_url}/reset-password/{reset_token}"
            
            send_password_reset_email(user, reset_url)
            current_app.logger.info(f"Password reset email sent for user {user.id}")

        except Exception as e:
            current_app.logger.error(f"Failed to send password reset email: {e}")
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
        decoded_token = decode_token(token)
        
        if decoded_token.get('purpose') != 'password_reset':
            return jsonify({"msg": "Invalid token type"}), 401
        
        user_id = int(decoded_token['sub'])
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"msg": "User not found"}), 404

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