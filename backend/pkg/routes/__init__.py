from .auth import auth_bp
from .templates import template_bp
from .certificates import certificate_bp
from .payments import payments_bp
from .users import users_bp
from .groups import groups_bp
from .support import support_bp 

# Admin blueprints
from .admin_auth import admin_auth_bp
from .admin_users import admin_users_bp
from .admin_payments import admin_payments_bp
from .admin_certificates import admin_certificates_bp
from .admin_analytics import admin_analytics_bp
from .admin_support import admin_support_bp

def register_blueprints(app):
    """
    Registers all imported blueprints with the Flask application.
    """
    # Public/User-facing blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(template_bp, url_prefix='/api/templates')
    app.register_blueprint(certificate_bp, url_prefix='/api/certificates')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(groups_bp, url_prefix='/api/groups')
    app.register_blueprint(support_bp, url_prefix='/api/support')
    
    # All admin blueprints are grouped under a single, consistent prefix.
    app.register_blueprint(admin_auth_bp, url_prefix='/api/admin/auth')
    app.register_blueprint(admin_users_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_payments_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_certificates_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_analytics_bp, url_prefix='/api/admin')
    app.register_blueprint(admin_support_bp, url_prefix='/api/admin')

    @app.route('/api/health')
    def health_check():
        return {"status": "ok"}