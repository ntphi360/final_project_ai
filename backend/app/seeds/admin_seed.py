from sqlalchemy import func, select

from app.config import settings
from app.core.security import hashPassword
from app.database.database import SessionLocal
from app.models.officer import Officer
from app.models.user import User, UserRole


def seed_admin() -> None:
    if not settings.admin_email or not settings.admin_password or not settings.admin_name:
        raise RuntimeError("Cần cấu hình ADMIN_NAME, ADMIN_EMAIL và ADMIN_PASSWORD trong .env")

    db = SessionLocal()
    try:
        email = settings.admin_email.strip().lower()
        existing = db.scalar(select(User).where(func.lower(User.email) == email))
        if existing is not None:
            print("Tài khoản admin đã tồn tại, bỏ qua.")
            return

        officer = db.scalar(select(Officer).where(func.lower(Officer.email) == email))
        if officer is None:
            officer = db.scalar(select(Officer).where(Officer.full_name == settings.admin_name.strip()))
        if officer is None:
            officer = Officer(
                full_name=settings.admin_name.strip(),
                email=email,
                phone_number=settings.admin_phone,
                is_active=True,
            )
            db.add(officer)
            db.flush()

        db.add(
            User(
                full_name=settings.admin_name.strip(),
                email=email,
                phone_number=settings.admin_phone,
                password_hash=hashPassword(settings.admin_password),
                role=UserRole.ADMIN.value,
                is_active=True,
                officer_id=officer.id,
            )
        )
        db.commit()
        print("Đã tạo tài khoản admin.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()
