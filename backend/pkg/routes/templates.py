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

    data = request.form
    title = data.get('title')
    primary_color = data.get('primary_color', '#2563EB')
    secondary_color = data.get('secondary_color', '#64748B')
    body_font_color = data.get('body_font_color', '#333333')
    font_family = data.get('font_family', 'Georgia')
    layout_style = data.get('layout_style', 'modern')
    
    if layout_style not in ['classic', 'modern']:
        return jsonify({"msg": "Unsupported layout style. Use 'classic' or 'modern'."}), 400

    logo_url = None
    background_url = None

    if 'logo' in request.files:
        logo_file = request.files['logo']
        if logo_file and allowed_file(logo_file.filename):
            filename = secure_filename(f"{user_id}_logo_{logo_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            logo_file.save(save_path)
            logo_url = f"/Uploads/{filename}"

    if 'background' in request.files:
        bg_file = request.files['background']
        if bg_file and allowed_file(bg_file.filename):
            filename = secure_filename(f"{user_id}_bg_{bg_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            bg_file.save(save_path)
            background_url = f"/Uploads/{filename}"

    new_template = Template(
        user_id=user_id,
        title=title,
        logo_url=logo_url,
        background_url=background_url,
        primary_color=primary_color,
        secondary_color=secondary_color,
        body_font_color=body_font_color,
        font_family=font_family,
        layout_style=layout_style,
        placeholders={}
    )
    db.session.add(new_template)
    db.session.commit()
    return jsonify({"msg": "Template created successfully", "template_id": new_template.id}), 201

@template_bp.route('/', methods=['GET'])
@jwt_required(locations=["headers"])
def get_user_templates():
    user_id = int(get_jwt_identity())
    templates = Template.query.filter(
        (Template.user_id == user_id) | (Template.is_public == True)
    ).order_by(Template.is_public.asc(), Template.created_at.desc()).all()
    
    templates_data = [{
        'id': t.id,
        'title': t.title,
        'logo_url': t.logo_url,
        'background_url': t.background_url,
        'primary_color': t.primary_color,
        'secondary_color': t.secondary_color,
        'body_font_color': t.body_font_color,
        'font_family': t.font_family,
        'layout_style': t.layout_style,
        'is_public': t.is_public
    } for t in templates]
    return jsonify(templates_data), 200

@template_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required(locations=["headers"])
def get_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get(template_id)
    
    if not template:
        return jsonify({"msg": "Template not found"}), 404

    if not template.is_public and template.user_id != user_id:
        return jsonify({"msg": "You do not have permission to view this template"}), 403
    
    template_data = {
        'id': template.id,
        'title': template.title,
        'logo_url': template.logo_url,
        'background_url': template.background_url,
        'primary_color': template.primary_color,
        'secondary_color': template.secondary_color,
        'body_font_color': template.body_font_color,
        'font_family': template.font_family,
        'layout_style': template.layout_style,
        'is_public': template.is_public
    }
    return jsonify(template_data), 200

@template_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required(locations=["headers"])
def update_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get(template_id)
    
    if not template:
        return jsonify({"msg": "Template not found"}), 404
    
    if template.is_public or template.user_id != user_id:
        return jsonify({"msg": "You do not have permission to update this template"}), 403

    data = request.form
    if 'title' in data:
        template.title = data.get('title')
    
    if 'primary_color' in data:
        template.primary_color = data.get('primary_color')
    if 'secondary_color' in data:
        template.secondary_color = data.get('secondary_color')
    if 'body_font_color' in data:
        template.body_font_color = data.get('body_font_color')
    if 'font_family' in data:
        template.font_family = data.get('font_family')
    if 'layout_style' in data:
        layout_style = data.get('layout_style')
        if layout_style not in ['classic', 'modern']:
            return jsonify({"msg": "Unsupported layout style. Use 'classic' or 'modern'."}), 400
        template.layout_style = layout_style

    if 'logo' in request.files:
        logo_file = request.files['logo']
        if logo_file and allowed_file(logo_file.filename):
            # Optionally remove old logo file
            if template.logo_url:
                old_logo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(template.logo_url))
                if os.path.exists(old_logo_path):
                    try:
                        os.remove(old_logo_path)
                    except Exception as e:
                        current_app.logger.error(f"Failed to delete old logo: {e}")
            filename = secure_filename(f"{user_id}_logo_{logo_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            logo_file.save(save_path)
            template.logo_url = f"/Uploads/{filename}"

    if 'background' in request.files:
        bg_file = request.files['background']
        if bg_file and allowed_file(bg_file.filename):
            # Optionally remove old background file
            if template.background_url:
                old_bg_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(template.background_url))
                if os.path.exists(old_bg_path):
                    try:
                        os.remove(old_bg_path)
                    except Exception as e:
                        current_app.logger.error(f"Failed to delete old background: {e}")
            filename = secure_filename(f"{user_id}_bg_{bg_file.filename}")
            save_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            bg_file.save(save_path)
            template.background_url = f"/Uploads/{filename}"

    db.session.commit()
    return jsonify({"msg": "Template updated successfully", "template_id": template.id}), 200