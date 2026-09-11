from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.field import Field
from app.models.officer import Officer
from app.models.officer_field import OfficerField


OFFICER_FIELD_MAPPINGS = {
    "Lê Ngọc Sang": [
        "Bảo trợ xã hội",
        "Giáo dục",
    ],
    "Hồ Hữu Phước": [
        "Đất đai",
    ],
    "Trần Thiện Yến Xuân": [
        "Thành lập và hoạt động của hộ kinh doanh",
    ],
    "Dương Thị Đào": [
        "Hộ tịch",
        "Chứng thực",
    ],
    "Trần Thị Yến Nhung": [
        "Tư pháp",
        "Hộ tịch",
    ],
}


def seed_officers() -> None:
    db = SessionLocal()

    try:
        officers_created = 0
        officer_fields_created = 0

        for officer_name, field_names in OFFICER_FIELD_MAPPINGS.items():
            officer = db.scalar(
                select(Officer).where(Officer.full_name == officer_name)
            )

            if officer is None:
                officer = Officer(
                    full_name=officer_name,
                    email=None,
                    phone_number=None,
                    is_active=True,
                )

                db.add(officer)
                db.flush()

                officers_created += 1

            for field_name in field_names:
                field = db.scalar(
                    select(Field).where(Field.name == field_name)
                )

                if field is None:
                    print(f"Không tìm thấy lĩnh vực: {field_name}")
                    continue

                existing_mapping = db.scalar(
                    select(OfficerField).where(
                        OfficerField.officer_id == officer.id,
                        OfficerField.field_id == field.id,
                    )
                )

                if existing_mapping is not None:
                    continue

                db.add(
                    OfficerField(
                        officer_id=officer.id,
                        field_id=field.id,
                    )
                )

                officer_fields_created += 1

        db.commit()

        print(
            {
                "officers_created": officers_created,
                "officer_fields_created": officer_fields_created,
            }
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_officers()