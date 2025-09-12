from .auth import auth_bp
from .templates import template_bp
from .certificates import certificate_bp
from .payments import payments_bp
from .users import users_bp
from .groups import groups_bp

def register_blueprints(app):
    """
    Registers all imported blueprints with the Flask application.
    This function connects all the individual route files to the main app.
    """
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(template_bp, url_prefix='/api/templates')
    app.register_blueprint(certificate_bp, url_prefix='/api/certificates')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(groups_bp, url_prefix='/api/groups') 


    @app.route('/api/health')
    def health_check():
        return {"status": "ok"}