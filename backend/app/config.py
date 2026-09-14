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
    mail_username: str | None = None
    mail_password: str | None = None
    mail_from: str | None = None
    mail_from_name: str = "Hệ thống AI cảnh báo hồ sơ"
    mail_server: str = "smtp.gmail.com"
    mail_port: int = 587
    mail_starttls: bool = True
    mail_ssl_tls: bool = False
    mail_use_credentials: bool = True
    mail_validate_certs: bool = True
    textbee_api_key: str | None = None
    textbee_base_url: str = "https://api.textbee.dev/api/v1"
    textbee_device_id: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
