from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import User, Seller, Withdrawal, Order, Product, db
from auth import get_current_user
from datetime import datetime
from sqlalchemy import func

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Platform metrics
        total_users = User.query.count()
        total_sellers = Seller.query.count()
        active_sellers = Seller.query.filter_by(status='approved').count()
        pending_sellers = Seller.query.filter_by(status='pending').count()
        
        total_products = Product.query.count()
        total_orders = Order.query.count()
        
        # Revenue metrics
        total_sales = db.session.query(func.sum(Order.total_price)).filter(Order.status != 'cancelled').scalar() or 0
        processed_withdrawals = Withdrawal.query.filter_by(status='processed').all()
        platform_revenue = sum(float(w.amount_requested) * 0.07 for w in processed_withdrawals)
        
        # Pending approvals
        pending_seller_applications = Seller.query.filter_by(status='pending').all()
        pending_withdrawal_requests = Withdrawal.query.filter_by(status='pending').all()
        
        return jsonify({
            'metrics': {
                'totalUsers': total_users,
                'totalSellers': total_sellers,
                'activeSellers': active_sellers,
                'pendingSellers': pending_sellers,
                'totalProducts': total_products,
                'totalOrders': total_orders,
                'totalSales': float(total_sales),
                'platformRevenue': platform_revenue
            },
            'pendingApprovals': {
                'sellers': [seller.to_dict() for seller in pending_seller_applications],
                'withdrawals': [withdrawal.to_dict() for withdrawal in pending_withdrawal_requests]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/sellers', methods=['GET'])
@jwt_required()
def get_all_sellers():
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Seller.query
        
        if status:
            query = query.filter(Seller.status == status)
        
        sellers = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'sellers': [seller.to_dict() for seller in sellers.items],
            'total': sellers.total,
            'pages': sellers.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/sellers/<seller_id>/approve', methods=['PUT'])
@jwt_required()
def approve_seller(seller_id):
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.get(seller_id)
        if not seller:
            return jsonify({'message': 'Seller not found'}), 404
        
        seller.status = 'approved'
        seller.verified_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Seller approved successfully',
            'seller': seller.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/sellers/<seller_id>/reject', methods=['PUT'])
@jwt_required()
def reject_seller(seller_id):
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.get(seller_id)
        if not seller:
            return jsonify({'message': 'Seller not found'}), 404
        
        seller.status = 'rejected'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Seller rejected',
            'seller': seller.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/withdrawals', methods=['GET'])
@jwt_required()
def get_all_withdrawals():
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status')
        
        query = Withdrawal.query
        
        if status:
            query = query.filter(Withdrawal.status == status)
        
        withdrawals = query.order_by(Withdrawal.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'withdrawals': [withdrawal.to_dict() for withdrawal in withdrawals.items],
            'total': withdrawals.total,
            'pages': withdrawals.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/withdrawals/<withdrawal_id>/process', methods=['PUT'])
@jwt_required()
def process_withdrawal(withdrawal_id):
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        withdrawal = Withdrawal.query.get(withdrawal_id)
        if not withdrawal:
            return jsonify({'message': 'Withdrawal not found'}), 404
        
        data = request.get_json()
        
        withdrawal.status = 'processed'
        withdrawal.processed_at = datetime.utcnow()
        
        if 'transactionId' in data:
            withdrawal.transaction_id = data['transactionId']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Withdrawal processed successfully',
            'withdrawal': withdrawal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/withdrawals/<withdrawal_id>/reject', methods=['PUT'])
@jwt_required()
def reject_withdrawal(withdrawal_id):
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        withdrawal = Withdrawal.query.get(withdrawal_id)
        if not withdrawal:
            return jsonify({'message': 'Withdrawal not found'}), 404
        
        withdrawal.status = 'rejected'
        withdrawal.processed_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Withdrawal rejected',
            'withdrawal': withdrawal.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        user = get_current_user()
        if not user or user.role != 'admin':
            return jsonify({'message': 'Unauthorized'}), 403
        
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        role = request.args.get('role')
        
        query = User.query
        
        if role:
            query = query.filter(User.role == role)
        
        users = query.order_by(User.created_at.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500
