import os
from flask import Flask, send_from_directory, jsonify, request
from flask_cors import CORS
from .extensions import db, migrate, mail, jwt
from .routes import register_blueprints
from .models import Template, Admin, User


def create_app():
    app = Flask(__name__)

    # Core Config
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'a_default_secret_key_for_development')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'a_default_jwt_key_for_development')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400

    # Database
    db_url = os.environ.get('DATABASE_URL', 'mysql+mysqlconnector://root@127.0.0.1/certifyme_db')
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {"pool_recycle": 280}
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Frontend and External Services
    app.config['FRONTEND_URL'] = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    app.config['PAYSTACK_SECRET_KEY'] = os.environ.get('PAYSTACK_SECRET_KEY')
    app.config['PAYSTACK_PUBLIC_KEY'] = os.environ.get('PAYSTACK_PUBLIC_KEY')

    # Mail Configuration
    app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER')
    app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
    app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_USERNAME')
    app.config['ADMIN_EMAIL'] = os.environ.get('ADMIN_EMAIL')

    # Upload Folder
    upload_path = os.path.abspath(os.path.join(app.root_path, '..', '..', 'Uploads'))
    os.makedirs(upload_path, exist_ok=True)
    app.config['UPLOAD_FOLDER'] = upload_path

    # Initialize Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)
    jwt.init_app(app)

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {"origins": "*"},
        r"/uploads/*": {"origins": "*"}
    })

    # Handle preflight OPTIONS requests
    @app.before_request
    def handle_preflight():
        if request.method.upper() == 'OPTIONS':
            response = app.make_response(('', 204))
            return response

    # JWT user loader
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        if jwt_data.get("is_admin"):
            return Admin.query.get(int(identity))
        else:
            return User.query.get(int(identity))

    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Register all blueprints
    register_blueprints(app)

    # Error handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"msg": "Resources Not Found"}), 404

    # Seed default classic template
    with app.app_context():
        try:
            with db.engine.connect() as connection:
                if db.engine.dialect.has_table(connection, "templates"):
                    if not Template.query.filter_by(is_public=True, title='Default Classic').first():
                        default_template = Template(
                            title='Default Classic',
                            primary_color='#1E3A8A',
                            secondary_color='#D1D5DB',
                            body_font_color='#111827',
                            font_family='Georgia',
                            layout_style='classic',
                            is_public=True,
                            custom_text={
                                "title": "Certificate of Completion",
                                "body": "has successfully completed the course"
                            }
                        )
                        db.session.add(default_template)
                        db.session.commit()
                else:
                    print("Skipping seeder: 'templates' table not found. Run 'flask db upgrade' first.")
        except Exception as e:
            print(f"Database connection error during seeding: {e}")

    return app
