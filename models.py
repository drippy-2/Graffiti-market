from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('buyer', 'seller', 'admin', name='user_roles'), nullable=False, default='buyer')
    phone = db.Column(db.String(20))
    address = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    seller_profile = db.relationship('Seller', backref='user', uselist=False)
    cart_items = db.relationship('CartItem', backref='user', lazy=True, cascade='all, delete-orphan')
    orders_as_buyer = db.relationship('Order', foreign_keys='Order.buyer_id', backref='buyer', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'address': self.address,
            'createdAt': self.created_at.isoformat()
        }

class Seller(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    business_name = db.Column(db.String(200), nullable=False)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', name='seller_status'), default='pending')
    documents = db.Column(db.Text)
    verified_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    products = db.relationship('Product', backref='seller', lazy=True)
    orders = db.relationship('Order', foreign_keys='Order.seller_id', backref='seller', lazy=True)
    withdrawals = db.relationship('Withdrawal', backref='seller', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'businessName': self.business_name,
            'status': self.status,
            'documents': self.documents,
            'verifiedAt': self.verified_at.isoformat() if self.verified_at else None,
            'createdAt': self.created_at.isoformat()
        }

class Product(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = db.Column(db.String(36), db.ForeignKey('seller.id'), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    category = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    cart_items = db.relationship('CartItem', backref='product', lazy=True)
    order_items = db.relationship('OrderItem', backref='product', lazy=True)
    reviews = db.relationship('Review', backref='product', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'sellerId': self.seller_id,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'stock': self.stock,
            'category': self.category,
            'imageUrl': self.image_url,
            'createdAt': self.created_at.isoformat()
        }

class CartItem(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'createdAt': self.created_at.isoformat(),
            'product': self.product.to_dict() if self.product else None
        }

class Order(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    buyer_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    seller_id = db.Column(db.String(36), db.ForeignKey('seller.id'), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_address = db.Column(db.Text, nullable=False)
    method = db.Column(db.String(50), nullable=False)
    carrier = db.Column(db.String(100))
    tracking_number = db.Column(db.String(100))
    status = db.Column(db.Enum('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled', name='order_status'), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'buyerId': self.buyer_id,
            'sellerId': self.seller_id,
            'totalPrice': float(self.total_price),
            'shippingAddress': self.shipping_address,
            'method': self.method,
            'carrier': self.carrier,
            'trackingNumber': self.tracking_number,
            'status': self.status,
            'createdAt': self.created_at.isoformat(),
            'items': [item.to_dict() for item in self.order_items]
        }

class OrderItem(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = db.Column(db.String(36), db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'orderId': self.order_id,
            'productId': self.product_id,
            'quantity': self.quantity,
            'price': float(self.price),
            'product': self.product.to_dict() if self.product else None
        }

class Withdrawal(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = db.Column(db.String(36), db.ForeignKey('seller.id'), nullable=False)
    amount_requested = db.Column(db.Numeric(10, 2), nullable=False)
    amount_paid = db.Column(db.Numeric(10, 2), nullable=False)
    method = db.Column(db.Enum('paypal', 'bank', name='withdrawal_methods'), nullable=False)
    status = db.Column(db.Enum('pending', 'processed', 'rejected', name='withdrawal_status'), default='pending')
    transaction_id = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'sellerId': self.seller_id,
            'amountRequested': float(self.amount_requested),
            'amountPaid': float(self.amount_paid),
            'method': self.method,
            'status': self.status,
            'transactionId': self.transaction_id,
            'createdAt': self.created_at.isoformat(),
            'processedAt': self.processed_at.isoformat() if self.processed_at else None
        }

class Review(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('user.id'), nullable=False)
    product_id = db.Column(db.String(36), db.ForeignKey('product.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'productId': self.product_id,
            'rating': self.rating,
            'comment': self.comment,
            'createdAt': self.created_at.isoformat(),
            'user': self.user.username if self.user else None
        }
