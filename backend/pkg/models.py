from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    role = db.Column(db.Enum('free', 'starter', 'pro', name='user_roles'), default='free', nullable=False)
    cert_quota = db.Column(db.Integer, default=10, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    templates = db.relationship('Template', backref='user', lazy=True)
    certificates = db.relationship('Certificate', backref='user', lazy=True)
    payments = db.relationship('Payment', backref='user', lazy=True)

class Template(db.Model):
    __tablename__ = 'templates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    background_url = db.Column(db.Text)
    logo_url = db.Column(db.Text)
    primary_color = db.Column(db.String(7), default='#2563EB')  # Default primary color
    font_family = db.Column(db.String(50), default='Georgia')  # Default font
    placeholders = db.Column(db.JSON, default={})  # For future dynamic fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    certificates = db.relationship('Certificate', backref='template', lazy=True)

class Certificate(db.Model):
    __tablename__ = 'certificates'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    template_id = db.Column(db.Integer, db.ForeignKey('templates.id'), nullable=False)
    recipient_name = db.Column(db.String(150), nullable=False)
    course_title = db.Column(db.String(150), nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    signature = db.Column(db.String(150), nullable=True)
    verification_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    pdf_url = db.Column(db.Text)
    status = db.Column(db.Enum('valid', 'revoked', name='certificate_statuses'), default='valid', nullable=False)
    sent_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    provider = db.Column(db.Enum('paystack', 'stripe', 'lemonsqueezy', name='payment_providers'), nullable=False)
    plan = db.Column(db.Enum('free', 'starter', 'pro', 'credits', name='payment_plans'), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(5), nullable=False)
    status = db.Column(db.Enum('pending', 'paid', 'failed', name='payment_statuses'), default='pending', nullable=False)
    transaction_ref = db.Column(db.String(100), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)