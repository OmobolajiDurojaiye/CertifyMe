from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from bcrypt import hashpw, gensalt, checkpw
from datetime import datetime
from ..models import User
from ..extensions import db

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
        # --- THIS IS THE UPDATE ---
        # Update the last_login timestamp upon successful login
        user.last_login = datetime.utcnow()
        db.session.commit()
        # --- END OF UPDATE ---
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200

    return jsonify({"msg": "Bad email or password"}), 401