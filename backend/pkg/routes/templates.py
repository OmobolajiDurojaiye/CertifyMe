import os
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from ..models import db, Template
import json

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
    
    custom_text_data = {
        "title": data.get('custom_title', 'Certificate of Completion'),
        "body": data.get('custom_body', 'has successfully completed the course')
    }

    logo_url, background_url = None, None
    if 'logo' in request.files:
        logo_file = request.files['logo']
        if logo_file and allowed_file(logo_file.filename):
            filename = secure_filename(f"{user_id}_logo_{logo_file.filename}")
            logo_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            logo_url = f"/uploads/{filename}"

    if 'background' in request.files:
        bg_file = request.files['background']
        if bg_file and allowed_file(bg_file.filename):
            filename = secure_filename(f"{user_id}_bg_{bg_file.filename}")
            bg_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            background_url = f"/uploads/{filename}"

    new_template = Template(
        user_id=user_id,
        title=data.get('title'),
        logo_url=logo_url,
        background_url=background_url,
        primary_color=data.get('primary_color', '#2563EB'),
        secondary_color=data.get('secondary_color', '#64748B'),
        body_font_color=data.get('body_font_color', '#333333'),
        font_family=data.get('font_family', 'Georgia'),
        layout_style=data.get('layout_style', 'modern'),
        custom_text=custom_text_data
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
        'is_public': t.is_public,
        'custom_text': t.custom_text
    } for t in templates]
    
    # --- THIS IS THE FIX ---
    # Return an object with a 'templates' key, containing the array.
    return jsonify({"templates": templates_data}), 200
    # --- END OF FIX ---

@template_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required(locations=["headers"])
def get_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get_or_404(template_id)
    if not template.is_public and template.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403
    
    return jsonify({
        'id': template.id, 'title': template.title, 'logo_url': template.logo_url,
        'background_url': template.background_url, 'primary_color': template.primary_color,
        'secondary_color': template.secondary_color, 'body_font_color': template.body_font_color,
        'font_family': template.font_family, 'layout_style': template.layout_style,
        'is_public': template.is_public, 'custom_text': template.custom_text
    }), 200

@template_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required(locations=["headers"])
def update_template(template_id):
    user_id = int(get_jwt_identity())
    template = Template.query.get_or_404(template_id)
    if template.is_public or template.user_id != user_id:
        return jsonify({"msg": "Permission denied"}), 403

    data = request.form
    
    # Update main fields
    if 'title' in data: template.title = data.get('title')
    if 'primary_color' in data: template.primary_color = data.get('primary_color')
    if 'secondary_color' in data: template.secondary_color = data.get('secondary_color')
    if 'body_font_color' in data: template.body_font_color = data.get('body_font_color')
    if 'font_family' in data: template.font_family = data.get('font_family')
    if 'layout_style' in data: template.layout_style = data.get('layout_style')

    # Update custom text
    custom_text_data = template.custom_text or {}
    if 'custom_title' in data: custom_text_data['title'] = data.get('custom_title')
    if 'custom_body' in data: custom_text_data['body'] = data.get('custom_body')
    template.custom_text = custom_text_data

    # Handle file uploads
    if 'logo' in request.files:
        logo_file = request.files['logo']
        if logo_file and allowed_file(logo_file.filename):
            filename = secure_filename(f"{user_id}_logo_{logo_file.filename}")
            logo_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            template.logo_url = f"/uploads/{filename}"

    if 'background' in request.files:
        bg_file = request.files['background']
        if bg_file and allowed_file(bg_file.filename):
            filename = secure_filename(f"{user_id}_bg_{bg_file.filename}")
            bg_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            template.background_url = f"/uploads/{filename}"

    db.session.commit()
    return jsonify({"msg": "Template updated successfully"}), 200