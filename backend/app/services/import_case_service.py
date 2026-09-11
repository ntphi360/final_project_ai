import importlib.util
import re
from zipfile import BadZipFile
from datetime import datetime
from pathlib import Path
from typing import Any, BinaryIO

import pandas as pd
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models.case import Case
from app.schemas.import_case import ImportCaseResult
from app.services.case_relation_service import (
    loadCaseRelationLookups,
    normalizeRelationText,
    resolveDepartment,
    resolveOfficer,
    resolveProcedure,
)


COLUMN_MAPPING = {
    "Số hồ sơ": "case_code",
    "Tên thủ tục hành chính": "procedure_name",
    "Tên lĩnh vực": "field_name",
    "Phòng ban": "department_name",
    "Ngày tiếp nhận": "received_at",
    "Ngày hẹn trả": "deadline_at",
    "Ngày kết thúc xử lý": "completed_at",
    "Cơ quan/đơn vị": "agency_name",
    "Chủ hồ sơ": "applicant_name",
    "Số điện thoại": "phone_number",
    "Cán bộ xử lý hiện tại": "officer_name",
    "Trạng thái hồ sơ": "status",
}

REQUIRED_COLUMNS = (
    "Số hồ sơ",
    "Tên thủ tục hành chính",
    "Tên lĩnh vực",
    "Phòng ban",
    "Ngày tiếp nhận",
    "Ngày hẹn trả",
    "Trạng thái hồ sơ",
)

REQUIRED_TEXT_FIELDS = (
    "case_code",
    "procedure_name",
    "field_name",
    "department_name",
    "status",
)

TEXT_FIELDS = (
    "case_code",
    "procedure_name",
    "field_name",
    "department_name",
    "agency_name",
    "applicant_name",
    "officer_name",
    "status",
)

TEXT_LENGTH_LIMITS = {
    "case_code": 100,
    "procedure_name": 255,
    "field_name": 255,
    "department_name": 255,
    "agency_name": 255,
    "applicant_name": 255,
    "phone_number": 20,
    "officer_name": 255,
    "status": 100,
}


class ImportCaseValidationError(Exception):
    def __init__(self, detail: str | dict[str, Any]):
        self.detail = detail
        super().__init__(str(detail))


class ImportCaseDatabaseError(Exception):
    pass


def normalizeColumnName(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value)).strip()


def normalizeText(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None

    normalized = re.sub(r"\s+", " ", str(value)).strip()
    return normalized or None


def normalizePhoneNumber(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None

    if isinstance(value, bool):
        return str(value)

    if isinstance(value, int):
        return str(value)

    if isinstance(value, float):
        if value.is_integer():
            return str(int(value))
        return format(value, "f").rstrip("0").rstrip(".")

    normalized = re.sub(r"\s+", "", str(value).strip())
    if re.fullmatch(r"[+-]?\d+\.0+", normalized):
        normalized = normalized[: normalized.index(".")]
    return normalized or None


def parseDateTime(value: Any, required: bool) -> datetime | None:
    if value is None or pd.isna(value) or normalizeText(value) is None:
        if required:
            raise ValueError("Thiếu datetime bắt buộc")
        return None

    parsed = pd.to_datetime(value, dayfirst=True, errors="coerce")
    if pd.isna(parsed):
        raise ValueError("Datetime không hợp lệ")

    if isinstance(parsed, pd.Timestamp):
        return parsed.to_pydatetime()
    if isinstance(parsed, datetime):
        return parsed
    raise ValueError("Datetime không hợp lệ")


def readUploadedFile(file: UploadFile) -> pd.DataFrame:
    extension = Path(file.filename or "").suffix.lower()
    supportedExtensions = {".csv", ".xlsx"}

    if extension == ".xls" and importlib.util.find_spec("xlrd") is None:
        raise ImportCaseValidationError(
            "Định dạng .xls chưa được hỗ trợ trong môi trường hiện tại; vui lòng dùng CSV hoặc XLSX"
        )

    if extension not in supportedExtensions and extension != ".xls":
        raise ImportCaseValidationError("Chỉ hỗ trợ file CSV hoặc Excel")

    try:
        file.file.seek(0)
        source: BinaryIO = file.file
        if extension == ".csv":
            dataFrame = pd.read_csv(source, dtype=str, keep_default_na=False)
        else:
            dataFrame = pd.read_excel(source, dtype=object)
    except (
        BadZipFile,
        ImportError,
        OSError,
        TypeError,
        UnicodeError,
        ValueError,
        pd.errors.ParserError,
    ) as exc:
        raise ImportCaseValidationError(
            "Không thể đọc file CSV hoặc Excel; vui lòng kiểm tra định dạng file"
        ) from exc

    if dataFrame.empty and len(dataFrame.columns) == 0:
        raise ImportCaseValidationError("File không có dữ liệu hoặc không có header")

    return dataFrame


def normalizeAndValidateColumns(dataFrame: pd.DataFrame) -> pd.DataFrame:
    normalizedColumns = [normalizeColumnName(column) for column in dataFrame.columns]
    dataFrame = dataFrame.copy()
    dataFrame.columns = normalizedColumns

    # Nếu header sau khi chuẩn hóa bị trùng, cột xuất hiện sau cùng được ưu tiên.
    dataFrame = dataFrame.loc[:, ~dataFrame.columns.duplicated(keep="last")]

    missingColumns = [
        column for column in REQUIRED_COLUMNS if column not in dataFrame.columns
    ]
    if missingColumns:
        raise ImportCaseValidationError(
            {
                "message": "File thiếu cột bắt buộc",
                "missing_columns": missingColumns,
            }
        )

    availableMapping = {
        source: target
        for source, target in COLUMN_MAPPING.items()
        if source in dataFrame.columns
    }
    return dataFrame.rename(columns=availableMapping)[list(availableMapping.values())]


def convertRow(row: pd.Series) -> dict[str, Any]:
    caseData: dict[str, Any] = {}

    for field in TEXT_FIELDS:
        caseData[field] = normalizeText(row.get(field))

    caseData["phone_number"] = normalizePhoneNumber(row.get("phone_number"))
    caseData["received_at"] = parseDateTime(row.get("received_at"), required=True)
    caseData["deadline_at"] = parseDateTime(row.get("deadline_at"), required=True)
    caseData["completed_at"] = parseDateTime(row.get("completed_at"), required=False)

    if any(caseData[field] is None for field in REQUIRED_TEXT_FIELDS):
        raise ValueError("Thiếu dữ liệu text bắt buộc")

    for field, maxLength in TEXT_LENGTH_LIMITS.items():
        value = caseData.get(field)
        if value is not None and len(value) > maxLength:
            raise ValueError(f"Dữ liệu {field} vượt quá {maxLength} ký tự")

    return caseData


def getExistingCases(db: Session, caseCodes: list[str]) -> dict[str, Case]:
    existingCases: dict[str, Case] = {}
    chunkSize = 1000

    for start in range(0, len(caseCodes), chunkSize):
        chunk = caseCodes[start : start + chunkSize]
        statement = select(Case).where(Case.case_code.in_(chunk))
        existingCases.update({case.case_code: case for case in db.scalars(statement)})

    return existingCases


def importCases(db: Session, file: UploadFile) -> ImportCaseResult:
    dataFrame = normalizeAndValidateColumns(readUploadedFile(file))
    totalRecords = len(dataFrame.index)
    errorRecords = 0
    recordsByCaseCode: dict[str, dict[str, Any]] = {}

    for _, row in dataFrame.iterrows():
        try:
            caseData = convertRow(row)
            # Gán lại cùng key để record xuất hiện sau cùng trong file được ưu tiên.
            recordsByCaseCode[caseData["case_code"]] = caseData
        except (TypeError, ValueError):
            errorRecords += 1

    insertedRecords = 0
    updatedRecords = 0
    completedRecords = 0
    processingRecords = 0
    unmappedRelationRecords = 0
    fieldMismatchRecords = 0

    try:
        existingCases = getExistingCases(db, list(recordsByCaseCode))
        relationLookups = loadCaseRelationLookups(db)
        now = datetime.now()

        for caseCode, caseData in recordsByCaseCode.items():
            procedure = resolveProcedure(
                relationLookups,
                procedureName=caseData["procedure_name"],
                fieldName=caseData["field_name"],
            )
            department = resolveDepartment(
                relationLookups,
                departmentName=caseData["department_name"],
            )
            officer = resolveOfficer(
                relationLookups,
                officerName=caseData["officer_name"],
            )

            caseData["procedure_id"] = (
                procedure.id if procedure is not None else None
            )
            caseData["department_id"] = (
                department.id if department is not None else None
            )
            caseData["officer_id"] = (
                officer.id if officer is not None else None
            )

            officerExpected = (
                normalizeRelationText(caseData["officer_name"])
                is not None
            )
            if (
                procedure is None
                or department is None
                or (officerExpected and officer is None)
            ):
                unmappedRelationRecords += 1

            if (
                procedure is not None
                and normalizeRelationText(caseData["field_name"])
                != normalizeRelationText(procedure.field.name)
            ):
                fieldMismatchRecords += 1

            existingCase = existingCases.get(caseCode)
            if existingCase is None:
                db.add(Case(**caseData))
                insertedRecords += 1
            else:
                for field, value in caseData.items():
                    setattr(existingCase, field, value)
                existingCase.updated_at = now
                updatedRecords += 1

            if caseData["completed_at"] is None:
                processingRecords += 1
            else:
                completedRecords += 1

        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise ImportCaseDatabaseError("Không thể lưu dữ liệu hồ sơ vào database") from exc

    return ImportCaseResult(
        total_records=totalRecords,
        inserted_records=insertedRecords,
        updated_records=updatedRecords,
        error_records=errorRecords,
        completed_records=completedRecords,
        processing_records=processingRecords,
        unmapped_relation_records=unmappedRelationRecords,
        field_mismatch_records=fieldMismatchRecords,
    )
