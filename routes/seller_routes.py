from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Seller, Withdrawal, Order, OrderItem, Product, db
from auth import get_current_user
from datetime import datetime
from decimal import Decimal

seller_bp = Blueprint('seller', __name__)

@seller_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_seller_dashboard():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller:
            return jsonify({'message': 'Seller profile not found'}), 404
        
        # Calculate revenue metrics
        orders = Order.query.filter_by(seller_id=seller.id).all()
        total_sales = sum(float(order.total_price) for order in orders if order.status != 'cancelled')
        
        # Calculate pending balance (completed orders minus withdrawals)
        completed_orders = [order for order in orders if order.status == 'delivered']
        total_earnings = sum(float(order.total_price) for order in completed_orders)
        
        withdrawals = Withdrawal.query.filter_by(seller_id=seller.id, status='processed').all()
        total_withdrawn = sum(float(w.amount_requested) for w in withdrawals)
        
        pending_balance = total_earnings - total_withdrawn
        
        # Get product count
        product_count = Product.query.filter_by(seller_id=seller.id).count()
        
        # Get recent orders
        recent_orders = Order.query.filter_by(seller_id=seller.id).order_by(Order.created_at.desc()).limit(10).all()
        
        return jsonify({
            'seller': seller.to_dict(),
            'metrics': {
                'totalSales': total_sales,
                'pendingBalance': max(0, pending_balance),
                'totalWithdrawn': total_withdrawn,
                'productCount': product_count,
                'orderCount': len(orders)
            },
            'recentOrders': [order.to_dict() for order in recent_orders]
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@seller_bp.route('/products', methods=['GET'])
@jwt_required()
def get_seller_products():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller:
            return jsonify({'message': 'Seller profile not found'}), 404
        
        products = Product.query.filter_by(seller_id=seller.id).all()
        
        return jsonify({
            'products': [product.to_dict() for product in products]
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@seller_bp.route('/withdrawals', methods=['GET'])
@jwt_required()
def get_withdrawals():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller:
            return jsonify({'message': 'Seller profile not found'}), 404
        
        withdrawals = Withdrawal.query.filter_by(seller_id=seller.id).order_by(Withdrawal.created_at.desc()).all()
        
        return jsonify({
            'withdrawals': [withdrawal.to_dict() for withdrawal in withdrawals]
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@seller_bp.route('/withdrawals', methods=['POST'])
@jwt_required()
def request_withdrawal():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller or seller.status != 'approved':
            return jsonify({'message': 'Seller not approved'}), 403
        
        data = request.get_json()
        
        if not all(k in data for k in ('amount', 'method')):
            return jsonify({'message': 'Missing required fields'}), 400
        
        amount_requested = Decimal(str(data['amount']))
        
        if amount_requested <= 0:
            return jsonify({'message': 'Invalid amount'}), 400
        
        # Calculate available balance
        orders = Order.query.filter_by(seller_id=seller.id, status='delivered').all()
        total_earnings = sum(order.total_price for order in orders)
        
        withdrawals = Withdrawal.query.filter_by(seller_id=seller.id, status='processed').all()
        total_withdrawn = sum(w.amount_requested for w in withdrawals)
        
        available_balance = total_earnings - total_withdrawn
        
        if amount_requested > available_balance:
            return jsonify({'message': 'Insufficient balance'}), 400
        
        # Calculate platform fee (7%)
        platform_fee = amount_requested * Decimal('0.07')
        amount_paid = amount_requested - platform_fee
        
        withdrawal = Withdrawal(
            seller_id=seller.id,
            amount_requested=amount_requested,
            amount_paid=amount_paid,
            method=data['method']
        )
        
        db.session.add(withdrawal)
        db.session.commit()
        
        return jsonify({
            'message': 'Withdrawal request submitted successfully',
            'withdrawal': withdrawal.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@seller_bp.route('/verification', methods=['POST'])
@jwt_required()
def submit_verification():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller:
            return jsonify({'message': 'Seller profile not found'}), 404
        
        data = request.get_json()
        
        if 'documents' in data:
            seller.documents = data['documents']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Verification documents submitted successfully',
            'seller': seller.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
