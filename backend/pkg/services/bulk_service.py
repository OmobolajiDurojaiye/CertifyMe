import pandas as pd
import uuid
from ..models import db, Certificate, User
from ..utils.helpers import parse_smart_date, normalize_email, normalize_headers
from ..services.email_service import create_certificate_email
from ..services.pdf_service import generate_certificate_pdf
from ..extensions import mail
from datetime import datetime

def process_bulk_upload(file, template, group_id, user_id):
    """
    Reads file, normalizes data, and creates certificates in bulk.
    Returns summary stats.
    """
    user = User.query.get(user_id)
    
    # 1. Read File
    try:
        if file.filename.lower().endswith(('.xlsx', '.xls', '.ods')):
            df = pd.read_excel(file)
        else:
            df = pd.read_csv(file)
    except Exception as e:
        return {"error": f"Could not read file: {str(e)}", "status": 400}

    if df.empty:
        return {"error": "File is empty", "status": 400}

    # 2. Smart Normalization
    df = normalize_headers(df)

    # 3. Validation
    required_cols = {'recipient_name', 'course_title', 'issue_date'}
    missing = required_cols - set(df.columns)
    if missing:
        # Fallback: If missing specific cols, check if we can map by index (not implemented here for safety)
        return {"error": f"Could not find required columns: {', '.join(missing)}. Please check your headers.", "status": 400}

    # 4. Processing
    certs_to_add = []
    errors = []
    quota_left = user.cert_quota
    
    # Replace NaN with None
    df = df.where(pd.notna(df), None)

    for idx, row in df.iterrows():
        row_num = idx + 2 # Excel starts at 1, header is 1
        
        if quota_left <= 0:
            errors.append({"row": row_num, "msg": "Quota exhausted. Upgrade plan to continue."})
            continue

        try:
            # Data Extraction
            r_name = row.get('recipient_name')
            c_title = row.get('course_title')
            i_date_raw = row.get('issue_date')

            if not r_name or not c_title:
                errors.append({"row": row_num, "msg": "Missing Name or Course Title."})
                continue

            # Smart Date Parsing (Fixes the Excel 45587 error)
            i_date = parse_smart_date(i_date_raw)

            # Optional Fields
            r_email = normalize_email(row.get('recipient_email'))
            issuer = str(row.get('issuer_name')) if row.get('issuer_name') else (user.company.name if user.company else user.name)
            sig = str(row.get('signature')) if row.get('signature') else None
            
            # Extra Fields (Amount, etc)
            extra_fields = {}
            if row.get('amount'):
                extra_fields['amount'] = str(row.get('amount'))

            # Create Object
            cert = Certificate(
                user_id=user.id,
                company_id=user.company_id,
                template_id=template.id,
                group_id=group_id,
                recipient_name=str(r_name),
                recipient_email=r_email,
                course_title=str(c_title),
                issuer_name=issuer,
                issue_date=i_date,
                signature=sig,
                extra_fields=extra_fields,
                verification_id=str(uuid.uuid4())
            )
            
            certs_to_add.append(cert)
            quota_left -= 1

        except Exception as e:
            errors.append({"row": row_num, "msg": str(e)})

    # 5. Commit to DB
    if certs_to_add:
        try:
            db.session.bulk_save_objects(certs_to_add)
            user.cert_quota = quota_left
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"error": "Database commit failed.", "status": 500}

    # 6. Return Result
    return {
        "msg": "Processing complete",
        "created": len(certs_to_add),
        "errors": errors,
        "status": 201 if certs_to_add else 400
    }