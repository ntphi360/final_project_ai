import json

from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.department import Department
from app.models.department_field import DepartmentField
from app.models.field import Field
from app.models.procedure import Procedure
from app.services.case_relation_service import normalizeRelationText


DEPARTMENT_NAMES = (
    "Văn phòng HĐND&UBND",
    "Phòng Kinh tế, hạ tầng và đô thị",
    "Phòng Văn hoá - Xã hội",
)

FIELD_NAMES = (
    "Hộ tịch",
    "Chứng thực",
    "Tư pháp",
    "Đất đai",
    "Thành lập và hoạt động của hộ kinh doanh",
    "Bảo trợ xã hội",
)

PROCEDURE_MAPPINGS = (
    (
        "Đăng ký thành lập hộ kinh doanh",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),
    ("Đăng ký khai tử", "Hộ tịch"),
    ("Cấp bản sao Trích lục hộ tịch", "Hộ tịch"),
    ("Thủ tục cấp Giấy xác nhận tình trạng hôn nhân", "Hộ tịch"),
    (
        "Hỗ trợ chi phí mai táng cho đối tượng bảo trợ xã hội",
        "Bảo trợ xã hội",
    ),
    ("Chứng thực bản sao từ bản chính", "Chứng thực"),
    ("Đăng ký biến động đất đai", "Đất đai"),
)

DEPARTMENT_FIELD_MAPPINGS = (
    ("Văn phòng HĐND&UBND", "Hộ tịch"),
    ("Văn phòng HĐND&UBND", "Chứng thực"),
    ("Văn phòng HĐND&UBND", "Tư pháp"),
    ("Phòng Kinh tế, hạ tầng và đô thị", "Đất đai"),
    (
        "Phòng Kinh tế, hạ tầng và đô thị",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),
    ("Phòng Văn hoá - Xã hội", "Bảo trợ xã hội"),
)


def seedCatalog(db: Session) -> dict[str, int]:
    try:
        departmentsByName = {
            normalizeRelationText(department.name): department
            for department in db.scalars(select(Department))
        }
        fieldsByName = {
            normalizeRelationText(field.name): field
            for field in db.scalars(select(Field))
        }

        departmentsCreated = 0
        fieldsCreated = 0
        proceduresCreated = 0
        departmentFieldsCreated = 0

        for departmentName in DEPARTMENT_NAMES:
            normalizedName = normalizeRelationText(departmentName)
            if normalizedName not in departmentsByName:
                department = Department(name=departmentName)
                db.add(department)
                departmentsByName[normalizedName] = department
                departmentsCreated += 1

        for fieldName in FIELD_NAMES:
            normalizedName = normalizeRelationText(fieldName)
            if normalizedName not in fieldsByName:
                field = Field(name=fieldName)
                db.add(field)
                fieldsByName[normalizedName] = field
                fieldsCreated += 1

        db.flush()

        existingProcedureKeys = {
            (procedure.field_id, normalizeRelationText(procedure.name))
            for procedure in db.scalars(select(Procedure))
        }
        for procedureName, fieldName in PROCEDURE_MAPPINGS:
            field = fieldsByName[normalizeRelationText(fieldName)]
            procedureKey = (
                field.id,
                normalizeRelationText(procedureName),
            )
            if procedureKey not in existingProcedureKeys:
                db.add(
                    Procedure(
                        name=procedureName,
                        field_id=field.id,
                    )
                )
                existingProcedureKeys.add(procedureKey)
                proceduresCreated += 1

        existingDepartmentFieldKeys = {
            (row.department_id, row.field_id)
            for row in db.execute(
                select(
                    DepartmentField.department_id,
                    DepartmentField.field_id,
                )
            )
        }
        for departmentName, fieldName in DEPARTMENT_FIELD_MAPPINGS:
            department = departmentsByName[
                normalizeRelationText(departmentName)
            ]
            field = fieldsByName[normalizeRelationText(fieldName)]
            assignmentKey = (department.id, field.id)
            if assignmentKey not in existingDepartmentFieldKeys:
                db.add(
                    DepartmentField(
                        department_id=department.id,
                        field_id=field.id,
                    )
                )
                existingDepartmentFieldKeys.add(assignmentKey)
                departmentFieldsCreated += 1

        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise

    return {
        "departments_created": departmentsCreated,
        "fields_created": fieldsCreated,
        "procedures_created": proceduresCreated,
        "department_fields_created": departmentFieldsCreated,
    }


def main() -> None:
    db = SessionLocal()
    try:
        summary = seedCatalog(db)
        print(json.dumps(summary, ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    main()
