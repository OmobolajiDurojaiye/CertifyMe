# payments.py
import os
import requests
import hmac
import uuid
import hashlib
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Payment
from datetime import datetime, timedelta
import json

payments_bp = Blueprint('payments', __name__)

PAYSTACK_API_URL = "https://api.paystack.co"

PLANS = {
    "starter": {"amount_usd": 15.00, "certificates": 500, "role": "starter"},
    "growth": {"amount_usd": 50.00, "certificates": 2000, "role": "growth"},
    "pro": {"amount_usd": 100.00, "certificates": 5000, "role": "pro"},
    "enterprise": {"amount_usd": 300.00, "certificates": 20000, "role": "enterprise"}
}

role_order = {
    'free': 0,
    'starter': 1,
    'growth': 2,
    'pro': 3,
    'enterprise': 4
}

def get_usd_to_ngn_rate():
    try:
        response = requests.get('https://api.exchangerate-api.com/v4/latest/USD')
        response.raise_for_status()
        data = response.json()
        rate = data.get('rates', {}).get('NGN')
        if rate:
            current_app.logger.info(f"Fetched live USD to NGN rate: {rate}")
            return rate
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Could not fetch exchange rate: {e}")
    fallback_rate = 1500.0 
    current_app.logger.warning(f"Using fallback USD to NGN rate: {fallback_rate}")
    return fallback_rate

@payments_bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    plan = data.get('plan')
    if plan not in PLANS: return jsonify({"msg": "Invalid plan"}), 400
    user = User.query.get(user_id)
    if not user: return jsonify({"msg": "User not found"}), 404
    
    plan_details = PLANS[plan]
    plan_role_order = role_order[plan]
    current_order = role_order[user.role]
    if plan_role_order < current_order:
        return jsonify({"msg": f"Cannot purchase lower tier than current {user.role}"}), 400
    
    amount_in_usd = plan_details['amount_usd']
    paystack_key = current_app.config.get('PAYSTACK_SECRET_KEY', '')
    is_ngn_account = paystack_key.startswith('sk_test_') or paystack_key.startswith('sk_live_')

    if is_ngn_account:
        current_app.logger.info("NGN account detected. Converting currency.")
        exchange_rate = get_usd_to_ngn_rate()
        amount_to_charge = int(amount_in_usd * exchange_rate * 100)
        currency_to_charge = "NGN"
    else:
        current_app.logger.info("Non-NGN (USD) account detected. Using USD cents.")
        amount_to_charge = int(amount_in_usd * 100)
        currency_to_charge = "USD"
    
    new_payment = Payment(user_id=user_id, provider='paystack', plan=plan, amount=amount_in_usd, currency='USD', status='pending')
    db.session.add(new_payment)
    db.session.commit()
    
    transaction_ref = f"CM-{user_id}-{plan}-{uuid.uuid4().hex}"
    new_payment.transaction_ref = transaction_ref
    db.session.commit()


    return jsonify({
        "email": user.email,
        "amount": amount_to_charge,
        "reference": transaction_ref,
        "currency": currency_to_charge,
        "publicKey": current_app.config.get('PAYSTACK_PUBLIC_KEY'),
        "metadata": { "user_id": user_id, "plan": plan, "amount_usd": amount_in_usd }
    }), 200

@payments_bp.route('/webhook', methods=['POST'])
def paystack_webhook():
    secret_key = current_app.config.get('PAYSTACK_SECRET_KEY')
    payload = request.data
    signature = request.headers.get('x-paystack-signature')
    current_app.logger.info(f"Received webhook with signature: {signature}")
    current_app.logger.info(f"Payload: {payload.decode('utf-8')}")
    
    try:
        hash_ = hmac.new(secret_key.encode('utf-8'), payload, hashlib.sha512).hexdigest()
        current_app.logger.info(f"Computed HMAC: {hash_}")
        if not hmac.compare_digest(hash_, signature):
            current_app.logger.error("Signature mismatch")
            return jsonify({"status": "error", "msg": "Invalid signature"}), 400
    except Exception as e:
        current_app.logger.error(f"Signature verification error: {str(e)}")
        return jsonify({"status": "error", "msg": "Signature verification failed"}), 400
    
    event = json.loads(payload)
    current_app.logger.info(f"Webhook event: {event}")
    
    if event.get('event') == 'charge.success':
        reference = event['data'].get('reference')
        payment = Payment.query.filter_by(transaction_ref=reference).first()
        if not payment or payment.status == 'paid':
            current_app.logger.warning(f"Payment {reference} not found or already processed")
            return jsonify({"status": "ok"}), 200
        
        payment.status = 'paid'
        user = User.query.get(payment.user_id)
        if user:
            plan_details = PLANS.get(payment.plan, {})
            if plan_details:
                user.cert_quota += plan_details['certificates']
                user.role = plan_details['role']
                current_app.logger.info(f"User {user.id} upgraded to {payment.plan}, new quota: {user.cert_quota}, role: {user.role}")
        db.session.commit()
    
    return jsonify({"status": "ok"}), 200