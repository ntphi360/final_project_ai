from urllib.parse import quote_plus

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings


odbcConnection = (
    f"DRIVER={{{settings.db_driver}}};"
    f"SERVER={settings.db_server};"
    f"DATABASE={settings.db_name};"
    f"UID={settings.db_user};"
    f"PWD={settings.db_password};"
    f"TrustServerCertificate=yes;"
)

connectionString = (
    "mssql+pyodbc:///?odbc_connect="
    + quote_plus(odbcConnection)
)

engine = create_engine(
    connectionString,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def getDb():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()