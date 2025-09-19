from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, current_user
from ..models import Payment, Admin, db
from sqlalchemy import func

admin_payments_bp = Blueprint('admin_payments', __name__)

@admin_payments_bp.route('/payments/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    status = request.args.get('status')

    query = Payment.query
    if status:
        query = query.filter(Payment.status == status)

    payments = query.order_by(Payment.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    payment_list = [{
        'id': p.id,
        'user_id': p.user_id,
        'user_name': p.user.name,
        'amount': float(p.amount),
        'currency': p.currency,
        'plan': p.plan,
        'status': p.status,
        'date': p.created_at.isoformat(),
        'provider': p.provider
    } for p in payments.items]

    total_revenue = db.session.query(func.sum(Payment.amount)).filter(Payment.status == 'paid').scalar() or 0
    revenue_by_plan = db.session.query(Payment.plan, func.sum(Payment.amount)).filter(Payment.status == 'paid').group_by(Payment.plan).all()

    return jsonify({
        'transactions': payment_list,
        'total': payments.total,
        'pages': payments.pages,
        'stats': {
            'total_revenue': float(total_revenue),
            'revenue_by_plan': {plan: float(amount) for plan, amount in revenue_by_plan}
        }
    }), 200


#  route to get the details of a single transaction
@admin_payments_bp.route('/payments/transactions/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_transaction_details(payment_id):
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    payment = Payment.query.get_or_404(payment_id)

    payment_details = {
        'id': payment.id,
        'user_id': payment.user_id,
        'user_name': payment.user.name,
        'user_email': payment.user.email,
        'amount': float(payment.amount),
        'currency': payment.currency,
        'plan': payment.plan,
        'status': payment.status,
        'date': payment.created_at.isoformat(),
        'provider': payment.provider,
        'transaction_ref': payment.transaction_ref
    }

    return jsonify(payment_details), 200