from flask_mail import Message
from flask import current_app
from ..extensions import mail
from datetime import datetime

def send_admin_verification_email(admin_user):
    """
    Sends the 6-digit verification code to the pre-configured ADMIN_EMAIL
    to authorize the creation of a new admin account.
    """
    trusted_recipient = current_app.config.get('ADMIN_EMAIL')
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; }}
            .header {{ font-size: 24px; color: #333; text-align: center; padding: 10px; }}
            .code {{ font-size: 36px; font-weight: bold; color: #dc3545; text-align: center; margin: 20px 0; letter-spacing: 5px; }}
            .footer {{ font-size: 12px; text-align: center; color: #888; margin-top: 20px; }}
            .alert {{ border-left: 4px solid #ffc107; padding: 10px; background-color: #fff3cd; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">CertifyMe Admin Account Request</div>
            <div class="alert">
                <strong>Security Alert:</strong> A request has been made to create a new administrator account.
            </div>
            <p>Hello,</p>
            <p>
                An attempt to create a new admin account with the following details was made:
                <br>
                - <strong>Name:</strong> {admin_user.name}
                <br>
                - <strong>Email:</strong> {admin_user.email}
            </p>
            <p>To authorize this action, use the verification code below:</p>
            <div class="code">{admin_user.verification_code}</div>
            <p>This code will expire in 15 minutes. If you did not request this, you can safely ignore this email. No account will be created without this code.</p>
            <div class="footer">
                This is an automated security message from CertifyMe.
            </div>
        </div>
    </body>
    </html>
    """
    msg = Message(
        subject="[Action Required] New CertifyMe Admin Account Request",
        sender=('CertifyMe Security', current_app.config.get('MAIL_USERNAME')),
        recipients=[trusted_recipient],
        html=html_body
    )
    try:
        mail.send(msg)
        current_app.logger.info(f"Admin verification email sent to trusted address: {trusted_recipient}")
    except Exception as e:
        current_app.logger.error(f"Failed to send admin verification email: {e}")
        raise

def send_password_reset_email(user, reset_url):
    """
    Sends a password reset link to a user.
    """
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; background-color: #f4f4f4; }}
            .container {{ max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; }}
            .header {{ font-size: 24px; color: #333; text-align: center; padding: 10px; }}
            .button {{ display: inline-block; padding: 12px 25px; margin: 20px 0; font-size: 16px; color: #fff; background-color: #0d6efd; text-decoration: none; border-radius: 5px; }}
            .footer {{ font-size: 12px; text-align: center; color: #888; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">CertifyMe Password Reset Request</div>
            <p>Hello {user.name or 'User'},</p>
            <p>We received a request to reset the password for your account. If you did not make this request, you can safely ignore this email.</p>
            <p>To reset your password, please click the button below. This link is valid for 15 minutes.</p>
            <div style="text-align: center;">
                <a href="{reset_url}" class="button">Reset Your Password</a>
            </div>
            <p>If you're having trouble with the button, you can also copy and paste this link into your browser:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <div class="footer">
                This is an automated message from CertifyMe.
            </div>
        </div>
    </body>
    </html>
    """
    msg = Message(
        subject="Your CertifyMe Password Reset Link",
        sender=('CertifyMe Support', current_app.config.get('MAIL_USERNAME')),
        recipients=[user.email],
        html=html_body
    )
    try:
        mail.send(msg)
        current_app.logger.info(f"Password reset email sent to: {user.email}")
    except Exception as e:
        current_app.logger.error(f"Failed to send password reset email: {e}")
        raise

def send_bulk_email(users, subject, user_content, header_image_url=None):
    """
    Sends a personalized, professionally templated email to a list of user objects.
    - Personalizes content by replacing '{{ user_name }}' with the user's name.
    - Includes an optional header image with compact size and rounded corners.
    - Uses a robust, responsive HTML template.
    """
    social_links = {
        'instagram': current_app.config.get('SOCIAL_INSTAGRAM', '#'),
        'facebook': current_app.config.get('SOCIAL_FACEBOOK', '#'),
        'linkedin': current_app.config.get('SOCIAL_LINKEDIN', '#'),
        'twitter': current_app.config.get('SOCIAL_TWITTER', '#'),
    }

    try:
        with mail.connect() as conn:
            for user in users:
                # Personalize the content for each user, default to 'User' if name is None
                personalized_content = user_content.replace('{{ user_name }}', user.name or 'User')

                html_body = f"""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>{subject}</title>
                    <style>
                        body {{ margin: 0; padding: 0; background-color: #f2f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; }}
                        .wrapper {{ width: 100%; table-layout: fixed; background-color: #f2f4f6; padding: 40px 0; }}
                        .main {{ margin: 0 auto; width: 100%; max-width: 600px; background-color: #ffffff; border-spacing: 0; border-radius: 8px; }}
                        .content {{ padding: 20px 40px; color: #333333; font-size: 16px; line-height: 1.6; }}
                        .footer {{ padding: 20px 40px; text-align: center; color: #6c757d; font-size: 12px; }}
                        .social-icons img {{ width: 24px; height: 24px; margin: 0 8px; }}
                        a {{ color: #2563EB; text-decoration: none; }}
                        .header-image {{ max-width: 600px; width: 100%; height: auto; display: block; border-radius: 8px; }}
                    </style>
                </head>
                <body>
                    <center class="wrapper">
                        <table class="main" width="100%">
                            <!-- HEADER IMAGE (OPTIONAL) -->
                            {f'<tr><td><img src="{header_image_url}" alt="Header" class="header-image"></td></tr>' if header_image_url else ''}
                            
                            <!-- MAIN CONTENT -->
                            <tr>
                                <td class="content">
                                    {personalized_content}
                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td class="footer">
                                    <p style="margin-bottom: 20px;">Follow us on:</p>
                                    <p class="social-icons">
                                        <a href="{social_links['instagram']}"><img src="https://i.ibb.co/6rW8k04/instagram.png" alt="Instagram"></a>
                                        <a href="{social_links['facebook']}"><img src="https://i.ibb.co/d2r03s7/facebook.png" alt="Facebook"></a>
                                        <a href="{social_links['linkedin']}"><img src="https://i.ibb.co/xY7Xq65/linkedin.png" alt="LinkedIn"></a>
                                        <a href="{social_links['twitter']}"><img src="https://i.ibb.co/TThB71D/twitter.png" alt="Twitter"></a>
                                    </p>
                                    <p style="margin-top: 20px;">CertifyMe: Digital Certificates Made Simple</p>
                                    <p>&copy; {datetime.now().year} CertifyMe. All rights reserved.</p>
                                </td>
                            </tr>
                        </table>
                    </center>
                </body>
                </html>
                """

                msg = Message(
                    subject=subject,
                    sender=('CertifyMe', current_app.config.get('MAIL_USERNAME')),
                    recipients=[user.email],
                    html=html_body
                )
                conn.send(msg)
        current_app.logger.info(f"Successfully sent bulk email to {len(users)} recipients.")
    except Exception as e:
        current_app.logger.error(f"Failed during bulk email sending: {e}")
        raise