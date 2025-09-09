# --- START OF FILE backend/pkg/__init__.py ---
import os
from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_mail import Mail
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from .models import db
from .routes import register_blueprints

migrate = Migrate()
mail = Mail()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)

    # --- THIS IS THE FINAL, GUARANTEED FIX ---
    # We are HARDCODING the keys directly into the application.
    # This completely bypasses all file loading and environment variable issues
    # caused by the Flask reloader. This ensures the key is ALWAYS the same.
    app.config['SECRET_KEY'] = 'you-will-never-guess-this-secret-key'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@127.0.0.1/certifyme_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'this-is-a-different-key-specifically-for-jwt-tokens'
    # --- END OF THE FIX ---

    upload_path = os.path.join(app.root_path, '..', 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_path

    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)
    
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        allow_headers=["Authorization", "Content-Type"],
        supports_credentials=True
    )

    register_blueprints(app)

    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    @app.cli.command("seed")
    def seed_data():
        print("Database seeding command called.")

    return app
# --- END OF FILE backend/pkg/__init__.py ---