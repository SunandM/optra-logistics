import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import random
import string
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Email Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USERNAME)

def verify_password(plain_password, hashed_password):
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_otp():
    """Generate 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_email_otp(to_email: str, otp_code: str):
    """Send OTP via email"""
    if not SMTP_USERNAME or not SMTP_PASSWORD:
        print(f"SMTP credentials not configured. OTP for {to_email}: {otp_code}")
        return True
    
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = 'RouteOptima - Password Reset OTP'
        
        body = f"""
        Hello,
        
        Your OTP for password reset is: {otp_code}
        
        This OTP will expire in 5 minutes.
        
        If you didn't request this, please ignore this email.
        
        Thanks,
        RouteOptima Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        text = msg.as_string()
        server.sendmail(FROM_EMAIL, to_email, text)
        server.quit()
        
        print(f"OTP sent to {to_email}: {otp_code}")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        # For development, print OTP to console
        print(f"OTP for {to_email}: {otp_code}")
        return True

def send_sms_otp(phone_number: str, otp_code: str):
    """Send OTP via SMS (placeholder for Twilio integration)"""
    print(f"SMS OTP for {phone_number}: {otp_code}")
    # TODO: Implement Twilio SMS integration
    return True

def send_otp(email: str = None, phone: str = None, otp_code: str = None, delivery_method: str = "email"):
    """Send OTP via specified method"""
    if delivery_method == "email" and email:
        return send_email_otp(email, otp_code)
    elif delivery_method == "sms" and phone:
        return send_sms_otp(phone, otp_code)
    else:
        print(f"Invalid delivery method or missing contact info: {delivery_method}")
        return False
