from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_server: str
    db_name: str
    db_user: str
    db_password: str
    db_driver: str
    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    admin_name: str | None = None
    admin_email: str | None = None
    admin_password: str | None = None
    admin_phone: str | None = None
    resend_api_key: str | None = None
    resend_from_email: str | None = None
    textbee_api_key: str | None = None
    textbee_base_url: str = "https://api.textbee.dev/api/v1"
    textbee_device_id: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
