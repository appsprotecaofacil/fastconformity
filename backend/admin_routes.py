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
    action_type: Optional[str] = "buy"  # buy, whatsapp, quote
    whatsapp_number: Optional[str] = None
    display_overrides: Optional[dict] = None

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
    action_type: Optional[str] = None
    whatsapp_number: Optional[str] = None
    display_overrides: Optional[dict] = None

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

class QuoteStatusUpdate(BaseModel):
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
            SELECT p.id, p.title, p.price, p.stock, p.sold, p.image, c.name as category, 
                   p.created_at, p.action_type, p.whatsapp_number
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
            "created_at": row[7].isoformat() if row[7] else None,
            "action_type": row[8] or 'buy',
            "whatsapp_number": row[9]
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
            "action_type": row[21] or 'buy',
            "whatsapp_number": row[22],
            "created_at": row[23].isoformat() if row[23] else None,
            "category_name": row[24]
        }
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/products")
async def create_product(product: ProductCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        display_overrides_json = json.dumps(product.display_overrides) if product.display_overrides else None
        cursor.execute("""
            INSERT INTO Products (title, description, price, original_price, discount, installments, 
                image, images, free_shipping, category_id, condition, brand, stock, 
                seller_name, seller_reputation, seller_location, specs, action_type, whatsapp_number,
                display_overrides, rating, reviews_count, sold)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0, 0, 0)
        """, (
            product.title, product.description, product.price, product.original_price,
            product.discount, product.installments, product.image, json.dumps(product.images),
            product.free_shipping, product.category_id, product.condition, product.brand,
            product.stock, product.seller_name, product.seller_reputation, product.seller_location,
            json.dumps(product.specs), product.action_type, product.whatsapp_number, display_overrides_json
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
        if product.action_type is not None:
            updates.append("action_type = %s")
            params.append(product.action_type)
        if product.whatsapp_number is not None:
            updates.append("whatsapp_number = %s")
            params.append(product.whatsapp_number if product.whatsapp_number else None)
        
        # Always update display_overrides (can be null to reset to global)
        updates.append("display_overrides = %s")
        params.append(json.dumps(product.display_overrides) if product.display_overrides else None)
        
        if len(updates) == 1 and 'display_overrides' in updates[0]:
            # Only display_overrides update is ok
            pass
        elif not updates:
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

# Quotes Management
@admin_router.get("/quotes")
async def list_quotes(status: Optional[str] = None, search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT q.id, q.product_id, p.title as product_title, p.image as product_image,
                   q.customer_name, q.customer_email, q.customer_phone, q.message, 
                   q.status, q.created_at
            FROM Quotes q
            JOIN Products p ON q.product_id = p.id
            WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND q.status = %s"
            params.append(status)
        
        if search:
            query += " AND (q.customer_name LIKE %s OR q.customer_email LIKE %s OR p.title LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY q.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": row[0],
            "product_id": row[1],
            "product_title": row[2],
            "product_image": row[3],
            "customer_name": row[4],
            "customer_email": row[5],
            "customer_phone": row[6],
            "message": row[7],
            "status": row[8],
            "created_at": row[9].isoformat() if row[9] else None
        } for row in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/quotes/stats")
async def get_quotes_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        stats = {}
        
        cursor.execute("SELECT COUNT(*) FROM Quotes")
        stats["total"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Quotes WHERE status = 'pending'")
        stats["pending"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Quotes WHERE status = 'contacted'")
        stats["contacted"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Quotes WHERE status = 'converted'")
        stats["converted"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM Quotes WHERE status = 'closed'")
        stats["closed"] = cursor.fetchone()[0]
        
        return stats
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/quotes/{quote_id}/status")
async def update_quote_status(quote_id: int, data: QuoteStatusUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        valid_statuses = ["pending", "contacted", "converted", "closed"]
        if data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status inválido. Use: {', '.join(valid_statuses)}")
        
        cursor.execute("UPDATE Quotes SET status = %s WHERE id = %s", (data.status, quote_id))
        conn.commit()
        
        return {"message": "Status atualizado com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Quotes WHERE id = %s", (quote_id,))
        conn.commit()
        return {"message": "Cotação excluída com sucesso"}
    finally:
        cursor.close()
        conn.close()

# ==================== BLOG ADMIN ROUTES ====================

# Blog Categories
@admin_router.get("/blog/categories")
async def list_blog_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.name, c.slug, c.description,
                   (SELECT COUNT(*) FROM BlogPosts WHERE category_id = c.id) as post_count
            FROM BlogCategories c
            ORDER BY c.name
        """)
        return [{
            "id": r[0],
            "name": r[1],
            "slug": r[2],
            "description": r[3],
            "postCount": r[4]
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

class BlogCategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None

@admin_router.post("/blog/categories")
async def create_blog_category(category: BlogCategoryCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO BlogCategories (name, slug, description) VALUES (%s, %s, %s)",
            (category.name, category.slug, category.description)
        )
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Categoria criada com sucesso", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/blog/categories/{category_id}")
async def update_blog_category(category_id: int, category: BlogCategoryCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE BlogCategories SET name = %s, slug = %s, description = %s WHERE id = %s",
            (category.name, category.slug, category.description, category_id)
        )
        conn.commit()
        return {"message": "Categoria atualizada com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/blog/categories/{category_id}")
async def delete_blog_category(category_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if category has posts
        cursor.execute("SELECT COUNT(*) FROM BlogPosts WHERE category_id = %s", (category_id,))
        if cursor.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="Categoria possui posts associados")
        
        cursor.execute("DELETE FROM BlogCategories WHERE id = %s", (category_id,))
        conn.commit()
        return {"message": "Categoria excluída com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Blog Posts
@admin_router.get("/blog/posts")
async def list_blog_posts(status: Optional[str] = None, search: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, p.status,
                   p.author_name, p.published_at, p.views_count, p.allow_comments,
                   c.name as category_name
            FROM BlogPosts p
            LEFT JOIN BlogCategories c ON p.category_id = c.id
            WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND p.status = %s"
            params.append(status)
        
        if search:
            query += " AND (p.title LIKE %s OR p.excerpt LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY p.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": r[0],
            "title": r[1],
            "slug": r[2],
            "excerpt": r[3],
            "coverImage": r[4],
            "status": r[5],
            "author": r[6],
            "publishedAt": r[7].isoformat() if r[7] else None,
            "views": r[8],
            "allowComments": bool(r[9]),
            "category": r[10]
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/blog/posts/{post_id}")
async def get_blog_post_admin(post_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image,
                   p.category_id, p.author_name, p.status, p.allow_comments,
                   p.published_at, p.created_at
            FROM BlogPosts p
            WHERE p.id = %s
        """, (post_id,))
        r = cursor.fetchone()
        
        if not r:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        # Get related products
        cursor.execute("""
            SELECT product_id FROM BlogPostProducts WHERE post_id = %s
        """, (post_id,))
        product_ids = [row[0] for row in cursor.fetchall()]
        
        return {
            "id": r[0],
            "title": r[1],
            "slug": r[2],
            "excerpt": r[3],
            "content": r[4],
            "coverImage": r[5],
            "categoryId": r[6],
            "author": r[7],
            "status": r[8],
            "allowComments": bool(r[9]),
            "publishedAt": r[10].isoformat() if r[10] else None,
            "createdAt": r[11].isoformat() if r[11] else None,
            "productIds": product_ids
        }
    finally:
        cursor.close()
        conn.close()

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    author_name: str
    status: str = "draft"
    allow_comments: bool = True
    product_ids: Optional[List[int]] = []

@admin_router.post("/blog/posts")
async def create_blog_post(post: BlogPostCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if post.status == 'published':
            cursor.execute("""
                INSERT INTO BlogPosts (title, slug, excerpt, content, cover_image, category_id, 
                                       author_name, status, allow_comments, published_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, GETDATE())
            """, (
                post.title, post.slug, post.excerpt, post.content, post.cover_image,
                post.category_id, post.author_name, post.status, post.allow_comments
            ))
        else:
            cursor.execute("""
                INSERT INTO BlogPosts (title, slug, excerpt, content, cover_image, category_id, 
                                       author_name, status, allow_comments)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                post.title, post.slug, post.excerpt, post.content, post.cover_image,
                post.category_id, post.author_name, post.status, post.allow_comments
            ))
        
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        
        # Add related products
        if post.product_ids:
            for product_id in post.product_ids:
                cursor.execute(
                    "INSERT INTO BlogPostProducts (post_id, product_id) VALUES (%s, %s)",
                    (new_id, product_id)
                )
            conn.commit()
        
        return {"message": "Post criado com sucesso", "id": new_id}
    finally:
        cursor.close()
        conn.close()

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    category_id: Optional[int] = None
    author_name: Optional[str] = None
    status: Optional[str] = None
    allow_comments: Optional[bool] = None
    product_ids: Optional[List[int]] = None

@admin_router.put("/blog/posts/{post_id}")
async def update_blog_post(post_id: int, post: BlogPostUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        
        if post.title is not None:
            updates.append("title = %s")
            params.append(post.title)
        if post.slug is not None:
            updates.append("slug = %s")
            params.append(post.slug)
        if post.excerpt is not None:
            updates.append("excerpt = %s")
            params.append(post.excerpt)
        if post.content is not None:
            updates.append("content = %s")
            params.append(post.content)
        if post.cover_image is not None:
            updates.append("cover_image = %s")
            params.append(post.cover_image)
        if post.category_id is not None:
            updates.append("category_id = %s")
            params.append(post.category_id)
        if post.author_name is not None:
            updates.append("author_name = %s")
            params.append(post.author_name)
        if post.status is not None:
            updates.append("status = %s")
            params.append(post.status)
            if post.status == "published":
                updates.append("published_at = GETDATE()")
        if post.allow_comments is not None:
            updates.append("allow_comments = %s")
            params.append(post.allow_comments)
        
        updates.append("updated_at = GETDATE()")
        
        if updates:
            params.append(post_id)
            query = f"UPDATE BlogPosts SET {', '.join(updates)} WHERE id = %s"
            cursor.execute(query, params)
        
        # Update related products
        if post.product_ids is not None:
            cursor.execute("DELETE FROM BlogPostProducts WHERE post_id = %s", (post_id,))
            for product_id in post.product_ids:
                cursor.execute(
                    "INSERT INTO BlogPostProducts (post_id, product_id) VALUES (%s, %s)",
                    (post_id, product_id)
                )
        
        conn.commit()
        return {"message": "Post atualizado com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/blog/posts/{post_id}")
async def delete_blog_post(post_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM BlogPosts WHERE id = %s", (post_id,))
        conn.commit()
        return {"message": "Post excluído com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Blog Comments Admin
@admin_router.get("/blog/comments")
async def list_blog_comments(status: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT c.id, c.author_name, c.author_email, c.content, c.status, c.created_at,
                   p.title as post_title, p.slug as post_slug
            FROM BlogComments c
            INNER JOIN BlogPosts p ON c.post_id = p.id
            WHERE 1=1
        """
        params = []
        
        if status:
            query += " AND c.status = %s"
            params.append(status)
        
        query += " ORDER BY c.created_at DESC"
        
        cursor.execute(query, params)
        return [{
            "id": r[0],
            "author": r[1],
            "email": r[2],
            "content": r[3],
            "status": r[4],
            "createdAt": r[5].isoformat() if r[5] else None,
            "postTitle": r[6],
            "postSlug": r[7]
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/blog/comments/{comment_id}/status")
async def update_comment_status(comment_id: int, status: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if status not in ["pending", "approved", "rejected"]:
            raise HTTPException(status_code=400, detail="Status inválido")
        
        cursor.execute("UPDATE BlogComments SET status = %s WHERE id = %s", (status, comment_id))
        conn.commit()
        return {"message": "Status atualizado com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/blog/comments/{comment_id}")
async def delete_blog_comment(comment_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM BlogComments WHERE id = %s", (comment_id,))
        conn.commit()
        return {"message": "Comentário excluído com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/blog/stats")
async def get_blog_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        stats = {}
        
        cursor.execute("SELECT COUNT(*) FROM BlogPosts")
        stats["totalPosts"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM BlogPosts WHERE status = 'published'")
        stats["publishedPosts"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM BlogPosts WHERE status = 'draft'")
        stats["draftPosts"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COALESCE(SUM(views_count), 0) FROM BlogPosts")
        stats["totalViews"] = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM BlogComments WHERE status = 'pending'")
        stats["pendingComments"] = cursor.fetchone()[0]
        
        return stats
    finally:
        cursor.close()
        conn.close()



# ==================== DISPLAY SETTINGS ====================

class DisplaySettingUpdate(BaseModel):
    setting_key: str
    setting_value: bool

class DisplaySettingsUpdate(BaseModel):
    settings: List[DisplaySettingUpdate]

@admin_router.get("/display-settings")
async def get_display_settings():
    """Get all product display settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT setting_key, setting_value, setting_label, setting_group, sort_order
            FROM ProductDisplaySettings
            ORDER BY sort_order
        """)
        
        settings = {}
        groups = {}
        
        for row in cursor.fetchall():
            key, value, label, group, sort_order = row
            settings[key] = bool(value)
            
            if group not in groups:
                groups[group] = []
            groups[group].append({
                "key": key,
                "value": bool(value),
                "label": label,
                "sortOrder": sort_order
            })
        
        return {
            "settings": settings,
            "groups": groups
        }
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/display-settings")
async def update_display_settings(data: DisplaySettingsUpdate):
    """Update product display settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for setting in data.settings:
            cursor.execute("""
                UPDATE ProductDisplaySettings 
                SET setting_value = %s, updated_at = GETDATE()
                WHERE setting_key = %s
            """, (1 if setting.setting_value else 0, setting.setting_key))
        
        conn.commit()
        return {"message": "Configurações atualizadas com sucesso"}
    finally:
        cursor.close()
        conn.close()

@admin_router.get("/display-settings/product/{product_id}")
async def get_product_display_overrides(product_id: int):
    """Get display overrides for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT display_overrides FROM Products WHERE id = %s", (product_id,))
        row = cursor.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        overrides = json.loads(row[0]) if row[0] else None
        return {"overrides": overrides, "useGlobal": overrides is None}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/display-settings/product/{product_id}")
async def update_product_display_overrides(product_id: int, overrides: Optional[dict] = None):
    """Update display overrides for a specific product"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        overrides_json = json.dumps(overrides) if overrides else None
        cursor.execute("""
            UPDATE Products SET display_overrides = %s WHERE id = %s
        """, (overrides_json, product_id))
        conn.commit()
        return {"message": "Configurações do produto atualizadas"}
    finally:
        cursor.close()
        conn.close()


# ==================== HOME MANAGEMENT ====================

class HeroSlideCreate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    link_text: Optional[str] = None
    text_color: Optional[str] = '#FFFFFF'
    overlay_opacity: Optional[int] = 40
    sort_order: Optional[int] = 0
    is_active: Optional[bool] = True

class HomeSectionUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    config: Optional[dict] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class ProductCarouselCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    selection_type: Optional[str] = 'manual'
    selection_rule: Optional[dict] = None
    product_ids: Optional[List[int]] = None
    max_products: Optional[int] = 12
    is_active: Optional[bool] = True

class PromoBannerCreate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: str
    link_url: Optional[str] = None
    badge_text: Optional[str] = None
    layout_type: Optional[str] = 'full'
    background_color: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_active: Optional[bool] = True

class ContentBlockCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    layout_type: Optional[str] = 'full'
    background_color: Optional[str] = None
    text_align: Optional[str] = 'center'
    is_active: Optional[bool] = True

# Home Sections
@admin_router.get("/home/sections")
async def get_home_sections():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, section_type, title, subtitle, config, sort_order, is_active
            FROM HomeSections ORDER BY sort_order
        """)
        sections = []
        for row in cursor.fetchall():
            sections.append({
                "id": row[0], "type": row[1], "title": row[2], "subtitle": row[3],
                "config": json.loads(row[4]) if row[4] else {},
                "sortOrder": row[5], "isActive": bool(row[6])
            })
        return sections
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/sections/{section_id}")
async def update_home_section(section_id: int, data: HomeSectionUpdate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        updates = []
        params = []
        if data.title is not None:
            updates.append("title = %s")
            params.append(data.title)
        if data.subtitle is not None:
            updates.append("subtitle = %s")
            params.append(data.subtitle)
        if data.config is not None:
            updates.append("config = %s")
            params.append(json.dumps(data.config))
        if data.sort_order is not None:
            updates.append("sort_order = %s")
            params.append(data.sort_order)
        if data.is_active is not None:
            updates.append("is_active = %s")
            params.append(1 if data.is_active else 0)
        
        if updates:
            params.append(section_id)
            cursor.execute(f"UPDATE HomeSections SET {', '.join(updates)} WHERE id = %s", params)
            conn.commit()
        return {"message": "Seção atualizada"}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/sections/reorder")
async def reorder_home_sections(order: List[int]):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for idx, section_id in enumerate(order):
            cursor.execute("UPDATE HomeSections SET sort_order = %s WHERE id = %s", (idx + 1, section_id))
        conn.commit()
        return {"message": "Ordem atualizada"}
    finally:
        cursor.close()
        conn.close()

# Hero Slides
@admin_router.get("/home/hero-slides")
async def get_hero_slides():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, title, subtitle, image_url, link_url, link_text, text_color, overlay_opacity, sort_order, is_active
            FROM HeroSlides ORDER BY sort_order
        """)
        slides = []
        for row in cursor.fetchall():
            slides.append({
                "id": row[0], "title": row[1], "subtitle": row[2], "imageUrl": row[3],
                "linkUrl": row[4], "linkText": row[5], "textColor": row[6],
                "overlayOpacity": row[7], "sortOrder": row[8], "isActive": bool(row[9])
            })
        return slides
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/home/hero-slides")
async def create_hero_slide(data: HeroSlideCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO HeroSlides (title, subtitle, image_url, link_url, link_text, text_color, overlay_opacity, sort_order, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (data.title, data.subtitle, data.image_url, data.link_url, data.link_text, 
              data.text_color, data.overlay_opacity, data.sort_order, 1 if data.is_active else 0))
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Slide criado", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/hero-slides/{slide_id}")
async def update_hero_slide(slide_id: int, data: HeroSlideCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE HeroSlides SET title=%s, subtitle=%s, image_url=%s, link_url=%s, link_text=%s,
            text_color=%s, overlay_opacity=%s, sort_order=%s, is_active=%s WHERE id=%s
        """, (data.title, data.subtitle, data.image_url, data.link_url, data.link_text,
              data.text_color, data.overlay_opacity, data.sort_order, 1 if data.is_active else 0, slide_id))
        conn.commit()
        return {"message": "Slide atualizado"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/home/hero-slides/{slide_id}")
async def delete_hero_slide(slide_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM HeroSlides WHERE id = %s", (slide_id,))
        conn.commit()
        return {"message": "Slide removido"}
    finally:
        cursor.close()
        conn.close()

# Product Carousels
@admin_router.get("/home/carousels")
async def get_product_carousels():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, title, subtitle, selection_type, selection_rule, product_ids, max_products, sort_order, is_active
            FROM ProductCarousels ORDER BY sort_order
        """)
        carousels = []
        for row in cursor.fetchall():
            carousels.append({
                "id": row[0], "title": row[1], "subtitle": row[2], "selectionType": row[3],
                "selectionRule": json.loads(row[4]) if row[4] else None,
                "productIds": json.loads(row[5]) if row[5] else [],
                "maxProducts": row[6], "sortOrder": row[7], "isActive": bool(row[8])
            })
        return carousels
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/home/carousels")
async def create_product_carousel(data: ProductCarouselCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO ProductCarousels (title, subtitle, selection_type, selection_rule, product_ids, max_products, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data.title, data.subtitle, data.selection_type,
              json.dumps(data.selection_rule) if data.selection_rule else None,
              json.dumps(data.product_ids) if data.product_ids else None,
              data.max_products, 1 if data.is_active else 0))
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Carrossel criado", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/carousels/{carousel_id}")
async def update_product_carousel(carousel_id: int, data: ProductCarouselCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE ProductCarousels SET title=%s, subtitle=%s, selection_type=%s, selection_rule=%s,
            product_ids=%s, max_products=%s, is_active=%s WHERE id=%s
        """, (data.title, data.subtitle, data.selection_type,
              json.dumps(data.selection_rule) if data.selection_rule else None,
              json.dumps(data.product_ids) if data.product_ids else None,
              data.max_products, 1 if data.is_active else 0, carousel_id))
        conn.commit()
        return {"message": "Carrossel atualizado"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/home/carousels/{carousel_id}")
async def delete_product_carousel(carousel_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM ProductCarousels WHERE id = %s", (carousel_id,))
        conn.commit()
        return {"message": "Carrossel removido"}
    finally:
        cursor.close()
        conn.close()

# Promo Banners
@admin_router.get("/home/banners")
async def get_promo_banners():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, title, description, image_url, link_url, badge_text, layout_type, 
                   background_color, start_date, end_date, sort_order, is_active
            FROM PromoBanners ORDER BY sort_order
        """)
        banners = []
        for row in cursor.fetchall():
            banners.append({
                "id": row[0], "title": row[1], "description": row[2], "imageUrl": row[3],
                "linkUrl": row[4], "badgeText": row[5], "layoutType": row[6],
                "backgroundColor": row[7], 
                "startDate": row[8].isoformat() if row[8] else None,
                "endDate": row[9].isoformat() if row[9] else None,
                "sortOrder": row[10], "isActive": bool(row[11])
            })
        return banners
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/home/banners")
async def create_promo_banner(data: PromoBannerCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO PromoBanners (title, description, image_url, link_url, badge_text, layout_type, background_color, start_date, end_date, is_active)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (data.title, data.description, data.image_url, data.link_url, data.badge_text,
              data.layout_type, data.background_color, data.start_date, data.end_date, 1 if data.is_active else 0))
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Banner criado", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/banners/{banner_id}")
async def update_promo_banner(banner_id: int, data: PromoBannerCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE PromoBanners SET title=%s, description=%s, image_url=%s, link_url=%s, badge_text=%s,
            layout_type=%s, background_color=%s, start_date=%s, end_date=%s, is_active=%s WHERE id=%s
        """, (data.title, data.description, data.image_url, data.link_url, data.badge_text,
              data.layout_type, data.background_color, data.start_date, data.end_date, 1 if data.is_active else 0, banner_id))
        conn.commit()
        return {"message": "Banner atualizado"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/home/banners/{banner_id}")
async def delete_promo_banner(banner_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM PromoBanners WHERE id = %s", (banner_id,))
        conn.commit()
        return {"message": "Banner removido"}
    finally:
        cursor.close()
        conn.close()

# Content Blocks
@admin_router.get("/home/content-blocks")
async def get_content_blocks():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, title, content, layout_type, background_color, text_align, sort_order, is_active
            FROM ContentBlocks ORDER BY sort_order
        """)
        blocks = []
        for row in cursor.fetchall():
            blocks.append({
                "id": row[0], "title": row[1], "content": row[2], "layoutType": row[3],
                "backgroundColor": row[4], "textAlign": row[5], "sortOrder": row[6], "isActive": bool(row[7])
            })
        return blocks
    finally:
        cursor.close()
        conn.close()

@admin_router.post("/home/content-blocks")
async def create_content_block(data: ContentBlockCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO ContentBlocks (title, content, layout_type, background_color, text_align, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (data.title, data.content, data.layout_type, data.background_color, data.text_align, 1 if data.is_active else 0))
        conn.commit()
        cursor.execute("SELECT SCOPE_IDENTITY()")
        new_id = cursor.fetchone()[0]
        return {"message": "Bloco criado", "id": new_id}
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/content-blocks/{block_id}")
async def update_content_block(block_id: int, data: ContentBlockCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE ContentBlocks SET title=%s, content=%s, layout_type=%s, background_color=%s, text_align=%s, is_active=%s WHERE id=%s
        """, (data.title, data.content, data.layout_type, data.background_color, data.text_align, 1 if data.is_active else 0, block_id))
        conn.commit()
        return {"message": "Bloco atualizado"}
    finally:
        cursor.close()
        conn.close()

@admin_router.delete("/home/content-blocks/{block_id}")
async def delete_content_block(block_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM ContentBlocks WHERE id = %s", (block_id,))
        conn.commit()
        return {"message": "Bloco removido"}
    finally:
        cursor.close()
        conn.close()

# Home Settings
@admin_router.get("/home/settings")
async def get_home_settings():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT setting_key, setting_value FROM HomeSettings")
        settings = {}
        for row in cursor.fetchall():
            settings[row[0]] = row[1]
        return settings
    finally:
        cursor.close()
        conn.close()

@admin_router.put("/home/settings")
async def update_home_settings(settings: dict):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        for key, value in settings.items():
            cursor.execute("""
                IF EXISTS (SELECT 1 FROM HomeSettings WHERE setting_key = %s)
                    UPDATE HomeSettings SET setting_value = %s, updated_at = GETDATE() WHERE setting_key = %s
                ELSE
                    INSERT INTO HomeSettings (setting_key, setting_value) VALUES (%s, %s)
            """, (key, str(value), key, key, str(value)))
        conn.commit()
        return {"message": "Configurações atualizadas"}
    finally:
        cursor.close()
        conn.close()
