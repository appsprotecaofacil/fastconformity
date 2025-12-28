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
from admin_routes import admin_router, init_admin_table

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

class QuoteCreate(BaseModel):
    product_id: int
    customer_name: str
    customer_email: str
    customer_phone: str
    message: Optional[str] = None

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
        
        # Create Categories table with parent_id for hierarchy
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Categories' AND xtype='U')
            CREATE TABLE Categories (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(50) NOT NULL,
                slug NVARCHAR(50) UNIQUE NOT NULL,
                icon NVARCHAR(50),
                parent_id INT NULL,
                FOREIGN KEY (parent_id) REFERENCES Categories(id)
            )
        """)
        
        # Add parent_id column if table exists but column doesn't
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Categories') AND name = 'parent_id')
            ALTER TABLE Categories ADD parent_id INT NULL
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
                action_type NVARCHAR(20) DEFAULT 'buy',
                whatsapp_number NVARCHAR(20),
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (category_id) REFERENCES Categories(id)
            )
        """)
        
        # Add action_type and whatsapp_number columns if they don't exist
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'action_type')
            ALTER TABLE Products ADD action_type NVARCHAR(20) DEFAULT 'buy'
        """)
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'whatsapp_number')
            ALTER TABLE Products ADD whatsapp_number NVARCHAR(20)
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
        
        # Create Quotes table for quote requests
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Quotes' AND xtype='U')
            CREATE TABLE Quotes (
                id INT IDENTITY(1,1) PRIMARY KEY,
                product_id INT NOT NULL,
                customer_name NVARCHAR(100) NOT NULL,
                customer_email NVARCHAR(100) NOT NULL,
                customer_phone NVARCHAR(20) NOT NULL,
                message NVARCHAR(MAX),
                status NVARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (product_id) REFERENCES Products(id)
            )
        """)
        
        # Create ProductViews table for tracking views (for "who viewed also viewed")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductViews' AND xtype='U')
            CREATE TABLE ProductViews (
                id INT IDENTITY(1,1) PRIMARY KEY,
                product_id INT NOT NULL,
                session_id NVARCHAR(100) NOT NULL,
                user_id INT NULL,
                viewed_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (product_id) REFERENCES Products(id),
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        """)
        
        # Create BlogCategories table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlogCategories' AND xtype='U')
            CREATE TABLE BlogCategories (
                id INT IDENTITY(1,1) PRIMARY KEY,
                name NVARCHAR(100) NOT NULL,
                slug NVARCHAR(100) UNIQUE NOT NULL,
                description NVARCHAR(500),
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create BlogPosts table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlogPosts' AND xtype='U')
            CREATE TABLE BlogPosts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(255) NOT NULL,
                slug NVARCHAR(255) UNIQUE NOT NULL,
                excerpt NVARCHAR(500),
                content NVARCHAR(MAX),
                cover_image NVARCHAR(500),
                category_id INT,
                author_name NVARCHAR(100),
                status NVARCHAR(20) DEFAULT 'draft',
                allow_comments BIT DEFAULT 1,
                views_count INT DEFAULT 0,
                published_at DATETIME,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (category_id) REFERENCES BlogCategories(id)
            )
        """)
        
        # Create BlogPostProducts table (relationship between posts and products)
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlogPostProducts' AND xtype='U')
            CREATE TABLE BlogPostProducts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                post_id INT NOT NULL,
                product_id INT NOT NULL,
                FOREIGN KEY (post_id) REFERENCES BlogPosts(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES Products(id)
            )
        """)
        
        # Create BlogComments table
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BlogComments' AND xtype='U')
            CREATE TABLE BlogComments (
                id INT IDENTITY(1,1) PRIMARY KEY,
                post_id INT NOT NULL,
                user_id INT,
                author_name NVARCHAR(100) NOT NULL,
                author_email NVARCHAR(100),
                content NVARCHAR(MAX) NOT NULL,
                status NVARCHAR(20) DEFAULT 'pending',
                created_at DATETIME DEFAULT GETDATE(),
                FOREIGN KEY (post_id) REFERENCES BlogPosts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES Users(id)
            )
        """)
        
        # Create ProductDisplaySettings table for global display settings
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductDisplaySettings' AND xtype='U')
            CREATE TABLE ProductDisplaySettings (
                id INT IDENTITY(1,1) PRIMARY KEY,
                setting_key NVARCHAR(50) UNIQUE NOT NULL,
                setting_value BIT DEFAULT 1,
                setting_label NVARCHAR(100),
                setting_group NVARCHAR(50),
                sort_order INT DEFAULT 0,
                updated_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Add display_overrides column to Products if it doesn't exist
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'display_overrides')
            ALTER TABLE Products ADD display_overrides NVARCHAR(MAX)
        """)
        
        # Create HomeSections table for managing homepage layout
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HomeSections' AND xtype='U')
            CREATE TABLE HomeSections (
                id INT IDENTITY(1,1) PRIMARY KEY,
                section_type NVARCHAR(50) NOT NULL,
                title NVARCHAR(200),
                subtitle NVARCHAR(500),
                config NVARCHAR(MAX),
                sort_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE(),
                updated_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create HeroSlides table for banner carousel
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HeroSlides' AND xtype='U')
            CREATE TABLE HeroSlides (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(200),
                subtitle NVARCHAR(500),
                image_url NVARCHAR(500) NOT NULL,
                link_url NVARCHAR(500),
                link_text NVARCHAR(100),
                text_color NVARCHAR(20) DEFAULT '#FFFFFF',
                overlay_opacity INT DEFAULT 40,
                sort_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create PromoBanners table for promotional banners
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PromoBanners' AND xtype='U')
            CREATE TABLE PromoBanners (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(200),
                description NVARCHAR(500),
                image_url NVARCHAR(500) NOT NULL,
                link_url NVARCHAR(500),
                badge_text NVARCHAR(50),
                layout_type NVARCHAR(20) DEFAULT 'full',
                background_color NVARCHAR(20),
                start_date DATETIME,
                end_date DATETIME,
                sort_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create ProductCarousels table for custom product carousels
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ProductCarousels' AND xtype='U')
            CREATE TABLE ProductCarousels (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(200) NOT NULL,
                subtitle NVARCHAR(500),
                selection_type NVARCHAR(20) DEFAULT 'manual',
                selection_rule NVARCHAR(MAX),
                product_ids NVARCHAR(MAX),
                max_products INT DEFAULT 12,
                sort_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create ContentBlocks table for text/content sections
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ContentBlocks' AND xtype='U')
            CREATE TABLE ContentBlocks (
                id INT IDENTITY(1,1) PRIMARY KEY,
                title NVARCHAR(200),
                content NVARCHAR(MAX),
                layout_type NVARCHAR(20) DEFAULT 'full',
                background_color NVARCHAR(20),
                text_align NVARCHAR(20) DEFAULT 'center',
                sort_order INT DEFAULT 0,
                is_active BIT DEFAULT 1,
                created_at DATETIME DEFAULT GETDATE()
            )
        """)
        
        # Create HomeSettings table for general homepage settings
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='HomeSettings' AND xtype='U')
            CREATE TABLE HomeSettings (
                id INT IDENTITY(1,1) PRIMARY KEY,
                setting_key NVARCHAR(50) UNIQUE NOT NULL,
                setting_value NVARCHAR(MAX),
                updated_at DATETIME DEFAULT GETDATE()
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
        
        # Seed display settings if empty
        cursor.execute("SELECT COUNT(*) FROM ProductDisplaySettings")
        if cursor.fetchone()[0] == 0:
            display_settings = [
                # Price group
                ('show_price', 1, 'Preço', 'price', 1),
                ('show_original_price', 1, 'Preço original (riscado)', 'price', 2),
                ('show_discount', 1, 'Desconto', 'price', 3),
                ('show_installments', 1, 'Parcelamento', 'price', 4),
                # Delivery group
                ('show_free_shipping', 1, 'Frete grátis', 'delivery', 10),
                # Product info group
                ('show_specs', 1, 'Especificações técnicas', 'product', 20),
                ('show_brand', 1, 'Marca', 'product', 21),
                ('show_condition', 1, 'Condição (novo/usado)', 'product', 22),
                ('show_stock', 1, 'Quantidade em estoque', 'product', 23),
                ('show_sold', 1, 'Quantidade vendida', 'product', 24),
                # Interaction group
                ('show_rating', 1, 'Avaliações / Estrelas', 'interaction', 30),
                ('show_reviews_count', 1, 'Número de reviews', 'interaction', 31),
                ('show_action_button', 1, 'Botão de ação', 'interaction', 32),
                # Seller group
                ('show_seller_info', 1, 'Informações do vendedor', 'seller', 40),
            ]
            for setting in display_settings:
                cursor.execute("""
                    INSERT INTO ProductDisplaySettings (setting_key, setting_value, setting_label, setting_group, sort_order)
                    VALUES (%s, %s, %s, %s, %s)
                """, setting)
            conn.commit()
            logger.info("Display settings seeded successfully")
            
            
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
    except Exception:
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

# Display Settings Public Route
@api_router.get("/display-settings")
async def get_public_display_settings():
    """Get global product display settings for frontend"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT setting_key, setting_value
            FROM ProductDisplaySettings
        """)
        
        settings = {}
        for row in cursor.fetchall():
            settings[row[0]] = bool(row[1])
        
        return settings
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
                   p.stock, p.seller_name, p.seller_reputation, p.seller_location, p.specs,
                   p.action_type, p.whatsapp_number
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
            action_type = r[21] if r[21] else 'buy'
            
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
                "specs": specs,
                "actionType": action_type,
                "whatsappNumber": r[22]
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
                   p.stock, p.seller_name, p.seller_reputation, p.seller_location, p.specs,
                   p.action_type, p.whatsapp_number, p.display_overrides
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
        action_type = r[21] if r[21] else 'buy'
        display_overrides = json.loads(r[23]) if r[23] else None
        
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
            "specs": specs,
            "actionType": action_type,
            "whatsappNumber": r[22],
            "displayOverrides": display_overrides
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

# Quotes Routes
@api_router.post("/quotes")
async def create_quote(quote: QuoteCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Verify product exists and is quote type
        cursor.execute("SELECT id, title, action_type FROM Products WHERE id = %s", (quote.product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Produto não encontrado")
        
        cursor.execute(
            """INSERT INTO Quotes (product_id, customer_name, customer_email, customer_phone, message, status) 
               VALUES (%s, %s, %s, %s, %s, 'pending')""",
            (quote.product_id, quote.customer_name, quote.customer_email, quote.customer_phone, quote.message)
        )
        conn.commit()
        
        return {"message": "Cotação enviada com sucesso! Entraremos em contato em breve."}
    finally:
        cursor.close()
        conn.close()

@api_router.get("/quotes")
async def get_quotes(current_user: dict = Depends(require_auth)):
    """Get quotes for the logged in user (by email)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT email FROM Users WHERE id = %s", (current_user["id"],))
        user = cursor.fetchone()
        if not user:
            return []
        
        cursor.execute("""
            SELECT q.id, q.product_id, p.title, p.image, q.message, q.status, q.created_at
            FROM Quotes q
            JOIN Products p ON q.product_id = p.id
            WHERE q.customer_email = %s
            ORDER BY q.created_at DESC
        """, (user[0],))
        
        return [{
            "id": r[0],
            "productId": r[1],
            "productTitle": r[2],
            "productImage": r[3],
            "message": r[4],
            "status": r[5],
            "date": r[6].isoformat() if r[6] else None
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

# Product Views Tracking & Recommendations
@api_router.post("/products/{product_id}/view")
async def track_product_view(product_id: int, session_id: str, user_id: Optional[int] = None):
    """Track product view for recommendations"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO ProductViews (product_id, session_id, user_id) VALUES (%s, %s, %s)",
            (product_id, session_id, user_id)
        )
        conn.commit()
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        cursor.close()
        conn.close()

@api_router.get("/products/{product_id}/related")
async def get_related_products(product_id: int, limit: int = 8):
    """Get products from the same category"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get current product's category
        cursor.execute("SELECT category_id FROM Products WHERE id = %s", (product_id,))
        result = cursor.fetchone()
        if not result:
            return []
        
        category_id = result[0]
        
        # Get products from same category
        cursor.execute("""
            SELECT TOP %s p.id, p.title, p.price, p.original_price, p.discount, 
                   p.installments, p.image, p.free_shipping, p.rating, p.reviews_count,
                   p.action_type, p.whatsapp_number
            FROM Products p
            WHERE p.category_id = %s AND p.id != %s
            ORDER BY p.sold DESC, p.rating DESC
        """, (limit, category_id, product_id))
        
        products = []
        for r in cursor.fetchall():
            installment_price = r[2] / r[5] if r[5] else None
            products.append({
                "id": r[0],
                "title": r[1],
                "price": float(r[2]),
                "originalPrice": float(r[3]) if r[3] else None,
                "discount": r[4],
                "installments": r[5],
                "installmentPrice": round(installment_price, 2) if installment_price else None,
                "image": r[6],
                "freeShipping": bool(r[7]),
                "rating": float(r[8]) if r[8] else None,
                "reviews": r[9],
                "actionType": r[10] or 'buy',
                "whatsappNumber": r[11]
            })
        
        return products
    finally:
        cursor.close()
        conn.close()

@api_router.get("/products/{product_id}/suggestions")
async def get_product_suggestions(product_id: int, limit: int = 6):
    """Get products you might like (similar price range, related categories)"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get current product's price and category
        cursor.execute("SELECT price, category_id FROM Products WHERE id = %s", (product_id,))
        result = cursor.fetchone()
        if not result:
            return []
        
        price, category_id = result[0], result[1]
        price_min = float(price) * 0.5
        price_max = float(price) * 2.0
        
        # Get products in similar price range from different categories
        cursor.execute("""
            SELECT TOP %s p.id, p.title, p.price, p.original_price, p.discount, 
                   p.installments, p.image, p.free_shipping, p.rating, p.reviews_count,
                   p.action_type, p.whatsapp_number
            FROM Products p
            WHERE p.id != %s 
            AND p.category_id != %s
            AND p.price BETWEEN %s AND %s
            ORDER BY p.rating DESC, p.sold DESC
        """, (limit, product_id, category_id, price_min, price_max))
        
        products = []
        for r in cursor.fetchall():
            installment_price = r[2] / r[5] if r[5] else None
            products.append({
                "id": r[0],
                "title": r[1],
                "price": float(r[2]),
                "originalPrice": float(r[3]) if r[3] else None,
                "discount": r[4],
                "installments": r[5],
                "installmentPrice": round(installment_price, 2) if installment_price else None,
                "image": r[6],
                "freeShipping": bool(r[7]),
                "rating": float(r[8]) if r[8] else None,
                "reviews": r[9],
                "actionType": r[10] or 'buy',
                "whatsappNumber": r[11]
            })
        
        return products
    finally:
        cursor.close()
        conn.close()

@api_router.get("/products/{product_id}/also-viewed")
async def get_also_viewed_products(product_id: int, session_id: str, limit: int = 8):
    """Get products that users who viewed this product also viewed"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Find sessions that viewed the current product
        # Then find other products those sessions also viewed
        cursor.execute("""
            SELECT TOP %s p.id, p.title, p.price, p.original_price, p.discount, 
                   p.installments, p.image, p.free_shipping, p.rating, p.reviews_count,
                   p.action_type, p.whatsapp_number, COUNT(*) as view_count
            FROM Products p
            INNER JOIN ProductViews pv ON p.id = pv.product_id
            WHERE pv.session_id IN (
                SELECT DISTINCT session_id 
                FROM ProductViews 
                WHERE product_id = %s
            )
            AND p.id != %s
            GROUP BY p.id, p.title, p.price, p.original_price, p.discount, 
                     p.installments, p.image, p.free_shipping, p.rating, p.reviews_count,
                     p.action_type, p.whatsapp_number
            ORDER BY view_count DESC, p.rating DESC
        """, (limit, product_id, product_id))
        
        products = []
        for r in cursor.fetchall():
            installment_price = r[2] / r[5] if r[5] else None
            products.append({
                "id": r[0],
                "title": r[1],
                "price": float(r[2]),
                "originalPrice": float(r[3]) if r[3] else None,
                "discount": r[4],
                "installments": r[5],
                "installmentPrice": round(installment_price, 2) if installment_price else None,
                "image": r[6],
                "freeShipping": bool(r[7]),
                "rating": float(r[8]) if r[8] else None,
                "reviews": r[9],
                "actionType": r[10] or 'buy',
                "whatsappNumber": r[11]
            })
        
        # If not enough data, fallback to best sellers in same category
        if len(products) < 4:
            cursor.execute("SELECT category_id FROM Products WHERE id = %s", (product_id,))
            cat_result = cursor.fetchone()
            if cat_result:
                existing_ids = [p["id"] for p in products] + [product_id]
                placeholders = ','.join(['%s'] * len(existing_ids))
                cursor.execute(f"""
                    SELECT TOP %s p.id, p.title, p.price, p.original_price, p.discount, 
                           p.installments, p.image, p.free_shipping, p.rating, p.reviews_count,
                           p.action_type, p.whatsapp_number
                    FROM Products p
                    WHERE p.category_id = %s AND p.id NOT IN ({placeholders})
                    ORDER BY p.sold DESC
                """, (limit - len(products), cat_result[0], *existing_ids))
                
                for r in cursor.fetchall():
                    installment_price = r[2] / r[5] if r[5] else None
                    products.append({
                        "id": r[0],
                        "title": r[1],
                        "price": float(r[2]),
                        "originalPrice": float(r[3]) if r[3] else None,
                        "discount": r[4],
                        "installments": r[5],
                        "installmentPrice": round(installment_price, 2) if installment_price else None,
                        "image": r[6],
                        "freeShipping": bool(r[7]),
                        "rating": float(r[8]) if r[8] else None,
                        "reviews": r[9],
                        "actionType": r[10] or 'buy',
                        "whatsappNumber": r[11]
                    })
        
        return products
    finally:
        cursor.close()
        conn.close()

# ==================== BLOG PUBLIC ROUTES ====================

@api_router.get("/blog/categories")
async def get_blog_categories():
    """Get all blog categories"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.name, c.slug, c.description, 
                   (SELECT COUNT(*) FROM BlogPosts WHERE category_id = c.id AND status = 'published') as post_count
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

@api_router.get("/blog/posts")
async def get_blog_posts(
    category: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 10
):
    """Get published blog posts with pagination"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        offset = (page - 1) * limit
        
        # Base query
        query = """
            SELECT p.id, p.title, p.slug, p.excerpt, p.cover_image, 
                   p.author_name, p.published_at, p.views_count,
                   c.name as category_name, c.slug as category_slug
            FROM BlogPosts p
            LEFT JOIN BlogCategories c ON p.category_id = c.id
            WHERE p.status = 'published'
        """
        count_query = "SELECT COUNT(*) FROM BlogPosts p WHERE p.status = 'published'"
        params = []
        count_params = []
        
        if category:
            query += " AND c.slug = %s"
            count_query += " AND p.category_id = (SELECT id FROM BlogCategories WHERE slug = %s)"
            params.append(category)
            count_params.append(category)
        
        if search:
            query += " AND (p.title LIKE %s OR p.excerpt LIKE %s)"
            count_query += " AND (p.title LIKE %s OR p.excerpt LIKE %s)"
            params.extend([f"%{search}%", f"%{search}%"])
            count_params.extend([f"%{search}%", f"%{search}%"])
        
        query += " ORDER BY p.published_at DESC OFFSET %s ROWS FETCH NEXT %s ROWS ONLY"
        params.extend([offset, limit])
        
        cursor.execute(query, params)
        posts = [{
            "id": r[0],
            "title": r[1],
            "slug": r[2],
            "excerpt": r[3],
            "coverImage": r[4],
            "author": r[5],
            "publishedAt": r[6].isoformat() if r[6] else None,
            "views": r[7],
            "category": r[8],
            "categorySlug": r[9]
        } for r in cursor.fetchall()]
        
        # Get total count
        cursor.execute(count_query, count_params)
        total = cursor.fetchone()[0]
        
        return {
            "posts": posts,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit
        }
    finally:
        cursor.close()
        conn.close()

@api_router.get("/blog/posts/{slug}")
async def get_blog_post(slug: str):
    """Get a single blog post by slug"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.id, p.title, p.slug, p.excerpt, p.content, p.cover_image, 
                   p.author_name, p.published_at, p.views_count, p.allow_comments,
                   c.id as category_id, c.name as category_name, c.slug as category_slug
            FROM BlogPosts p
            LEFT JOIN BlogCategories c ON p.category_id = c.id
            WHERE p.slug = %s AND p.status = 'published'
        """, (slug,))
        r = cursor.fetchone()
        
        if not r:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        # Increment views
        cursor.execute("UPDATE BlogPosts SET views_count = views_count + 1 WHERE slug = %s", (slug,))
        conn.commit()
        
        # Get related products
        cursor.execute("""
            SELECT p.id, p.title, p.price, p.image, p.action_type, p.whatsapp_number
            FROM Products p
            INNER JOIN BlogPostProducts bp ON p.id = bp.product_id
            WHERE bp.post_id = %s
        """, (r[0],))
        products = [{
            "id": pr[0],
            "title": pr[1],
            "price": float(pr[2]),
            "image": pr[3],
            "actionType": pr[4] or 'buy',
            "whatsappNumber": pr[5]
        } for pr in cursor.fetchall()]
        
        return {
            "id": r[0],
            "title": r[1],
            "slug": r[2],
            "excerpt": r[3],
            "content": r[4],
            "coverImage": r[5],
            "author": r[6],
            "publishedAt": r[7].isoformat() if r[7] else None,
            "views": r[8] + 1,
            "allowComments": bool(r[9]),
            "category": {
                "id": r[10],
                "name": r[11],
                "slug": r[12]
            } if r[10] else None,
            "relatedProducts": products
        }
    finally:
        cursor.close()
        conn.close()

@api_router.get("/blog/posts/{slug}/comments")
async def get_post_comments(slug: str):
    """Get approved comments for a post"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT c.id, c.author_name, c.content, c.created_at
            FROM BlogComments c
            INNER JOIN BlogPosts p ON c.post_id = p.id
            WHERE p.slug = %s AND c.status = 'approved'
            ORDER BY c.created_at DESC
        """, (slug,))
        return [{
            "id": r[0],
            "author": r[1],
            "content": r[2],
            "date": r[3].isoformat() if r[3] else None
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

class BlogCommentCreate(BaseModel):
    author_name: str
    author_email: Optional[str] = None
    content: str

@api_router.post("/blog/posts/{slug}/comments")
async def create_comment(slug: str, comment: BlogCommentCreate):
    """Create a new comment on a post"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Get post id and check if comments allowed
        cursor.execute("""
            SELECT id, allow_comments FROM BlogPosts WHERE slug = %s AND status = 'published'
        """, (slug,))
        post = cursor.fetchone()
        
        if not post:
            raise HTTPException(status_code=404, detail="Post não encontrado")
        
        if not post[1]:
            raise HTTPException(status_code=400, detail="Comentários não permitidos neste post")
        
        cursor.execute("""
            INSERT INTO BlogComments (post_id, author_name, author_email, content, status)
            VALUES (%s, %s, %s, %s, 'pending')
        """, (post[0], comment.author_name, comment.author_email, comment.content))
        conn.commit()
        
        return {"message": "Comentário enviado e aguardando aprovação"}
    finally:
        cursor.close()
        conn.close()

@api_router.get("/blog/recent")
async def get_recent_posts(limit: int = 5):
    """Get recent posts for sidebar/widgets"""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT TOP %s p.id, p.title, p.slug, p.cover_image, p.published_at
            FROM BlogPosts p
            WHERE p.status = 'published'
            ORDER BY p.published_at DESC
        """, (limit,))
        return [{
            "id": r[0],
            "title": r[1],
            "slug": r[2],
            "coverImage": r[3],
            "publishedAt": r[4].isoformat() if r[4] else None
        } for r in cursor.fetchall()]
    finally:
        cursor.close()
        conn.close()

# Include the router in the main app
app.include_router(api_router)
app.include_router(admin_router)

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
    init_admin_table()
    logger.info("Server started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Server shutting down")
