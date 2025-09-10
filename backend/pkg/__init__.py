import os
from flask import Flask, send_from_directory
from flask_cors import CORS

from .extensions import db, migrate, mail, jwt
from .routes import register_blueprints
from .models import Template

def create_app():
    app = Flask(__name__)

    # --- Config Section ---
    # This pattern reads from .env in production, but uses defaults for local dev
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_default_secret_key_for_development')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'a_default_jwt_key_for_development')
    
    # This is the key line. It will use your PythonAnywhere DB in production.
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql+mysqlconnector://root@127.0.0.1/certifyme_db')
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

    # Paystack Configuration - Reads from .env
    app.config['PAYSTACK_SECRET_KEY'] = os.environ.get('PAYSTACK_SECRET_KEY')
    app.config['PAYSTACK_PUBLIC_KEY'] = os.environ.get('PAYSTACK_PUBLIC_KEY')
    
    # Mail Configuration - Reads from .env
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = ('CertifyMe', os.environ.get('MAIL_USERNAME'))


    # Correctly locate the 'uploads' folder one level above the 'pkg' directory
    upload_path = os.path.abspath(os.path.join(app.root_path, '..', '..', 'uploads'))
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
        # Add error handling in case the database isn't ready yet on first deploy
        try:
            # Check if the 'templates' table exists before querying
            if db.engine.dialect.has_table(db.engine.connect(), "templates"):
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
            else:
                print("Skipping seeder: 'templates' table not found. Run 'flask db upgrade' first.")

        except Exception as e:
            print(f"Database connection error during seeding: {e}")


    return app