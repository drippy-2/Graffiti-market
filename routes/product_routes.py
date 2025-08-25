from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Product, Seller, Review, db
from auth import get_current_user
from sqlalchemy import or_

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        category = request.args.get('category')
        search = request.args.get('search')
        sort = request.args.get('sort', 'name')
        
        query = Product.query.join(Seller).filter(Seller.status == 'approved')
        
        # Filter by category
        if category:
            query = query.filter(Product.category == category)
        
        # Search by name or description
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%')
                )
            )
        
        # Sort products
        if sort == 'price_asc':
            query = query.order_by(Product.price.asc())
        elif sort == 'price_desc':
            query = query.order_by(Product.price.desc())
        elif sort == 'newest':
            query = query.order_by(Product.created_at.desc())
        else:
            query = query.order_by(Product.name)
        
        # Paginate results
        products = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'products': [product.to_dict() for product in products.items],
            'total': products.total,
            'pages': products.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@product_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        # Get product reviews
        reviews = Review.query.filter_by(product_id=product_id).all()
        
        product_data = product.to_dict()
        product_data['reviews'] = [review.to_dict() for review in reviews]
        
        return jsonify(product_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@product_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller or seller.status != 'approved':
            return jsonify({'message': 'Seller not approved'}), 403
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'description', 'price', 'stock', 'category']
        if not all(k in data for k in required_fields):
            return jsonify({'message': 'Missing required fields'}), 400
        
        product = Product(
            seller_id=seller.id,
            name=data['name'],
            description=data['description'],
            price=data['price'],
            stock=data['stock'],
            category=data['category'],
            image_url=data.get('imageUrl')
        )
        
        db.session.add(product)
        db.session.commit()
        
        return jsonify({
            'message': 'Product created successfully',
            'product': product.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@product_bp.route('/<product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller or product.seller_id != seller.id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update product fields
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'price' in data:
            product.price = data['price']
        if 'stock' in data:
            product.stock = data['stock']
        if 'category' in data:
            product.category = data['category']
        if 'imageUrl' in data:
            product.image_url = data['imageUrl']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': product.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@product_bp.route('/<product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    try:
        user = get_current_user()
        if not user or user.role != 'seller':
            return jsonify({'message': 'Unauthorized'}), 403
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        seller = Seller.query.filter_by(user_id=user.id).first()
        if not seller or product.seller_id != seller.id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    try:
        categories = db.session.query(Product.category).distinct().all()
        category_list = [cat[0] for cat in categories]
        
        return jsonify({'categories': category_list}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@product_bp.route('/<product_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(product_id):
    try:
        user = get_current_user()
        if not user:
            return jsonify({'message': 'Unauthorized'}), 403
        
        product = Product.query.get(product_id)
        if not product:
            return jsonify({'message': 'Product not found'}), 404
        
        data = request.get_json()
        
        if not all(k in data for k in ('rating', 'comment')):
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if user already reviewed this product
        existing_review = Review.query.filter_by(
            user_id=user.id,
            product_id=product_id
        ).first()
        
        if existing_review:
            return jsonify({'message': 'You have already reviewed this product'}), 400
        
        review = Review(
            user_id=user.id,
            product_id=product_id,
            rating=data['rating'],
            comment=data['comment']
        )
        
        db.session.add(review)
        db.session.commit()
        
        return jsonify({
            'message': 'Review added successfully',
            'review': review.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
