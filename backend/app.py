import os
import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from decimal import Decimal
from typing import List
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import random
from psycopg2 import sql

app = FastAPI()

# --- CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    # Allow all origins for local development so the frontend can reach the API
    # You can restrict this to specific origins in production (e.g. ['http://localhost:5173'])
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURATION ---
# Read the variables (Default to None or raise error if missing)
lh_url = os.getenv("LH_DB_URL")
pgd_url = os.getenv("PGD_DB_URL")

# Schema name for fully-qualified table references (default to public)
SCHEMA_NAME = os.getenv("SCHEMA_NAME", "public")

# --- DATA MODEL ---
class TransactionStats(BaseModel):
    total_count: int
    count_last_hour: int
    total_revenue: Decimal
    
# Define a new model for the list items
class ChartDataPoint(BaseModel):
    minute_bucket: datetime
    transaction_count: int
    
# Input model - All fields are optional (= None)
class TransactionInput(BaseModel):
    user_id: int = None
    amount: Decimal = None
    transaction_type: str = None

@app.get("/")
def root():
    return {"message": "Connected to Remote DB. Check /stats"}

@app.get("/stats", response_model=TransactionStats)
def get_transaction_stats():
    """
    Connects to remote Postgres, runs the aggregation query,
    and returns the live results.
    """
    try:
        if not lh_url:
            raise ValueError("LH_DB_URL is not set!")
        # We use a context manager (with...) to ensure the connection closes automatically
        with psycopg2.connect(lh_url) as conn:
            
            # Use RealDictCursor to access columns by name
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                
                # Build a schema-qualified table identifier safely
                table_ident = sql.Identifier(SCHEMA_NAME, 'transactions')

                query = sql.SQL("""
                SELECT 
                    -- 1. Total transaction count
                    COUNT(*) AS total_count,

                    -- 2. Transactions received during the last hour
                    COUNT(CASE 
                        WHEN created_at >= CURRENT_TIMESTAMP - INTERVAL '1' HOUR 
                        THEN 1 
                    END) AS count_last_hour,

                    -- 3. Total revenue (COALESCE handles NULL if table is empty)
                    COALESCE(SUM(amount), 0) AS total_revenue

                FROM {}
                """).format(table_ident)

                cur.execute(query)
                result = cur.fetchone()
                
                if not result:
                    # Should not happen with aggregation queries, but good practice
                    raise HTTPException(status_code=404, detail="No data found")
                
                return result

    except psycopg2.Error as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

@app.get("/chart-data", response_model=List[ChartDataPoint])
def get_chart_data():
    try:
        with psycopg2.connect(lh_url) as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                table_ident = sql.Identifier(SCHEMA_NAME, 'transactions')

                query = sql.SQL("""
                SELECT
                    date_trunc('minute', time_spine) AS minute_bucket,
                    COUNT(t.id) AS transaction_count
                FROM 
                    generate_series(
                        date_trunc('minute', NOW()) - INTERVAL '1 hour',
                        date_trunc('minute', NOW()),
                        INTERVAL '1 minute'
                    ) AS time_spine
                LEFT JOIN 
                    {} t 
                    ON date_trunc('minute', t.created_at) = date_trunc('minute', time_spine)
                GROUP BY 1
                ORDER BY 1 ASC;
                """).format(table_ident)

                cur.execute(query)
                return cur.fetchall()

    except psycopg2.Error as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Database query failed")
    
@app.post("/transactions", status_code=201)
def create_transaction(txn: TransactionInput):
    """
    Creates a new transaction. 
    If fields are missing, generates random data to fill the gaps.
    """
    try:
        # 1. Logic: Use provided value OR generate random fallback
        user_id = txn.user_id if txn.user_id else random.randint(1, 1000)
        
        # Random amount between 1.00 and 500.00 if missing
        amount = txn.amount if txn.amount is not None else Decimal(random.uniform(1, 500)).quantize(Decimal("0.01"))
        
        # Random type if missing
        if txn.transaction_type:
            t_type = txn.transaction_type
        else:
            t_type = 'credit' if random.random() > 0.5 else 'debit'

        # 2. Database Insert
        with psycopg2.connect(pgd_url) as conn:
            with conn.cursor() as cur:
                table_ident = sql.Identifier(SCHEMA_NAME, 'transactions')
                insert_query = sql.SQL("""
                INSERT INTO {} (user_id, amount, transaction_type)
                VALUES (%s, %s, %s)
                RETURNING id, created_at;
                """).format(table_ident)
                # Execute the insert
                cur.execute(insert_query, (user_id, amount, t_type))
                
                # Fetch the auto-generated ID and Timestamp
                new_id, new_created_at = cur.fetchone()
                
                # IMPORTANT: Commit the transaction!
                conn.commit()

        # 3. Return the created object
        return {
            "message": "Transaction created successfully",
            "id": new_id,
            "user_id": user_id,
            "amount": amount,
            "transaction_type": t_type,
            "created_at": new_created_at
        }

    except psycopg2.Error as e:
        print(f"Database Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to insert transaction")