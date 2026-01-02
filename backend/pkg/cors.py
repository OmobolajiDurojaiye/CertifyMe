from flask_cors import CORS

def init_cors(app):
    """
    Initializes CORS with a strict and secure configuration for production.
    """
    # Get the frontend URL from the app's configuration
    frontend_url = app.config.get('FRONTEND_URL')
    
    # Define the list of trusted origins
    origins = [
        "http://localhost:5173", # For local development
    ]

    # Add the production frontend URL only if it's set
    if frontend_url:
        origins.append(frontend_url)
    
    # Initialize CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": origins}},
        supports_credentials=True  # Allows cookies and auth headers to be sent
    )