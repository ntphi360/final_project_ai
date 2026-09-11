import json

from app.database.database import SessionLocal
from app.services.case_relation_service import backfillCaseRelations


def main() -> None:
    db = SessionLocal()
    try:
        summary = backfillCaseRelations(db)
        print(json.dumps(summary, ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    main()
