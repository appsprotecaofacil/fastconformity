from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import pymssql
import json
from datetime import datetime
import bcrypt

# Admin Router
admin_router = APIRouter(prefix="/api/admin", tags=["admin"])

# SQL Server Configuration
SQL_SERVER = 'conscientizacao.ce9c4fz7dcpv.us-east-1.rds.amazonaws.com'
SQL_PORT = 1433
SQL_USER = 'admin'
SQL_PASSWORD = '23069981con'
SQL_DATABASE = 'Marketplace'

def get_db_connection():
    return pymssql.connect(
        server=SQL_SERVER,
        port=SQL_PORT,
        user=SQL_USER,
        password=SQL_PASSWORD,
        database=SQL_DATABASE
    )

# Pydantic Models
class AdminLogin(BaseModel):
    email: str
    password: str

class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    discount: Optional[int] = 0
    installments: Optional[int] = 12
    image: str
    images: Optional[List[str]] = []
    free_shipping: Optional[bool] = True
    category_id: int
    condition: Optional[str] = "novo"
    brand: Optional[str] = None
    stock: Optional[int] = 0
    seller_name: Optional[str] = "Loja Oficial"
    seller_reputation: Optional[str] = "MercadoLíder"
    seller_location: Optional[str] = "São Paulo"
    specs: Optional[List[dict]] = []

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    original_price: Optional[float] = None
    discount: Optional[int] = None
    installments: Optional[int] = None
    image: Optional[str] = None
    images: Optional[List[str]] = None
    free_shipping: Optional[bool] = None
    category_id: Optional[int] = None
    condition: Optional[str] = None
    brand: Optional[str] = None
    stock: Optional[int] = None
    seller_name: Optional[str] = None
    seller_reputation: Optional[str] = None
    seller_location: Optional[str] = None
    specs: Optional[List[dict]] = None

class CategoryCreate(BaseModel):
    name: str
    slug: str
    icon: Optional[str] = "Package"
    parent_id: Optional[int] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    icon: Optional[str] = None
    parent_id: Optional[int] = None

class OrderStatusUpdate(BaseModel):
    status: str

class AdminCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "admin"

# Initialize admin table
def init_admin_table():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Admins' AND xtype='U')
            CREATE TABLE Admins (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                email NVARCHAR(100) UNIQUE NOT NULL,
                password_hash NVARCHAR(255) NOT NULL,
                role NVARCHAR(50) DEFAULT 'admin',
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create default admin if not exists
        cursor.execute("SELECT COUNT(*) FROM Admins WHERE email = 'admin@mercadolivre.com'")
        if cursor.fetchone()[0] == 0:
            hashed = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cursor.execute(
                "INSERT INTO Admins (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
                ('Administrador', 'admin@mercadolivre.com', hashed, 'super_admin')
            )
        conn.commit()
    except Exception as e:
        print(f"Error initializing admin table: {e}")
    finally:
        cursor.close()
        conn.close()

# Dashboard Stats
@admin_router.get("/dashboard/stats")
async def get_dashboard_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        stats = {}
        
        # Total products
        cursor.execute("SELECT COUNT(*) FROM Products")
        stats["total_products"] = cursor.fetchone()[0]
        
        # Total users
        cursor.execute("SELECT COUNT(*) FROM Users")
        stats["total_users"] = cursor.fetchone()[0]
        
        # Total orders
        cursor.execute("SELECT COUNT(*) FROM Orders")
        stats["total_orders"] = cursor.fetchone()[0]
        
        # Total revenue
        cursor.execute("SELECT ISNULL(SUM(total), 0) FROM Orders")
        stats["total_revenue"] = float(cursor.fetchone()[0])
        
        # Orders by status
        cursor.execute("""
            SELECT status, COUNT(*) as count 
            FROM Orders 
            GROUP BY status
        """)
        stats["orders_by_status"] = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Recent orders
        cursor.execute("""
            SELECT TOP 5 o.id, o.total, o.status, o.created_at, u.name as user_name
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        """)
        stats["recent_orders"] = [{
            "id": row[0],
            "total": float(row[1]),
            "status": row[2],
            "date": row[3].isoformat() if row[3] else None,
            "user": row[4]
        } for row in cursor.fetchall()]
        
        # Top selling products
        cursor.execute("""
            SELECT TOP 5 p.id, p.title, p.sold, p.price, p.image
            FROM Products p
            ORDER BY p.sold DESC
        """)
        stats["top_products"] = [{
            "id": row[0],
            "title": row[1],
            "sold": row[2],
            "price": float(row[3]),
            "image": row[4]
        } for row in cursor.fetchall()]
        
        # Products with low stock
        cursor.execute("""
            SELECT TOP 5 id, title, stock, image
            FROM Products
            WHERE stock <= 5
            ORDER BY stock ASC
        """)
        stats["low_stock"] = [{
            "id": row[0],
            "title": row[1],
            "stock": row[2],
            "image": row[3]
        } for row in cursor.fetchall()]
        
        # Categories with product count
        cursor.execute("""
            SELECT c.id, c.name, COUNT(p.id) as product_count
            FROM Categories c
            LEFT JOIN Products p ON c.id = p.category_id
            GROUP BY c.id, c.name
            ORDER BY product_count DESC
        """)
        stats["categories"] = [{
            "id": row[0],
            "name": row[1],
            "count": row[2]
        } for row in cursor.fetchall()]
        
        return stats
    finally:
        cursor.close()
        conn.close()

# Admin Authentication
@admin_router.post("/login")
async def admin_login(credentials: AdminLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, name, email, password_hash, role FROM Admins WHERE email = %s",
            (credentials.email,)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        if not bcrypt.checkpw(credentials.password.encode('utf-8'), row[3].encode('utf-8')):
            raise HTTPException(status_code=401, detail="Credenciais inválidas")
        
        return {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[4]
        }
    finally:
        cursor.close()
        conn.close()

# Products CRUD
@admin_router.get("/products")
async def list_products(search: Optional[str] = None, category_id: Optional[int] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT p.id, p.title, p.price, p.stock, p.sold, p.image, c.name as category, p.created_at
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE 1=1
        """
        params = []
        
        if search:
            query += " AND (p.title LIKE %s OR p.brand LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        if category_id:
            query += " AND p.category_id = %s"
            params.append(category_id)
        
        query += " ORDER BY p.created_at DESC"
        
        cursor.execute(query, params)
        products = [{
            "id": row[0],
            "title": row[1],
            "price": float(row[2]),
            "stock": row[3],
            "sold": row[4],
            "image": row[5],
            "category": row[6],
            "created_at": row[7].isoformat() if row[7] else None
        } for row in cursor.fetchall()]
        
        return products
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/products/{product_id}")
async def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.*, c.name as category_name
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE p.id = %s
        """, (product_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        return {
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "price": float(row[3]),
            "original_price": float(row[4]) if row[4] else None,
            "discount": row[5],
            "installments": row[6],
            "image": row[7],
            "images": json.loads(row[8]) if row[8] else [],
            "free_shipping": bool(row[9]),
            "rating": float(row[10]) if row[10] else None,
            "reviews_count": row[11],
            "sold": row[12],
            "category_id": row[13],
            "condition": row[14],
            "brand": row[15],
            "stock": row[16],
            "seller_name": row[17],
            "seller_reputation": row[18],
            "seller_location": row[19],
            "specs": json.loads(row[20]) if row[20] else [],
            "created_at": row[21].isoformat() if row[21] else None,
            "category_name": row[22]
        }
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/products")
async def create_product(product: ProductCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO Products (title, description, price, original_price, discount, installments, 
                image, images, free_shipping, category_id, condition, brand, stock, 
                seller_name, seller_reputation, seller_location, specs, rating, reviews_count, sold)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0, 0)
        """, (
            product.title, product.description, product.price, product.original_price,
            product.discount, product.installments, product.image, json.dumps(product.images),
            product.free_shipping, product.category_id, product.condition, product.brand,
            product.stock, product.seller_name, product.seller_reputation, product.seller_location,
            json.dumps(product.specs)
        ))
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Produto criado com sucesso", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/products/{product_id}")
async def update_product(product_id: int, product: ProductUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        
        if product.title is not None:
            updates.append("title = %s")
            params.append(product.title)
        if product.description is not None:
            updates.append("description = %s")
            params.append(product.description)
        if product.price is not None:
            updates.append("price = %s")
            params.append(product.price)
        if product.original_price is not None:
            updates.append("original_price = %s")
            params.append(product.original_price)
        if product.discount is not None:
            updates.append("discount = %s")
            params.append(product.discount)
        if product.installments is not None:
            updates.append("installments = %s")
            params.append(product.installments)
        if product.image is not None:
            updates.append("image = %s")
            params.append(product.image)
        if product.images is not None:
            updates.append("images = %s")
            params.append(json.dumps(product.images))
        if product.free_shipping is not None:
            updates.append("free_shipping = %s")
            params.append(product.free_shipping)
        if product.category_id is not None:
            updates.append("category_id = %s")
            params.append(product.category_id)
        if product.condition is not None:
            updates.append("condition = %s")
            params.append(product.condition)
        if product.brand is not None:
            updates.append("brand = %s")
            params.append(product.brand)
        if product.stock is not None:
            updates.append("stock = %s")
            params.append(product.stock)
        if product.seller_name is not None:
            updates.append("seller_name = %s")
            params.append(product.seller_name)
        if product.seller_reputation is not None:
            updates.append("seller_reputation = %s")
            params.append(product.seller_reputation)
        if product.seller_location is not None:
            updates.append("seller_location = %s")
            params.append(product.seller_location)
        if product.specs is not None:
            updates.append("specs = %s")
            params.append(json.dumps(product.specs))
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
        
        params.append(product_id)
        query = f"UPDATE Products SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, params)
        conn.commit()
        
        return {"message": "Produto atualizado com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/products/{product_id}")
async def delete_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if product exists
        cursor.execute("SELECT id FROM Products WHERE id = %s", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        # Delete related records first
        cursor.execute("DELETE FROM Reviews WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM Cart WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM OrderItems WHERE product_id = %s", (product_id,))
        cursor.execute("DELETE FROM Products WHERE id = %s", (product_id,))
        conn.commit()
        
        return {"message": "Produto excluído com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Categories CRUD
@admin_router.get("/categories")
async def list_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.name, c.slug, c.icon, c.parent_id, 
                   COUNT(p.id) as product_count,
                   pc.name as parent_name
            FROM Categories c
            LEFT JOIN Products p ON c.id = p.category_id
            LEFT JOIN Categories pc ON c.parent_id = pc.id
            GROUP BY c.id, c.name, c.slug, c.icon, c.parent_id, pc.name
            ORDER BY COALESCE(c.parent_id, c.id), c.parent_id, c.name
        """)
        return [{
            "id": row[0],
            "name": row[1],
            "slug": row[2],
            "icon": row[3],
            "parent_id": row[4],
            "product_count": row[5],
            "parent_name": row[6]
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/categories/tree")
async def get_categories_tree():
    """Returns categories organized in a hierarchical tree structure"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.name, c.slug, c.icon, c.parent_id, 
                   COUNT(p.id) as product_count
            FROM Categories c
            LEFT JOIN Products p ON c.id = p.category_id
            GROUP BY c.id, c.name, c.slug, c.icon, c.parent_id
            ORDER BY c.name
        """)
        
        all_categories = [{
            "id": row[0],
            "name": row[1],
            "slug": row[2],
            "icon": row[3],
            "parent_id": row[4],
            "product_count": row[5],
            "children": []
        } for row in cursor.fetchall()]
        
        # Build tree structure
        categories_dict = {cat["id"]: cat for cat in all_categories}
        root_categories = []
        
        for cat in all_categories:
            if cat["parent_id"] is None:
                root_categories.append(cat)
            else:
                parent = categories_dict.get(cat["parent_id"])
                if parent:
                    parent["children"].append(cat)
        
        return root_categories
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/categories/parents")
async def get_parent_categories():
    """Returns only root categories (for parent selection dropdown)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, name, slug, icon
            FROM Categories
            WHERE parent_id IS NULL
            ORDER BY name
        """)
        return [{
            "id": row[0],
            "name": row[1],
            "slug": row[2],
            "icon": row[3]
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/categories")
async def create_category(category: CategoryCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Validate parent_id if provided
        if category.parent_id:
            cursor.execute("SELECT id FROM Categories WHERE id = %s", (category.parent_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Categoria pai não encontrada")
        
        cursor.execute(
            "INSERT INTO Categories (name, slug, icon, parent_id) VALUES (%s, %s, %s, %s)",
            (category.name, category.slug, category.icon, category.parent_id)
        )
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Categoria criada com sucesso", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/categories/{category_id}")
async def update_category(category_id: int, category: CategoryUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        
        if category.name is not None:
            updates.append("name = %s")
            params.append(category.name)
        if category.slug is not None:
            updates.append("slug = %s")
            params.append(category.slug)
        if category.icon is not None:
            updates.append("icon = %s")
            params.append(category.icon)
        if category.parent_id is not None:
            # Prevent circular reference
            if category.parent_id == category_id:
                raise HTTPException(status_code=400, detail="Uma categoria não pode ser pai de si mesma")
            # Check if parent exists
            if category.parent_id > 0:
                cursor.execute("SELECT id FROM Categories WHERE id = %s", (category.parent_id,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=400, detail="Categoria pai não encontrada")
            updates.append("parent_id = %s")
            params.append(category.parent_id if category.parent_id > 0 else None)
        
        if not updates:
            raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
        
        params.append(category_id)
        query = f"UPDATE Categories SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, params)
        conn.commit()
        
        return {"message": "Categoria atualizada com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/categories/{category_id}")
async def delete_category(category_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if category has products
        cursor.execute("SELECT COUNT(*) FROM Products WHERE category_id = %s", (category_id,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Categoria possui produtos associados")
        
        # Check if category has children
        cursor.execute("SELECT COUNT(*) FROM Categories WHERE parent_id = %s", (category_id,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Categoria possui subcategorias associadas. Exclua as subcategorias primeiro.")
        
        cursor.execute("DELETE FROM Categories WHERE id = %s", (category_id,))
        conn.commit()
        
        return {"message": "Categoria excluída com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Users Management
@admin_router.get("/users")
async def list_users(search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT u.id, u.name, u.email, u.location, u.created_at,
                   (SELECT COUNT(*) FROM Orders WHERE user_id = u.id) as orders_count,
                   (SELECT ISNULL(SUM(total), 0) FROM Orders WHERE user_id = u.id) as total_spent
            FROM Users u
            WHERE 1=1
        """
        params = []
        
        if search:
            query += " AND (u.name LIKE %s OR u.email LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY u.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "location": row[3],
            "created_at": row[4].isoformat() if row[4] else None,
            "orders_count": row[5],
            "total_spent": float(row[6])
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/users/{user_id}")
async def get_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, name, email, location, created_at
            FROM Users WHERE id = %s
        """, (user_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        user = {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "location": row[3],
            "created_at": row[4].isoformat() if row[4] else None
        }
        
        # Get user orders
        cursor.execute("""
            SELECT o.id, o.total, o.status, o.created_at
            FROM Orders o
            WHERE o.user_id = %s
            ORDER BY o.created_at DESC
        """, (user_id,))
        user["orders"] = [{
            "id": r[0],
            "total": float(r[1]),
            "status": r[2],
            "date": r[3].isoformat() if r[3] else None
        } for r in cursor.fetchall()]
        
        return user
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/users/{user_id}")
async def delete_user(user_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Reviews WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM Cart WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM OrderItems WHERE order_id IN (SELECT id FROM Orders WHERE user_id = %s)", (user_id,))
        cursor.execute("DELETE FROM Orders WHERE user_id = %s", (user_id,))
        cursor.execute("DELETE FROM Users WHERE id = %s", (user_id,))
        conn.commit()
        
        return {"message": "Usuário excluído com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Orders Management
@admin_router.get("/orders")
async def list_orders(status: Optional[str] = None, search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT o.id, o.total, o.status, o.created_at, u.name as user_name, u.email
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND o.status = %s"
            params.append(status)
        
        if search:
            query += " AND (u.name LIKE %s OR u.email LIKE %s OR CAST(o.id AS NVARCHAR) LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY o.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": row[0],
            "total": float(row[1]),
            "status": row[2],
            "date": row[3].isoformat() if row[3] else None,
            "user_name": row[4],
            "user_email": row[5]
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/orders/{order_id}")
async def get_order(order_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT o.id, o.total, o.status, o.created_at, u.id, u.name, u.email
            FROM Orders o
            JOIN Users u ON o.user_id = u.id
            WHERE o.id = %s
        """, (order_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Pedido não encontrado")
        
        order = {
            "id": row[0],
            "total": float(row[1]),
            "status": row[2],
            "date": row[3].isoformat() if row[3] else None,
            "user": {
                "id": row[4],
                "name": row[5],
                "email": row[6]
            }
        }
        
        # Get order items
        cursor.execute("""
            SELECT oi.product_id, oi.quantity, oi.price, p.title, p.image
            FROM OrderItems oi
            JOIN Products p ON oi.product_id = p.id
            WHERE oi.order_id = %s
        """, (order_id,))
        order["items"] = [{
            "product_id": r[0],
            "quantity": r[1],
            "price": float(r[2]),
            "title": r[3],
            "image": r[4]
        } for r in cursor.fetchall()]
        
        return order
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: int, data: OrderStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        valid_statuses = ["Processando", "Em trânsito", "Entregue", "Cancelado"]
        if data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status inválido. Use: {', '.join(valid_statuses)}")
        
        cursor.execute("UPDATE Orders SET status = %s WHERE id = %s", (data.status, order_id))
        conn.commit()
        
        return {"message": "Status atualizado com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Reviews Management
@admin_router.get("/reviews")
async def list_reviews(product_id: Optional[int] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT r.id, r.rating, r.comment, r.created_at, 
                   u.name as user_name, p.title as product_title, p.id as product_id
            FROM Reviews r
            JOIN Users u ON r.user_id = u.id
            JOIN Products p ON r.product_id = p.id
            WHERE 1=1
        """
        params = []
        
        if product_id:
            query += " AND r.product_id = %s"
            params.append(product_id)
        
        query += " ORDER BY r.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": row[0],
            "rating": row[1],
            "comment": row[2],
            "date": row[3].isoformat() if row[3] else None,
            "user_name": row[4],
            "product_title": row[5],
            "product_id": row[6]
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/reviews/{review_id}")
async def delete_review(review_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Reviews WHERE id = %s", (review_id,))
        conn.commit()
        return {"message": "Avaliação excluída com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Admin Users Management
@admin_router.get("/admins")
async def list_admins():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, email, role, created_at FROM Admins ORDER BY created_at DESC")
        return [{
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "role": row[3],
            "created_at": row[4].isoformat() if row[4] else None
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/admins")
async def create_admin(admin: AdminCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM Admins WHERE email = %s", (admin.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        hashed = bcrypt.hashpw(admin.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute(
            "INSERT INTO Admins (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
            (admin.name, admin.email, hashed, admin.role)
        )
        conn.commit()
        
        return {"message": "Administrador criado com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/admins/{admin_id}")
async def delete_admin(admin_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT role FROM Admins WHERE id = %s", (admin_id,))
        row = cursor.fetchone()
        if row and row[0] == 'super_admin':
            raise HTTPException(status_code=400, detail="Não é possível excluir o super admin")
        
        cursor.execute("DELETE FROM Admins WHERE id = %s", (admin_id,))
        conn.commit()
        
        return {"message": "Administrador excluído com sucesso"}
    finally:
        cursor.close()
        conn.close()
