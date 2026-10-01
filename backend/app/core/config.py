import os

class Settings:
    PROJECT_NAME: str = "eRTMAC-NWIS (Nearby Wells Intelligence System)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "nwis-super-secret-development-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nwis_foundation.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEMO_MODE_ENABLED: bool = True

settings = Settings()
