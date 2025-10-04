# File: app/routes/visual_templates.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import db, Template

visual_template_bp = Blueprint('visual_template', __name__)

@visual_template_bp.route('/', methods=['POST'])
@jwt_required()
def create_visual_template():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    title = data.get('title', 'Custom Visual Template')
    layout_data = data.get('layout_data', {
        'canvas': {'width': 842, 'height': 595},
        'background': {},
        'elements': []
    })

    new_template = Template(
        user_id=user_id,
        title=title,
        layout_style='visual',
        layout_data=layout_data
    )
    db.session.add(new_template)
    db.session.commit()
    return jsonify({"msg": "Visual template created", "id": new_template.id}), 201

@visual_template_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required()
def get_visual_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get_or_404(template_id)
    if template.user_id != user_id and not template.is_public:
        return jsonify({"msg": "Permission denied"}), 403
    if template.layout_style != 'visual':
        return jsonify({"msg": "Not a visual template"}), 400
    return jsonify({
        "id": template.id,
        "title": template.title,
        "layout_data": template.layout_data
    }), 200

@visual_template_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required()
def update_visual_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get_or_404(template_id)
    if template.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403
    if template.layout_style != 'visual':
        return jsonify({"msg": "Not a visual template"}), 400
    data = request.get_json()
    template.title = data.get('title', template.title)
    template.layout_data = data.get('layout_data', template.layout_data)
    db.session.commit()
    return jsonify({"msg": "Visual template updated"}), 200