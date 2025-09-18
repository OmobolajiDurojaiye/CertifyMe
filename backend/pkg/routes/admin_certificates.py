from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, current_user
from ..models import Certificate, Template, db, User, Admin
from sqlalchemy import func

admin_certificates_bp = Blueprint('admin_certificates', __name__)

# --- THIS IS THE FIX ---
# The route now correctly includes '/certificates' to match the frontend request.
@admin_certificates_bp.route('/certificates/overview', methods=['GET'])
# --- END OF FIX ---
@jwt_required()
def get_certificates_overview():
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    total_certificates = Certificate.query.count()
    by_user = db.session.query(Certificate.user_id, func.count(Certificate.id).label('count')).group_by(Certificate.user_id).order_by(func.count(Certificate.id).desc()).all()
    by_template = db.session.query(Certificate.template_id, func.count(Certificate.id).label('count')).group_by(Certificate.template_id).order_by(func.count(Certificate.id).desc()).all()

    user_breakdown = [{'user_id': uid, 'user_name': User.query.get(uid).name if User.query.get(uid) else 'Unknown', 'count': count} for uid, count in by_user]
    template_breakdown = [{'template_id': tid, 'title': Template.query.get(tid).title if Template.query.get(tid) else 'Unknown', 'count': count} for tid, count in by_template]

    return jsonify({
        'total': total_certificates,
        'by_user': user_breakdown,
        'by_template': template_breakdown
    }), 200

# --- THIS IS THE FIX ---
# The route now correctly includes '/certificates' to match the frontend request.
@admin_certificates_bp.route('/certificates/<int:cert_id>/revoke', methods=['POST'])
# --- END OF FIX ---
@jwt_required()
def revoke_certificate(cert_id):
    if not isinstance(current_user, Admin):
        return jsonify({"msg": "Admin access required"}), 403

    cert = Certificate.query.get_or_404(cert_id)
    cert.status = 'revoked'
    db.session.commit()
    return jsonify({'msg': 'Certificate revoked'}), 200