import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from .extensions import db, migrate, mail, jwt
from .routes import register_blueprints

def create_app():
    app = Flask(__name__)

    # --- Config Section ---
    app.config['SECRET_KEY'] = 'fgci865847398fgvsbcw93764fubauc346dck'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@127.0.0.1/certifyme_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'cvcdb746273988cyuvgc7324652dguh746729c'
    
    app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME', 'durojaiyeomobolaji93@gmail.com')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'vvvf vxle exkv wqbn')
    app.config['MAIL_DEFAULT_SENDER'] = ('CertifyMe', os.environ.get('MAIL_DEFAULT_SENDER', app.config['MAIL_USERNAME']))

    upload_path = os.path.join(app.root_path, '..', 'uploads')
    os.makedirs(upload_path, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_path

    # --- Initialization Section ---
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
        from .models import Template
        if Template.query.filter_by(is_public=True).first():
            print("Default templates already exist.")
            return
        
        print("Seeding default templates...")
        default_templates = [
            Template(title='Modern Elegance', primary_color='#0284C7', secondary_color='#E2E8F0', body_font_color='#1E293B', font_family='Lato', layout_style='modern', is_public=True),
            Template(title='Classic Professional', primary_color='#BE185D', secondary_color='#FBCFE8', body_font_color='#333333', font_family='Georgia', layout_style='classic', is_public=True),
            Template(title='Corporate Clean', primary_color='#166534', secondary_color='#D1D5DB', body_font_color='#111827', font_family='Roboto', layout_style='corporate', is_public=True),
            Template(title='Creative Dark', primary_color='#F59E0B', secondary_color='#4B5563', body_font_color='#F9FAFB', font_family='Lato', layout_style='creative', is_public=True),
        ]
        db.session.add_all(default_templates)
        db.session.commit()
        print(f"Seeded {len(default_templates)} public templates.")

    return app