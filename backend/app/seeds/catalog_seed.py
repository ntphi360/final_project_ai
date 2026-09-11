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
    "Giáo dục",
    "Quy hoạch xây dựng, kiến trúc",
    "Hoạt động xây dựng",
)


PROCEDURE_MAPPINGS = (
    # Hộ kinh doanh
    (
        "Đăng ký thành lập hộ kinh doanh",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),
    (
        "Đăng ký thay đổi nội dung đăng ký hộ kinh doanh",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),
    (
        "Chấm dứt hoạt động hộ kinh doanh",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),

    # Hộ tịch
    (
        "Đăng ký khai tử",
        "Hộ tịch",
    ),
    (
        "Cấp bản sao Trích lục hộ tịch",
        "Hộ tịch",
    ),
    (
        "Thủ tục cấp Giấy xác nhận tình trạng hôn nhân",
        "Hộ tịch",
    ),
    (
        "Đăng ký lại khai sinh",
        "Hộ tịch",
    ),
    (
        "Đăng ký khai tử có yếu tố nước ngoài",
        "Hộ tịch",
    ),
    (
        "Thủ tục thay đổi, cải chính, bổ sung thông tin hộ tịch",
        "Hộ tịch",
    ),
    (
        "Đăng ký kết hôn",
        "Hộ tịch",
    ),
    (
        "Thủ tục đăng ký kết hôn có yếu tố nước ngoài",
        "Hộ tịch",
    ),
    (
        "Thủ tục đăng ký khai sinh",
        "Hộ tịch",
    ),
    (
        "Đăng ký lại kết hôn",
        "Hộ tịch",
    ),
    (
        "Liên thông thủ tục hành chính về đăng ký khai sinh, đăng ký thường trú, "
        "cấp thẻ bảo hiểm y tế cho trẻ em dưới 6 tuổi",
        "Hộ tịch",
    ),
    (
        "Liên thông đăng ký khai tử, xóa đăng ký thường trú",
        "Hộ tịch",
    ),

    # Chứng thực
    (
        "Chứng thực bản sao từ bản chính giấy tờ, văn bản do cơ quan tổ chức "
        "có thẩm quyền của Việt Nam cấp hoặc chứng nhận",
        "Chứng thực",
    ),
    (
        "Chứng thực chữ ký trong các giấy tờ, văn bản "
        "(thủ tục này cũng được áp dụng trong trường hợp chứng thực điểm chỉ "
        "khi người yêu cầu chứng thực chữ ký không ký được và trường hợp "
        "người yêu cầu chứng thực không thể ký, điểm chỉ được).",
        "Chứng thực",
    ),

    # Bảo trợ xã hội
    (
        "Hỗ trợ chi phí mai táng cho đối tượng bảo trợ xã hội",
        "Bảo trợ xã hội",
    ),
    (
        "Thực hiện, điều chỉnh, thôi hưởng trợ cấp hưu trí xã hội",
        "Bảo trợ xã hội",
    ),

    # Quy hoạch xây dựng
    (
        "Cung cấp thông tin về quy hoạch xây dựng thuộc thẩm quyền của UBND cấp xã",
        "Quy hoạch xây dựng, kiến trúc",
    ),

    # Hoạt động xây dựng
    (
        "Cấp giấy phép xây dựng mới đối với công trình cấp III, cấp IV "
        "(Công trình không theo tuyến/Theo tuyến trong đô thị/Tín ngưỡng, "
        "tôn giáo/Tượng đài, tranh hoành tráng/Theo giai đoạn cho công trình "
        "không theo tuyến/Theo giai đoạn cho công trình theo tuyến trong đô thị/"
        "Dự án) và nhà ở riêng lẻ",
        "Hoạt động xây dựng",
    ),
    (
        "Gia hạn giấy phép xây dựng đối với công trình cấp III, cấp IV "
        "(công trình Không theo tuyến/Theo tuyến trong đô thị/Tín ngưỡng, "
        "tôn giáo/Tượng đài, tranh hoành tráng/Sửa chữa, cải tạo/"
        "Theo giai đoạn cho công trình không theo tuyến/"
        "Theo giai đoạn cho công trình theo tuyến trong đô thị/Dự án) "
        "và nhà ở riêng lẻ",
        "Hoạt động xây dựng",
    ),

    # Đất đai
    (
        "Đăng ký đất đai, tài sản gắn liền với đất, cấp Giấy chứng nhận "
        "quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất lần đầu "
        "đối với hộ gia đình, cá nhân, cộng đồng dân cư, người gốc Việt Nam "
        "định cư ở nước ngoài",
        "Đất đai",
    ),
    (
        "Đính chính Giấy chứng nhận đã cấp lần đầu có sai sót",
        "Đất đai",
    ),
    (
        "Thu hồi Giấy chứng nhận đã cấp không đúng quy định của pháp luật "
        "đất đai do người sử dụng đất, chủ sở hữu tài sản gắn liền với đất "
        "phát hiện và cấp lại Giấy chứng nhận sau khi thu hồi",
        "Đất đai",
    ),
    (
        "Hòa giải tranh chấp đất đai",
        "Đất đai",
    ),
    (
        "Giao đất, cho thuê đất, chuyển mục đích sử dụng đất đối với trường hợp "
        "giao đất, cho thuê đất không đấu giá quyền sử dụng đất, không đấu thầu "
        "lựa chọn nhà đầu tư thực hiện dự án có sử dụng đất; trường hợp giao đất, "
        "cho thuê đất thông qua đấu thầu lựa chọn nhà đầu tư thực hiện dự án có "
        "sử dụng đất; giao đất và giao rừng; cho thuê đất và cho thuê rừng, "
        "gia hạn sử dụng đất khi hết thời hạn sử dụng đất",
        "Đất đai",
    ),
)


DEPARTMENT_FIELD_MAPPINGS = (
    # Văn phòng HĐND&UBND
    (
        "Văn phòng HĐND&UBND",
        "Hộ tịch",
    ),
    (
        "Văn phòng HĐND&UBND",
        "Chứng thực",
    ),
    (
        "Văn phòng HĐND&UBND",
        "Tư pháp",
    ),

    # Phòng Kinh tế, hạ tầng và đô thị
    (
        "Phòng Kinh tế, hạ tầng và đô thị",
        "Đất đai",
    ),
    (
        "Phòng Kinh tế, hạ tầng và đô thị",
        "Thành lập và hoạt động của hộ kinh doanh",
    ),
    (
        "Phòng Kinh tế, hạ tầng và đô thị",
        "Quy hoạch xây dựng, kiến trúc",
    ),
    (
        "Phòng Kinh tế, hạ tầng và đô thị",
        "Hoạt động xây dựng",
    ),

    # Phòng Văn hoá - Xã hội
    (
        "Phòng Văn hoá - Xã hội",
        "Bảo trợ xã hội",
    ),
    (
        "Phòng Văn hoá - Xã hội",
        "Giáo dục",
    ),
)


def seedCatalog(db: Session) -> dict[str, int]:
    try:
        departmentsByName = {
            normalizeRelationText(department.name): department
            for department in db.scalars(
                select(Department)
            )
        }

        fieldsByName = {
            normalizeRelationText(field.name): field
            for field in db.scalars(
                select(Field)
            )
        }

        departmentsCreated = 0
        fieldsCreated = 0
        proceduresCreated = 0
        departmentFieldsCreated = 0

        # Seed phòng ban
        for departmentName in DEPARTMENT_NAMES:
            normalizedName = normalizeRelationText(
                departmentName
            )

            if normalizedName not in departmentsByName:
                department = Department(
                    name=departmentName
                )

                db.add(department)

                departmentsByName[
                    normalizedName
                ] = department

                departmentsCreated += 1

        # Seed lĩnh vực
        for fieldName in FIELD_NAMES:
            normalizedName = normalizeRelationText(
                fieldName
            )

            if normalizedName not in fieldsByName:
                field = Field(
                    name=fieldName
                )

                db.add(field)

                fieldsByName[
                    normalizedName
                ] = field

                fieldsCreated += 1

        # Lấy id cho record vừa tạo
        db.flush()

        # Seed thủ tục hành chính
        existingProcedureKeys = {
            (
                procedure.field_id,
                normalizeRelationText(
                    procedure.name
                ),
            )
            for procedure in db.scalars(
                select(Procedure)
            )
        }

        for procedureName, fieldName in PROCEDURE_MAPPINGS:
            field = fieldsByName[
                normalizeRelationText(
                    fieldName
                )
            ]

            procedureKey = (
                field.id,
                normalizeRelationText(
                    procedureName
                ),
            )

            if procedureKey not in existingProcedureKeys:
                procedure = Procedure(
                    name=procedureName,
                    field_id=field.id,
                )

                db.add(procedure)

                existingProcedureKeys.add(
                    procedureKey
                )

                proceduresCreated += 1

        # Seed phân công phòng ban - lĩnh vực
        existingDepartmentFieldKeys = {
            (
                row.department_id,
                row.field_id,
            )
            for row in db.execute(
                select(
                    DepartmentField.department_id,
                    DepartmentField.field_id,
                )
            )
        }

        for (
            departmentName,
            fieldName,
        ) in DEPARTMENT_FIELD_MAPPINGS:

            department = departmentsByName[
                normalizeRelationText(
                    departmentName
                )
            ]

            field = fieldsByName[
                normalizeRelationText(
                    fieldName
                )
            ]

            assignmentKey = (
                department.id,
                field.id,
            )

            if assignmentKey not in existingDepartmentFieldKeys:
                assignment = DepartmentField(
                    department_id=department.id,
                    field_id=field.id,
                )

                db.add(assignment)

                existingDepartmentFieldKeys.add(
                    assignmentKey
                )

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

        print(
            json.dumps(
                summary,
                ensure_ascii=False,
            )
        )

    finally:
        db.close()


if __name__ == "__main__":
    main()