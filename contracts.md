# Mercado Livre Clone - API Contracts

## Database: SQL Server AWS RDS
- Host: conscientizacao.ce9c4fz7dcpv.us-east-1.rds.amazonaws.com
- Port: 1433
- Database: Marketplace

## Tables Schema

### Users
- id (INT, PK, AUTO)
- name (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- password_hash (VARCHAR 255)
- location (VARCHAR 100)
- created_at (DATETIME)

### Categories
- id (INT, PK, AUTO)
- name (VARCHAR 50)
- slug (VARCHAR 50, UNIQUE)
- icon (VARCHAR 50)

### Products
- id (INT, PK, AUTO)
- title (VARCHAR 255)
- description (TEXT)
- price (DECIMAL 10,2)
- original_price (DECIMAL 10,2)
- discount (INT)
- installments (INT)
- image (VARCHAR 500)
- images (TEXT - JSON array)
- free_shipping (BIT)
- rating (DECIMAL 2,1)
- reviews_count (INT)
- sold (INT)
- category_id (INT, FK)
- condition (VARCHAR 20)
- brand (VARCHAR 50)
- stock (INT)
- seller_name (VARCHAR 100)
- seller_reputation (VARCHAR 50)
- seller_location (VARCHAR 100)
- specs (TEXT - JSON)
- created_at (DATETIME)

### Cart
- id (INT, PK, AUTO)
- user_id (INT, FK)
- product_id (INT, FK)
- quantity (INT)
- created_at (DATETIME)

### Orders
- id (INT, PK, AUTO)
- user_id (INT, FK)
- total (DECIMAL 10,2)
- status (VARCHAR 50)
- created_at (DATETIME)

### OrderItems
- id (INT, PK, AUTO)
- order_id (INT, FK)
- product_id (INT, FK)
- quantity (INT)
- price (DECIMAL 10,2)

### Reviews
- id (INT, PK, AUTO)
- product_id (INT, FK)
- user_id (INT, FK)
- rating (INT)
- comment (TEXT)
- created_at (DATETIME)

## API Endpoints

### Auth
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Products
- GET /api/products - List products (with filters)
- GET /api/products/{id} - Get product details
- GET /api/products/search - Search products

### Categories
- GET /api/categories - List all categories

### Cart
- GET /api/cart - Get user cart
- POST /api/cart - Add item to cart
- PUT /api/cart/{id} - Update cart item quantity
- DELETE /api/cart/{id} - Remove item from cart
- DELETE /api/cart - Clear cart

### Orders
- GET /api/orders - Get user orders
- POST /api/orders - Create order from cart
- GET /api/orders/{id} - Get order details

### Reviews
- GET /api/reviews/product/{id} - Get product reviews
- POST /api/reviews - Create review

## Frontend Integration
- Replace mock.js data with API calls
- Use axios for HTTP requests
- Store JWT token in localStorage
- Add loading states and error handling
