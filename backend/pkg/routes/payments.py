import os
import requests
import hmac
import hashlib
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, User, Payment
import json

payments_bp = Blueprint('payments', __name__)

PAYSTACK_API_URL = "https://api.paystack.co"

# --- UPDATED: Amounts are now in USD cents ---
PLANS = {
    "starter": {"amount": 1500, "role": "starter"}, # $15.00 in cents
    "pro": {"amount": 9900, "role": "pro"}        # $99.00 in cents
}

# --- NEW: Function to get USD to NGN exchange rate ---
def get_usd_to_ngn_rate():
    """
    Fetches the current USD to NGN exchange rate from a public API.
    Includes a fallback rate in case the API call fails.
    """
    try:
        # Using a free, no-key-required API for simplicity
        response = requests.get('https://api.exchangerate-api.com/v4/latest/USD')
        response.raise_for_status()
        data = response.json()
        rate = data.get('rates', {}).get('NGN')
        if rate:
            current_app.logger.info(f"Fetched live USD to NGN rate: {rate}")
            return rate
    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Could not fetch exchange rate: {e}")
    
    # Fallback rate in case of API failure (set a safe, slightly high rate)
    fallback_rate = 1500.0 
    current_app.logger.warning(f"Using fallback USD to NGN rate: {fallback_rate}")
    return fallback_rate


@payments_bp.route('/initialize', methods=['POST'])
@jwt_required()
def initialize_payment():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    plan = data.get('plan') # 'starter' or 'pro'

    if plan not in PLANS:
        return jsonify({"msg": "Invalid plan selected"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    if user.role == 'pro':
        return jsonify({"msg": "You are already on the highest plan."}), 400
    if user.role == 'starter' and plan == 'starter':
        return jsonify({"msg": "You are already on this plan."}), 400

    plan_details = PLANS[plan]
    amount_in_usd_cents = plan_details['amount']
    amount_in_usd = amount_in_usd_cents / 100.0

    # --- UPDATED: Convert USD to NGN Kobo ---
    exchange_rate = get_usd_to_ngn_rate()
    amount_in_ngn_kobo = int(amount_in_usd * exchange_rate * 100)
    
    # Create a pending payment record
    new_payment = Payment(
        user_id=user_id,
        provider='paystack',
        plan=plan,
        amount=amount_in_usd, # Store the original USD amount for your records
        currency='USD', # Store the original currency
        status='pending'
    )
    db.session.add(new_payment)
    db.session.commit()
    
    transaction_ref = f"CM-{user_id}-{plan}-{new_payment.id}"
    new_payment.transaction_ref = transaction_ref
    db.session.commit()

    headers = {
        "Authorization": f"Bearer {current_app.config['PAYSTACK_SECRET_KEY']}",
        "Content-Type": "application/json"
    }
    payload = {
        "email": user.email,
        "amount": amount_in_ngn_kobo, # Send the calculated NGN Kobo amount
        "reference": transaction_ref,
        "currency": "NGN", # We are processing in NGN
        "metadata": {
            "user_id": user_id,
            "plan": plan,
            "amount_usd": amount_in_usd
        }
    }

    try:
        response = requests.post(f"{PAYSTACK_API_URL}/transaction/initialize", headers=headers, json=payload)
        response.raise_for_status()
        
        return jsonify({
            "msg": "Payment initialized",
            "email": user.email,
            "amount": amount_in_ngn_kobo, # Send amount for Paystack modal
            "reference": transaction_ref,
            "publicKey": current_app.config['PAYSTACK_PUBLIC_KEY']
        }), 200

    except requests.exceptions.RequestException as e:
        current_app.logger.error(f"Paystack API error: {e}")
        return jsonify({"msg": "Could not connect to payment provider"}), 500


@payments_bp.route('/webhook', methods=['POST'])
def paystack_webhook():
    current_app.logger.info("Received a request on the webhook endpoint.")
    secret_key = current_app.config['PAYSTACK_SECRET_KEY']
    payload = request.data
    signature = request.headers.get('x-paystack-signature')

    # Verify the request is from Paystack
    try:
        hash_ = hmac.new(secret_key.encode('utf-8'), payload, hashlib.sha512).hexdigest()
        if not hmac.compare_digest(hash_, signature):
            current_app.logger.warning("Invalid Paystack webhook signature.")
            return jsonify({"status": "error", "msg": "Invalid signature"}), 400
        current_app.logger.info("Webhook signature verified successfully.")
    except Exception as e:
        current_app.logger.error(f"Error during signature verification: {e}")
        return jsonify({"status": "error", "msg": "Signature verification failed"}), 400


    try:
        event = json.loads(payload)
        current_app.logger.info(f"Webhook event type: {event.get('event')}")
    except json.JSONDecodeError:
        current_app.logger.error("Failed to decode webhook JSON payload.")
        return jsonify({"status": "error", "msg": "Invalid JSON"}), 400

    if event.get('event') == 'charge.success':
        data = event['data']
        reference = data.get('reference')
        
        if not reference:
            current_app.logger.error("Webhook payload missing reference.")
            return jsonify({"status": "ok"}), 200

        current_app.logger.info(f"Processing charge.success for reference: {reference}")
        payment = Payment.query.filter_by(transaction_ref=reference).first()

        if not payment:
            current_app.logger.error(f"Payment with reference {reference} not found in DB.")
            return jsonify({"status": "ok"}), 200 # Return 200 so Paystack doesn't retry

        if payment.status == 'paid':
            current_app.logger.info(f"Payment {reference} already processed.")
            return jsonify({"status": "ok"}), 200
        
        # Update payment status
        payment.status = 'paid'
        
        # Upgrade user
        user = User.query.get(payment.user_id)
        if user:
            new_role = PLANS.get(payment.plan, {}).get('role')
            if new_role:
                user.role = new_role
                user.cert_quota = 999999 # Effectively unlimited
                current_app.logger.info(f"SUCCESS: User {user.id} upgraded to {new_role}.")
            else:
                 current_app.logger.error(f"Could not find role for plan '{payment.plan}' for user {user.id}.")
        else:
            current_app.logger.error(f"User with ID {payment.user_id} not found for payment {reference}.")

        db.session.commit()
        current_app.logger.info(f"Successfully committed changes for reference {reference}")

    return jsonify({"status": "ok"}), 200