import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models import db, Template

template_bp = Blueprint('templates', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'svg'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@template_bp.route('/', methods=['POST'])
@jwt_required(locations=["headers"])
def create_template():
    user_id = int(get_jwt_identity())
    if 'title' not in request.form:
        return jsonify({"msg": "Missing title part"}), 400

    title = request.form.get('title')
    primary_color = request.form.get('primary_color', '#2563EB')
    font_family = request.form.get('font_family', 'Georgia')
    logo_url = None
    background_url = None

    # Handle logo upload
    if 'logo' in request.files:
        logo_file = request.files['logo']
        if logo_file and allowed_file(logo_file.filename):
            filename = secure_filename(f"{user_id}_logo_{logo_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            logo_file.save(save_path)
            logo_url = f"/uploads/{filename}"

    # Handle background image upload
    if 'background' in request.files:
        bg_file = request.files['background']
        if bg_file and allowed_file(bg_file.filename):
            filename = secure_filename(f"{user_id}_bg_{bg_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            bg_file.save(save_path)
            background_url = f"/uploads/{filename}"

    new_template = Template(
        user_id=user_id,
        title=title,
        logo_url=logo_url,
        background_url=background_url,
        primary_color=primary_color,
        font_family=font_family,
        placeholders={}  # For future dynamic fields
    )
    db.session.add(new_template)
    db.session.commit()
    return jsonify({"msg": "Template created successfully", "template_id": new_template.id}), 201

@template_bp.route('/', methods=['GET'])
@jwt_required(locations=["headers"])
def get_user_templates():
    user_id = int(get_jwt_identity())
    templates = Template.query.filter_by(user_id=user_id).order_by(Template.created_at.desc()).all()
    templates_data = [{
        'id': t.id,
        'title': t.title,
        'logo_url': t.logo_url,
        'background_url': t.background_url,
        'primary_color': t.primary_color,
        'font_family': t.font_family
    } for t in templates]
    return jsonify(templates_data), 200

@template_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required(locations=["headers"])
def get_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.filter_by(id=template_id, user_id=user_id).first()
    if not template:
        return jsonify({"msg": "Template not found or does not belong to user"}), 404
    
    template_data = {
        'id': template.id,
        'title': template.title,
        'logo_url': template.logo_url,
        'background_url': template.background_url,
        'primary_color': template.primary_color,
        'font_family': template.font_family
    }
    return jsonify(template_data), 200