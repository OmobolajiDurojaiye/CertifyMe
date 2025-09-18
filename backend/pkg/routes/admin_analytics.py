from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt, current_user
from ..models import User, Certificate, Payment, Admin, db
from sqlalchemy import func, extract
from datetime import datetime
from dateutil.relativedelta import relativedelta

admin_analytics_bp = Blueprint('admin_analytics', __name__)

# --- THIS IS THE FIX ---
# The route path is now direct and simple, matching the frontend's request.
@admin_analytics_bp.route('/dashboard-stats', methods=['GET'])
# --- END OF FIX ---
@jwt_required()
def get_dashboard_stats():
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    total_users = User.query.count()
    total_certificates = Certificate.query.count()
    total_revenue = db.session.query(func.sum(Payment.amount)).filter(Payment.status == 'paid').scalar() or 0

    return jsonify({
        'total_users': total_users,
        'total_certificates': total_certificates,
        'total_revenue': float(total_revenue)
    }), 200

# The '/analytics/insights' route is correct and does not need to be changed.
@admin_analytics_bp.route('/analytics/insights', methods=['GET'])
@jwt_required()
def get_analytics():
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    end_date = datetime.utcnow()
    start_date = end_date - relativedelta(months=12)
    user_growth = db.session.query(
        extract('year', User.created_at).label('year'),
        extract('month', User.created_at).label('month'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= start_date).group_by(
        extract('year', User.created_at), extract('month', User.created_at)
    ).order_by('year', 'month').all()

    cert_growth = db.session.query(
        extract('year', Certificate.created_at).label('year'),
        extract('month', Certificate.created_at).label('month'),
        func.count(Certificate.id).label('count')
    ).filter(Certificate.created_at >= start_date).group_by(
        extract('year', Certificate.created_at), extract('month', Certificate.created_at)
    ).order_by('year', 'month').all()

    plan_dist = db.session.query(User.role, func.count(User.id).label('count')).group_by(User.role).all()

    top_users = db.session.query(
        User.id, User.name, func.count(Certificate.id).label('cert_count')
    ).join(Certificate).group_by(User.id, User.name).order_by(func.count(Certificate.id).desc()).limit(10).all()

    return jsonify({
        'user_growth': [{'year': int(g.year), 'month': int(g.month), 'count': g.count} for g in user_growth],
        'cert_growth': [{'year': int(g.year), 'month': int(g.month), 'count': g.count} for g in cert_growth],
        'plan_distribution': [{'role': p.role, 'count': p.count} for p in plan_dist],
        'top_users': [{'id': u.id, 'name': u.name, 'cert_count': u.cert_count} for u in top_users]
    }), 200