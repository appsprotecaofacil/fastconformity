from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import pymssql
from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# JWT Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'mercadolivre-clone-secret-key-2025')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# SQL Server Configuration
SQL_SERVER = 'conscientizacao.ce9c4fz7dcpv.us-east-1.rds.amazonaws.com'
SQL_PORT = 1433
SQL_USER = 'admin'
SQL_PASSWORD = '23069981con'
SQL_DATABASE = 'Marketplace'

# Create the main app
app = FastAPI(title="Mercado Livre Clone API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer(auto_error=False)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Database connection helper
def get_db_connection():
    try:
        conn = pymssql.connect(
            server=SQL_SERVER,
            port=SQL_PORT,
            user=SQL_USER,
            password=SQL_PASSWORD,
            database=SQL_DATABASE
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    location: Optional[str] = "São Paulo, SP"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    location: Optional[str]

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    price: float
    original_price: Optional[float]
    discount: Optional[int]
    installments: Optional[int]
    installment_price: Optional[float]
    image: str
    images: List[str]
    free_shipping: bool
    rating: Optional[float]
    reviews: Optional[int]
    sold: Optional[int]
    category: str
    condition: Optional[str]
    brand: Optional[str]
    stock: Optional[int]
    seller: dict
    specs: Optional[List[dict]]

class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    icon: Optional[str]

class CartItemCreate(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: Optional[dict]

class OrderCreate(BaseModel):
    pass  # Will use cart items

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    comment: str

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            return None
        return {"id": user_id, "email": payload.get("email")}
    except JWTError:
        return None

def require_auth(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# Initialize database tables
def init_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Create Users table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                email NVARCHAR(100) UNIQUE NOT NULL,
                password_hash NVARCHAR(255) NOT NULL,
                location NVARCHAR(100),
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create Categories table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
            CREATE TABLE Categories (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(50) NOT NULL,
                slug NVARCHAR(50) UNIQUE NOT NULL,
                icon NVARCHAR(50)
            )
        """)
        
        # Create Products table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Products' AND xtype='U')
            CREATE TABLE Products (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(255) NOT NULL,
                description NVARCHAR(MAX),
                price DECIMAL(10,2) NOT NULL,
                original_price DECIMAL(10,2),
                discount INT,
                installments INT,
                image NVARCHAR(500),
                images NVARCHAR(MAX),
                free_shipping BIT DEFAULT 0,
                rating DECIMAL(2,1),
                reviews_count INT DEFAULT 0,
                sold INT DEFAULT 0,
                category_id INT,
                condition NVARCHAR(20),
                brand NVARCHAR(50),
                stock INT DEFAULT 0,
                seller_name NVARCHAR(100),
                seller_reputation NVARCHAR(50),
                seller_location NVARCHAR(100),
                specs NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (category_id) REFERENCES Categories(id)
            )
        """)
        
        # Create Cart table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Cart' AND xtype='U')
            CREATE TABLE Cart (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES Users(id),
                FOREIGN KEY (product_id) REFERENCES Products(id)
            )
        """)
        
        # Create Orders table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
            CREATE TABLE Orders (
                id INT IDENTITY(1,1) PRIMARY KEY,
                user_id INT NOT NULL,
                total DECIMAL(10,2) NOT NULL,
                status NVARCHAR(50) DEFAULT 'Processando',
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        """)
        
        # Create OrderItems table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='OrderItems' AND xtype='U')
            CREATE TABLE OrderItems (
                id INT IDENTITY(1,1) PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (order_id) REFERENCES Orders(id),
                FOREIGN KEY (product_id) REFERENCES Products(id)
            )
        """)
        
        # Create Reviews table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Reviews' AND xtype='U')
            CREATE TABLE Reviews (
                id INT IDENTITY(1,1) PRIMARY KEY,
                product_id INT NOT NULL,
                user_id INT NOT NULL,
                rating INT NOT NULL,
                comment NVARCHAR(MAX),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (product_id) REFERENCES Products(id),
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        """)
        
        conn.commit()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# Seed initial data
def seed_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if categories exist
        cursor.execute("SELECT COUNT(*) FROM Categories")
        count = cursor.fetchone()[0]
        if count == 0:
            categories = [
                ('Tecnologia', 'tecnologia', 'Smartphone'),
                ('Eletrodomésticos', 'eletrodomesticos', 'Refrigerator'),
                ('Moda', 'moda', 'Shirt'),
                ('Casa e Decoração', 'casa-decoracao', 'Home'),
                ('Esportes', 'esportes', 'Dumbbell'),
                ('Veículos', 'veiculos', 'Car'),
                ('Supermercado', 'supermercado', 'ShoppingCart'),
                ('Beleza', 'beleza', 'Sparkles'),
                ('Brinquedos', 'brinquedos', 'Gamepad2'),
                ('Ferramentas', 'ferramentas', 'Wrench'),
                ('Livros', 'livros', 'BookOpen'),
                ('Saúde', 'saude', 'Heart')
            ]
            for cat in categories:
                cursor.execute(
                    "INSERT INTO Categories (name, slug, icon) VALUES (%s, %s, %s)",
                    cat
                )
            conn.commit()
            logger.info("Categories seeded successfully")
        
        # Check if products exist
        cursor.execute("SELECT COUNT(*) FROM Products")
        count = cursor.fetchone()[0]
        if count == 0:
            products = [
                ('iPhone 15 Pro Max 256GB - Titânio Natural', 'iPhone 15 Pro Max com chip A17 Pro, câmera de 48MP e tela Super Retina XDR de 6.7 polegadas.', 8999.00, 10499.00, 14, 12, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&h=600&fit=crop","https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&h=600&fit=crop"]', 1, 4.8, 1250, 5000, 1, 'novo', 'Apple', 15, 'TechStore Oficial', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Apple"},{"label":"Modelo","value":"iPhone 15 Pro Max"},{"label":"Armazenamento","value":"256GB"}]'),
                ('Smart TV Samsung 55" 4K Crystal UHD', 'Smart TV com resolução 4K, processador Crystal 4K e sistema Tizen.', 2399.00, 3299.00, 27, 10, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&h=600&fit=crop"]', 1, 4.6, 890, 3200, 1, 'novo', 'Samsung', 25, 'Samsung Store', 'MercadoLíder Gold', 'São Paulo', '[{"label":"Marca","value":"Samsung"},{"label":"Tamanho","value":"55 polegadas"}]'),
                ('Notebook Gamer Acer Nitro 5 i5 RTX 3050', 'Notebook gamer com Intel Core i5, placa de vídeo NVIDIA RTX 3050 e 16GB de RAM.', 4299.00, 5499.00, 22, 12, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&h=600&fit=crop"]', 1, 4.7, 456, 1800, 1, 'novo', 'Acer', 8, 'Acer Brasil', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Processador","value":"Intel Core i5-12450H"},{"label":"Placa de Vídeo","value":"NVIDIA RTX 3050"}]'),
                ('Tênis Nike Air Max 90 Masculino', 'Tênis Nike Air Max 90 com amortecimento Air e design clássico.', 599.90, 799.90, 25, 6, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop"]', 1, 4.9, 2100, 8500, 3, 'novo', 'Nike', 50, 'Nike Store', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Nike"},{"label":"Modelo","value":"Air Max 90"}]'),
                ('Geladeira Brastemp Frost Free 375L Inox', 'Geladeira Frost Free com 375 litros, painel eletrônico e acabamento em inox.', 3199.00, 4199.00, 24, 12, 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&h=600&fit=crop"]', 1, 4.5, 678, 2100, 2, 'novo', 'Brastemp', 12, 'Brastemp Oficial', 'MercadoLíder Gold', 'São Paulo', '[{"label":"Capacidade","value":"375 litros"},{"label":"Tipo","value":"Frost Free"}]'),
                ('PlayStation 5 Standard Edition', 'Console PlayStation 5 com SSD ultra-rápido, ray tracing e controle DualSense.', 4299.00, 4999.00, 14, 12, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop"]', 1, 4.9, 3200, 12000, 9, 'novo', 'Sony', 5, 'PlayStation Store', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Sony"},{"label":"SSD","value":"825GB"}]'),
                ('Bicicleta Caloi Elite Carbon Racing', 'Bicicleta de carbono para ciclismo profissional com grupo Shimano 105.', 12999.00, 15999.00, 19, 12, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&h=600&fit=crop"]', 1, 4.7, 89, 250, 5, 'novo', 'Caloi', 3, 'Caloi Store', 'MercadoLíder Gold', 'São Paulo', '[{"label":"Marca","value":"Caloi"},{"label":"Material","value":"Carbono"}]'),
                ('Cafeteira Nespresso Vertuo Next', 'Cafeteira automática com tecnologia Centrifusion para café expresso perfeito.', 699.00, 899.00, 22, 6, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop"]', 1, 4.6, 567, 2300, 2, 'novo', 'Nespresso', 20, 'Nespresso Brasil', 'MercadoLíder Gold', 'São Paulo', '[{"label":"Marca","value":"Nespresso"},{"label":"Modelo","value":"Vertuo Next"}]'),
                ('Relógio Apple Watch Series 9 45mm GPS', 'Apple Watch com chip S9, tela Retina always-on e monitoramento de saúde.', 3999.00, 4599.00, 13, 12, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&h=600&fit=crop"]', 1, 4.8, 890, 4500, 1, 'novo', 'Apple', 18, 'Apple Store', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Apple"},{"label":"Tamanho","value":"45mm"}]'),
                ('Ar Condicionado Split LG Dual Inverter 12000 BTUs', 'Ar condicionado com tecnologia Dual Inverter, economia de energia e controle por app.', 2199.00, 2899.00, 24, 12, 'https://images.unsplash.com/photo-1631545806609-1d5c6e54d5f8?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1631545806609-1d5c6e54d5f8?w=600&h=600&fit=crop"]', 1, 4.7, 1200, 5600, 2, 'novo', 'LG', 30, 'LG Brasil', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"LG"},{"label":"Capacidade","value":"12000 BTUs"}]'),
                ('Kindle Paperwhite 16GB 6.8" Preto', 'E-reader com tela de 6.8", luz ajustável e bateria de longa duração.', 549.00, 649.00, 15, 6, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=600&fit=crop"]', 1, 4.9, 3400, 15000, 11, 'novo', 'Amazon', 45, 'Amazon Brasil', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Amazon"},{"label":"Armazenamento","value":"16GB"}]'),
                ('Fone de Ouvido Sony WH-1000XM5 Bluetooth', 'Fone over-ear com cancelamento de ruído líder do mercado e 30h de bateria.', 2299.00, 2799.00, 18, 10, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop', '["https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=600&h=600&fit=crop"]', 1, 4.8, 780, 3200, 1, 'novo', 'Sony', 22, 'Sony Store', 'MercadoLíder Platinum', 'São Paulo', '[{"label":"Marca","value":"Sony"},{"label":"Modelo","value":"WH-1000XM5"}]')
            ]
            for prod in products:
                cursor.execute("""
                    INSERT INTO Products (title, description, price, original_price, discount, installments, image, images, free_shipping, rating, reviews_count, sold, category_id, condition, brand, stock, seller_name, seller_reputation, seller_location, specs)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, prod)
            conn.commit()
            logger.info("Products seeded successfully")
            
    except Exception as e:
        logger.error(f"Error seeding data: {e}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# Routes
@api_router.get("/")
async def root():
    return {"message": "Mercado Livre Clone API", "status": "running"}

@api_router.get("/health")
async def health():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except:
        return {"status": "unhealthy", "database": "disconnected"}

# Auth Routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user: UserCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if email exists
        cursor.execute("SELECT id FROM Users WHERE email = %s", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email já cadastrado")
        
        # Create user
        hashed_password = hash_password(user.password)
        cursor.execute(
            "INSERT INTO Users (name, email, password_hash, location) VALUES (%s, %s, %s, %s)",
            (user.name, user.email, hashed_password, user.location)
        )
        conn.commit()
        
        # Get created user
        cursor.execute("SELECT id, name, email, location FROM Users WHERE email = %s", (user.email,))
        row = cursor.fetchone()
        user_data = UserResponse(id=row[0], name=row[1], email=row[2], location=row[3])
        
        # Create token
        token = create_access_token({"user_id": row[0], "email": row[2]})
        
        return TokenResponse(access_token=token, user=user_data)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Erro ao criar conta")
    finally:
        cursor.close()
        conn.close()

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, name, email, password_hash, location FROM Users WHERE email = %s",
            (credentials.email,)
        )
        row = cursor.fetchone()
        if not row or not verify_password(credentials.password, row[3]):
            raise HTTPException(status_code=401, detail="Email ou senha incorretos")
        
        user_data = UserResponse(id=row[0], name=row[1], email=row[2], location=row[4])
        token = create_access_token({"user_id": row[0], "email": row[2]})
        
        return TokenResponse(access_token=token, user=user_data)
    finally:
        cursor.close()
        conn.close()

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id, name, email, location FROM Users WHERE id = %s",
            (current_user["id"],)
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return UserResponse(id=row[0], name=row[1], email=row[2], location=row[3])
    finally:
        cursor.close()
        conn.close()

# Categories Routes
@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name, slug, icon FROM Categories ORDER BY id")
        rows = cursor.fetchall()
        return [CategoryResponse(id=r[0], name=r[1], slug=r[2], icon=r[3]) for r in rows]
    finally:
        cursor.close()
        conn.close()

# Products Routes
@api_router.get("/products")
async def get_products(
    category: Optional[str] = None,
    brand: Optional[str] = None,
    condition: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    free_shipping: Optional[bool] = None,
    search: Optional[str] = None,
    sort: Optional[str] = "relevance",
    limit: int = 50
):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        query = """
            SELECT p.id, p.title, p.description, p.price, p.original_price, p.discount, 
                   p.installments, p.image, p.images, p.free_shipping, p.rating, 
                   p.reviews_count, p.sold, c.slug as category, p.condition, p.brand, 
                   p.stock, p.seller_name, p.seller_reputation, p.seller_location, p.specs
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE 1=1
        """
        params = []
        
        if category:
            query += " AND c.slug = %s"
            params.append(category)
        if brand:
            query += " AND p.brand = %s"
            params.append(brand)
        if condition:
            query += " AND p.condition = %s"
            params.append(condition)
        if min_price:
            query += " AND p.price >= %s"
            params.append(min_price)
        if max_price:
            query += " AND p.price <= %s"
            params.append(max_price)
        if free_shipping:
            query += " AND p.free_shipping = 1"
        if search:
            query += " AND (p.title LIKE %s OR p.brand LIKE %s OR p.description LIKE %s)"
            search_param = f"%{search}%"
            params.extend([search_param, search_param, search_param])
        
        # Sorting
        if sort == "price_asc":
            query += " ORDER BY p.price ASC"
        elif sort == "price_desc":
            query += " ORDER BY p.price DESC"
        elif sort == "rating":
            query += " ORDER BY p.rating DESC"
        else:
            query += " ORDER BY p.sold DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        products = []
        for r in rows:
            installment_price = r[3] / r[6] if r[6] else None
            images = json.loads(r[8]) if r[8] else [r[7]]
            specs = json.loads(r[20]) if r[20] else []
            
            products.append({
                "id": r[0],
                "title": r[1],
                "description": r[2],
                "price": float(r[3]),
                "originalPrice": float(r[4]) if r[4] else None,
                "discount": r[5],
                "installments": r[6],
                "installmentPrice": round(installment_price, 2) if installment_price else None,
                "image": r[7],
                "images": images,
                "freeShipping": bool(r[9]),
                "rating": float(r[10]) if r[10] else None,
                "reviews": r[11],
                "sold": r[12],
                "category": r[13],
                "condition": r[14],
                "brand": r[15],
                "stock": r[16],
                "seller": {
                    "name": r[17],
                    "reputation": r[18],
                    "location": r[19]
                },
                "specs": specs
            })
        
        return products
    finally:
        cursor.close()
        conn.close()

@api_router.get("/products/{product_id}")
async def get_product(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.title, p.description, p.price, p.original_price, p.discount, 
                   p.installments, p.image, p.images, p.free_shipping, p.rating, 
                   p.reviews_count, p.sold, c.slug as category, p.condition, p.brand, 
                   p.stock, p.seller_name, p.seller_reputation, p.seller_location, p.specs
            FROM Products p
            LEFT JOIN Categories c ON p.category_id = c.id
            WHERE p.id = %s
        """, (product_id,))
        r = cursor.fetchone()
        
        if not r:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        installment_price = r[3] / r[6] if r[6] else None
        images = json.loads(r[8]) if r[8] else [r[7]]
        specs = json.loads(r[20]) if r[20] else []
        
        return {
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "price": float(r[3]),
            "originalPrice": float(r[4]) if r[4] else None,
            "discount": r[5],
            "installments": r[6],
            "installmentPrice": round(installment_price, 2) if installment_price else None,
            "image": r[7],
            "images": images,
            "freeShipping": bool(r[9]),
            "rating": float(r[10]) if r[10] else None,
            "reviews": r[11],
            "sold": r[12],
            "category": r[13],
            "condition": r[14],
            "brand": r[15],
            "stock": r[16],
            "seller": {
                "name": r[17],
                "reputation": r[18],
                "location": r[19]
            },
            "specs": specs
        }
    finally:
        cursor.close()
        conn.close()

# Cart Routes
@api_router.get("/cart")
async def get_cart(current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.image, p.free_shipping
            FROM Cart c
            JOIN Products p ON c.product_id = p.id
            WHERE c.user_id = %s
        """, (current_user["id"],))
        rows = cursor.fetchall()
        
        items = []
        total = 0
        for r in rows:
            item_total = float(r[4]) * r[2]
            total += item_total
            items.append({
                "id": r[0],
                "productId": r[1],
                "quantity": r[2],
                "product": {
                    "id": r[1],
                    "title": r[3],
                    "price": float(r[4]),
                    "image": r[5],
                    "freeShipping": bool(r[6])
                }
            })
        
        return {"items": items, "total": round(total, 2)}
    finally:
        cursor.close()
        conn.close()

@api_router.post("/cart")
async def add_to_cart(item: CartItemCreate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Check if item already in cart
        cursor.execute(
            "SELECT id, quantity FROM Cart WHERE user_id = %s AND product_id = %s",
            (current_user["id"], item.product_id)
        )
        existing = cursor.fetchone()
        
        if existing:
            # Update quantity
            new_qty = existing[1] + item.quantity
            cursor.execute(
                "UPDATE Cart SET quantity = %s WHERE id = %s",
                (new_qty, existing[0])
            )
        else:
            # Add new item
            cursor.execute(
                "INSERT INTO Cart (user_id, product_id, quantity) VALUES (%s, %s, %s)",
                (current_user["id"], item.product_id, item.quantity)
            )
        
        conn.commit()
        return {"message": "Item adicionado ao carrinho"}
    finally:
        cursor.close()
        conn.close()

@api_router.put("/cart/{cart_id}")
async def update_cart_item(cart_id: int, item: CartItemUpdate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if item.quantity <= 0:
            cursor.execute(
                "DELETE FROM Cart WHERE id = %s AND user_id = %s",
                (cart_id, current_user["id"])
            )
        else:
            cursor.execute(
                "UPDATE Cart SET quantity = %s WHERE id = %s AND user_id = %s",
                (item.quantity, cart_id, current_user["id"])
            )
        conn.commit()
        return {"message": "Carrinho atualizado"}
    finally:
        cursor.close()
        conn.close()

@api_router.delete("/cart/{cart_id}")
async def remove_from_cart(cart_id: int, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM Cart WHERE id = %s AND user_id = %s",
            (cart_id, current_user["id"])
        )
        conn.commit()
        return {"message": "Item removido do carrinho"}
    finally:
        cursor.close()
        conn.close()

@api_router.delete("/cart")
async def clear_cart(current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM Cart WHERE user_id = %s", (current_user["id"],))
        conn.commit()
        return {"message": "Carrinho limpo"}
    finally:
        cursor.close()
        conn.close()

# Orders Routes
@api_router.get("/orders")
async def get_orders(current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, total, status, created_at FROM Orders 
            WHERE user_id = %s ORDER BY created_at DESC
        """, (current_user["id"],))
        orders = cursor.fetchall()
        
        result = []
        for order in orders:
            cursor.execute("""
                SELECT oi.product_id, oi.quantity, oi.price, p.title, p.image
                FROM OrderItems oi
                JOIN Products p ON oi.product_id = p.id
                WHERE oi.order_id = %s
            """, (order[0],))
            items = cursor.fetchall()
            
            result.append({
                "id": order[0],
                "total": float(order[1]),
                "status": order[2],
                "date": order[3].isoformat() if order[3] else None,
                "items": [{
                    "id": i[0],
                    "quantity": i[1],
                    "price": float(i[2]),
                    "title": i[3],
                    "image": i[4]
                } for i in items]
            })
        
        return result
    finally:
        cursor.close()
        conn.close()

@api_router.post("/orders")
async def create_order(current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get cart items
        cursor.execute("""
            SELECT c.product_id, c.quantity, p.price
            FROM Cart c
            JOIN Products p ON c.product_id = p.id
            WHERE c.user_id = %s
        """, (current_user["id"],))
        cart_items = cursor.fetchall()
        
        if not cart_items:
            raise HTTPException(status_code=400, detail="Carrinho vazio")
        
        # Calculate total
        total = sum(float(item[2]) * item[1] for item in cart_items)
        
        # Create order
        cursor.execute(
            "INSERT INTO Orders (user_id, total, status) VALUES (%s, %s, %s)",
            (current_user["id"], total, 'Processando')
        )
        cursor.execute("SELECT SCOPE_IDENTITY()")
        order_id = cursor.fetchone()[0]
        
        # Add order items
        for item in cart_items:
            cursor.execute(
                "INSERT INTO OrderItems (order_id, product_id, quantity, price) VALUES (%s, %s, %s, %s)",
                (order_id, item[0], item[1], item[2])
            )
        
        # Clear cart
        cursor.execute("DELETE FROM Cart WHERE user_id = %s", (current_user["id"],))
        
        conn.commit()
        return {"message": "Pedido criado com sucesso", "orderId": order_id}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail="Erro ao criar pedido")
    finally:
        cursor.close()
        conn.close()

# Reviews Routes
@api_router.get("/reviews/product/{product_id}")
async def get_product_reviews(product_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT r.id, r.rating, r.comment, r.created_at, u.name
            FROM Reviews r
            JOIN Users u ON r.user_id = u.id
            WHERE r.product_id = %s
            ORDER BY r.created_at DESC
        """, (product_id,))
        rows = cursor.fetchall()
        
        return [{
            "id": r[0],
            "rating": r[1],
            "comment": r[2],
            "date": r[3].strftime('%Y-%m-%d') if r[3] else None,
            "user": r[4]
        } for r in rows]
    finally:
        cursor.close()
        conn.close()

@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: dict = Depends(require_auth)):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO Reviews (product_id, user_id, rating, comment) VALUES (%s, %s, %s, %s)",
            (review.product_id, current_user["id"], review.rating, review.comment)
        )
        
        # Update product rating
        cursor.execute("""
            UPDATE Products SET 
                reviews_count = reviews_count + 1,
                rating = (SELECT AVG(CAST(rating AS DECIMAL(2,1))) FROM Reviews WHERE product_id = %s)
            WHERE id = %s
        """, (review.product_id, review.product_id))
        
        conn.commit()
        return {"message": "Avaliação criada com sucesso"}
    finally:
        cursor.close()
        conn.close()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database...")
    init_database()
    seed_data()
    logger.info("Server started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Server shutting down")
