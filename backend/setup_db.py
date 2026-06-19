from app.database import engine, Base
from app.models import Application
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from .env
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:Angelin%40123@localhost:5432/interview_tracker")

print("=" * 60)
print("Setting up Tech Interview Tracker Database")
print("=" * 60)

# 1. Create database if it doesn't exist
try:
    print("\n1. Checking database...")
    conn = psycopg2.connect(
        host="localhost",
        port="5432",
        user="postgres",
        password="Angelin@123",
        database="postgres"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    cursor.execute("SELECT 1 FROM pg_database WHERE datname='interview_tracker'")
    exists = cursor.fetchone()
    
    if not exists:
        cursor.execute("CREATE DATABASE interview_tracker")
        print("   ? Created database 'interview_tracker'")
    else:
        print("   ? Database 'interview_tracker' already exists")
    
    cursor.close()
    conn.close()
    
except Exception as e:
    print(f"   ? Database connection error: {e}")
    print("   Make sure PostgreSQL is running and credentials are correct")
    exit()

# 2. Create tables
try:
    print("\n2. Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("   ? Tables created successfully!")
    
except Exception as e:
    print(f"   ? Error creating tables: {e}")
    exit()

print("\n" + "=" * 60)
print("? Setup Complete!")
print("=" * 60)

print("\n?? Database: interview_tracker")
print("?? Tables: applications")
print("\n?? Next steps:")
print("   1. Start the server: uvicorn app.main:app --reload --port 8000")
print("   2. Open Swagger UI: http://localhost:8000/docs")
print("   3. Create your first application!")
