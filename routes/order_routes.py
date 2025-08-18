from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import Order, OrderItem, Product, CartItem, Seller, db
from auth import get_current_user
from datetime import datetime

order_bp = Blueprint('orders', __name__)

@order_bp.route('/cart', methods=['GET'])
@jwt_required()
def get_cart():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        cart_items = CartItem.query.filter_by(user_id=user.id).all()
        
        return jsonify({
            'items': [item.to_dict() for item in cart_items]
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@order_bp.route('/cart', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not all(k in data for k in ('productId', 'quantity')):
            return jsonify({'message': 'Missing required fields'}), 400
        
        product = Product.query.get(data['productId'])
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        if product.stock < data['quantity']:
            return jsonify({'message': 'Insufficient stock'}), 400
        
        # Check if item already in cart
        existing_item = CartItem.query.filter_by(
            user_id=user.id,
            product_id=data['productId']
        ).first()
        
        if existing_item:
            existing_item.quantity += data['quantity']
        else:
            cart_item = CartItem(
                user_id=user.id,
                product_id=data['productId'],
                quantity=data['quantity']
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Item added to cart'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@order_bp.route('/cart/<item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        cart_item = CartItem.query.filter_by(id=item_id, user_id=user.id).first()
        if not cart_item:
            return jsonify({'message': 'Cart item not found'}), 404
        
        data = request.get_json()
        
        if 'quantity' in data:
            if data['quantity'] <= 0:
                db.session.delete(cart_item)
            else:
                if cart_item.product.stock < data['quantity']:
                    return jsonify({'message': 'Insufficient stock'}), 400
                cart_item.quantity = data['quantity']
        
        db.session.commit()
        
        return jsonify({'message': 'Cart updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@order_bp.route('/cart/<item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        cart_item = CartItem.query.filter_by(id=item_id, user_id=user.id).first()
        if not cart_item:
            return jsonify({'message': 'Cart item not found'}), 404
        
        db.session.delete(cart_item)
        db.session.commit()
        
        return jsonify({'message': 'Item removed from cart'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@order_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not all(k in data for k in ('shippingAddress', 'method')):
            return jsonify({'message': 'Missing required fields'}), 400
        
        cart_items = CartItem.query.filter_by(user_id=user.id).all()
        if not cart_items:
            return jsonify({'message': 'Cart is empty'}), 400
        
        # Group cart items by seller
        orders_by_seller = {}
        for item in cart_items:
            seller_id = item.product.seller_id
            if seller_id not in orders_by_seller:
                orders_by_seller[seller_id] = []
            orders_by_seller[seller_id].append(item)
        
        created_orders = []
        
        # Create separate orders for each seller
        for seller_id, items in orders_by_seller.items():
            total_price = sum(item.quantity * item.product.price for item in items)
            
            order = Order(
                buyer_id=user.id,
                seller_id=seller_id,
                total_price=total_price,
                shipping_address=data['shippingAddress'],
                method=data['method']
            )
            
            db.session.add(order)
            db.session.flush()  # Get order ID
            
            # Create order items
            for item in items:
                # Check stock again
                if item.product.stock < item.quantity:
                    db.session.rollback()
                    return jsonify({
                        'message': f'Insufficient stock for {item.product.name}'
                    }), 400
                
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.product.price
                )
                db.session.add(order_item)
                
                # Update product stock
                item.product.stock -= item.quantity
                
                # Remove from cart
                db.session.delete(item)
            
            created_orders.append(order)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Orders created successfully',
            'orders': [order.to_dict() for order in created_orders]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@order_bp.route('/', methods=['GET'])
@jwt_required()
def get_orders():
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        if user.role == 'buyer':
            orders = Order.query.filter_by(buyer_id=user.id).order_by(Order.created_at.desc()).all()
        elif user.role == 'seller':
            seller = Seller.query.filter_by(user_id=user.id).first()
            if not seller:
                return jsonify({'orders': []}), 200
            orders = Order.query.filter_by(seller_id=seller.id).order_by(Order.created_at.desc()).all()
        else:
            orders = Order.query.order_by(Order.created_at.desc()).all()
        
        return jsonify({
            'orders': [order.to_dict() for order in orders]
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@order_bp.route('/<order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404
        
        # Check permissions
        if user.role == 'buyer' and order.buyer_id != user.id:
            return jsonify({'message': 'Unauthorized'}), 403
        elif user.role == 'seller':
            seller = Seller.query.filter_by(user_id=user.id).first()
            if not seller or order.seller_id != seller.id:
                return jsonify({'message': 'Unauthorized'}), 403
        
        return jsonify(order.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@order_bp.route('/<order_id>/status', methods=['PUT'])
@jwt_required()
def update_order_status(order_id):
    try:
        user = get_current_user()
        if not user or user.role not in ['seller', 'admin']:
            return jsonify({'message': 'Unauthorized'}), 403
        
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404
        
        # Check seller permissions
        if user.role == 'seller':
            seller = Seller.query.filter_by(user_id=user.id).first()
            if not seller or order.seller_id != seller.id:
                return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'status' in data:
            order.status = data['status']
        if 'carrier' in data:
            order.carrier = data['carrier']
        if 'trackingNumber' in data:
            order.tracking_number = data['trackingNumber']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Order updated successfully',
            'order': order.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
