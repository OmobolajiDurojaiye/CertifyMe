# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import uuid
import random
from .extensions import db
from sqlalchemy import func

class AdminActionLog(db.Model):
    __tablename__ = 'admin_action_logs'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admins.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    target_type = db.Column(db.String(50), nullable=True) # e.g., 'user', 'certificate'
    target_id = db.Column(db.Integer, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    admin = db.relationship('Admin', backref='action_logs')
# --- END OF NEW MODEL ---

# --- ADMIN MODEL ---
class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    verification_code = db.Column(db.String(6), nullable=True)
    verification_expiry = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_verification_code(self):
        """Generates a 6-digit code and sets an expiry time."""
        self.verification_code = str(random.randint(100000, 999999))
        self.verification_expiry = datetime.utcnow() + timedelta(minutes=15)

# --- USER MODEL (Remove 'admin' from ENUM) ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Enum('free', 'starter', 'growth', 'pro', 'enterprise', name='user_roles'), default='free', nullable=False)
    cert_quota = db.Column(db.Integer, default=10, nullable=False)
    subscription_expiry = db.Column(db.DateTime, nullable=True)
    signature_image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    templates = db.relationship('Template', backref='user', lazy=True)
    certificates = db.relationship('Certificate', backref='issuer', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)
    last_login = db.Column(db.DateTime, nullable=True)


class Template(db.Model):
    # ... (no changes in this model)
    __tablename__ = 'templates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True) 
    title = db.Column(db.String(150), nullable=False)
    background_url = db.Column(db.Text)
    logo_url = db.Column(db.Text)
    primary_color = db.Column(db.String(7), default='#2563EB')
    secondary_color = db.Column(db.String(7), default='#64748B') 
    body_font_color = db.Column(db.String(7), default='#333333') 
    font_family = db.Column(db.String(50), default='Georgia')
    layout_style = db.Column(db.Enum('classic', 'modern', name='template_layouts'), default='modern', nullable=False) 
    is_public = db.Column(db.Boolean, default=False, nullable=False)
    custom_text = db.Column(db.JSON, nullable=False, default=lambda: {
        "title": "Certificate of Completion",
        "body": "has successfully completed the course"
    })
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    certificates = db.relationship('Certificate', backref='template', lazy=True)

class Group(db.Model):
    # ... (no changes in this model)
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    certificates = db.relationship('Certificate', backref='group', lazy=True)

class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('templates.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=True)
    recipient_name = db.Column(db.String(150), nullable=False)
    recipient_email = db.Column(db.String(120), nullable=False)
    course_title = db.Column(db.String(150), nullable=False)
    issuer_name = db.Column(db.String(150), nullable=True) 
    issue_date = db.Column(db.Date, nullable=False)
    signature = db.Column(db.String(150), nullable=True)
    
    # --- THIS IS THE NEW FIELD ---
    extra_fields = db.Column(db.JSON, nullable=True)
    # --- END OF NEW FIELD ---

    verification_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    status = db.Column(db.Enum('valid', 'revoked', name='certificate_statuses'), default='valid', nullable=False)
    sent_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    # ... (no changes in this model)
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    provider = db.Column(db.Enum('paystack', 'stripe', name='payment_providers'), nullable=False)
    plan = db.Column(db.Enum('starter', 'growth', 'pro', 'enterprise', name='payment_plans'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(5), nullable=False)
    status = db.Column(db.Enum('pending', 'paid', 'failed', name='payment_statuses'), default='pending', nullable=False)
    transaction_ref = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)