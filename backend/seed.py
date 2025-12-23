from pkg import create_app
from pkg.extensions import db
from pkg.models import User, Template, Company
from bcrypt import hashpw, gensalt

app = create_app()

def seed_data():
    with app.app_context():
        print("Starting Database Seeder...")

        # 1. Create a Test User
        test_email = "test@certifyme.io"
        if not User.query.filter_by(email=test_email).first():
            hashed_password = hashpw("password123".encode('utf-8'), gensalt())
            user = User(
                name="Test User",
                email=test_email,
                password_hash=hashed_password.decode('utf-8'),
                role='pro',
                cert_quota=1000,
                is_verified=True
            )
            db.session.add(user)
            db.session.commit()
            print(f"User created: {test_email}")

        # 2. Create Default Public Templates

        if not Template.query.filter_by(title='Modern Blue').first():
            t1 = Template(
                title='Modern Blue',
                primary_color='#2563EB',
                secondary_color='#64748B',
                body_font_color='#1E293B',
                font_family='Lato',
                layout_style='modern',
                is_public=True,
                custom_text={"title": "Certificate of Completion", "body": "has successfully completed the course"}
            )
            db.session.add(t1)

        if not Template.query.filter_by(title='Classic Blue').first():
            t2 = Template(
                title='Classic Blue',
                primary_color='#1E3A8A',
                secondary_color='#D1D5DB',
                body_font_color='#111827',
                font_family='Georgia',
                layout_style='classic',
                is_public=True,
                custom_text={"title": "Certificate of Achievement", "body": "is hereby awarded this certificate for"}
            )
            db.session.add(t2)

        # Payment Receipt - Ensure layout_style is explicitly set
        receipt_template = Template.query.filter_by(title='Official Receipt').first()
        if not receipt_template:
            t3 = Template(
                title='Official Receipt',
                primary_color='#111827',
                secondary_color='#4B5563', 
                body_font_color='#1F2937',
                font_family='Inter',
                layout_style='receipt',
                is_public=True,
                custom_text={"title": "PAYMENT RECEIPT", "body": "PAID"}
            )
            db.session.add(t3)
        else:
            # If it exists, ensure its style is correct
            receipt_template.layout_style = 'receipt'


        db.session.commit()
        print("Seeding Complete (Modern, Classic, Receipt)!")

if __name__ == '__main__':
    seed_data()