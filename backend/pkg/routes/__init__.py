# --- START OF FILE backend/pkg/routes/__init__.py ---
# Import ALL of your blueprints here
from .auth import auth_bp
from .templates import template_bp
from .certificates import certificate_bp

def register_blueprints(app):
    """
    Registers all imported blueprints with the Flask application.
    This function connects all the individual route files to the main app.
    """
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(template_bp, url_prefix='/api/templates')
    app.register_blueprint(certificate_bp, url_prefix='/api/certificates')

    @app.route('/api/health')
    def health_check():
        return {"status": "ok"}
# --- END OF FILE backend/pkg/routes/__init__.py ---