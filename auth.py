import bcrypt
from flask_jwt_extended import create_access_token, get_jwt_identity
from models import User, db

def hash_password(password):
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed):
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def authenticate_user(username, password):
    """Authenticate user and return access token"""
    user = User.query.filter_by(username=username).first()
    if user and verify_password(password, user.password):
        access_token = create_access_token(identity=user.id)
        return access_token, user
    return None, None

def get_current_user():
    """Get current user from JWT token"""
    user_id = get_jwt_identity()
    if user_id:
        return User.query.get(user_id)
    return None
