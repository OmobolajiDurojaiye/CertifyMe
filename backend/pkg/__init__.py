import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from .extensions import db, migrate, mail, jwt
from .routes import register_blueprints
from .models import Template

def create_app():
    app = Flask(__name__)

    # --- Config Section ---
    app.config['SECRET_KEY'] = 'fgci865847398fgvsbcw93764fubauc346dck'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root@127.0.0.1/certifyme_db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = 'cvcdb746273988cyuvgc7324652dguh746729c'
    
    app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

    # Paystack Configuration (Using Test Keys)
    app.config['PAYSTACK_SECRET_KEY'] = os.environ.get('PAYSTACK_SECRET_KEY', 'sk_test_bc2b10958c6b2ece0cab41fe4a9ebb56fff3d84f')
    app.config['PAYSTACK_PUBLIC_KEY'] = os.environ.get('PAYSTACK_PUBLIC_KEY', 'pk_test_e0d4baa25d66a069e4a300836f2f8fd04691b400')
    
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

    # Seed the database on app startup if the default template doesn't exist
    with app.app_context():
        if not Template.query.filter_by(is_public=True, title='Default Classic').first():
            print("Seeding default template...")
            default_template = Template(
                title='Default Classic',
                primary_color='#1E3A8A',  # Deep Blue
                secondary_color='#D1D5DB',  # Light Gray
                body_font_color='#111827',  # Dark Gray
                font_family='Georgia',
                layout_style='classic',
                is_public=True
            )
            db.session.add(default_template)
            db.session.commit()
            print("Seeded default public template: Default Classic")

    return app