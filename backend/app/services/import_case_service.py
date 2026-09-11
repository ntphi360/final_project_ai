import importlib.util
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any, BinaryIO
from zipfile import BadZipFile

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


DATETIME_FIELDS = (
    "received_at",
    "deadline_at",
    "completed_at",
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


def normalizeUnicode(value: Any) -> str:
    return unicodedata.normalize("NFC", str(value))


def normalizeColumnName(value: Any) -> str:
    value = normalizeUnicode(value)
    return re.sub(r"\s+", " ", value).strip()


def normalizeTextValue(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None

    value = normalizeUnicode(value)

    value = re.sub(
        r"\s+",
        " ",
        value,
    ).strip()

    return value or None


def normalizePhoneNumber(value: Any) -> str | None:
    if value is None or pd.isna(value):
        return None

    if isinstance(value, float) and value.is_integer():
        value = str(int(value))
    else:
        value = str(value)

    value = re.sub(
        r"\s+",
        "",
        value,
    ).strip()

    if re.fullmatch(r"[+-]?\d+\.0+", value):
        value = value[: value.index(".")]

    return value or None


def readUploadedFile(
    file: UploadFile,
) -> pd.DataFrame:

    extension = Path(
        file.filename or ""
    ).suffix.lower()

    if (
        extension == ".xls"
        and importlib.util.find_spec("xlrd") is None
    ):
        raise ImportCaseValidationError(
            "Định dạng .xls chưa được hỗ trợ; "
            "vui lòng sử dụng CSV hoặc XLSX"
        )

    if extension not in {
        ".csv",
        ".xlsx",
        ".xls",
    }:
        raise ImportCaseValidationError(
            "Chỉ hỗ trợ file CSV hoặc Excel"
        )

    try:
        file.file.seek(0)

        source: BinaryIO = file.file

        if extension == ".csv":
            dataFrame = pd.read_csv(
                source,
                dtype=str,
                keep_default_na=False,
                encoding="utf-8-sig",
            )

        else:
            dataFrame = pd.read_excel(
                source,
                dtype=object,
            )

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
            "Không thể đọc file CSV hoặc Excel; "
            "vui lòng kiểm tra định dạng file"
        ) from exc

    if dataFrame.empty and len(dataFrame.columns) == 0:
        raise ImportCaseValidationError(
            "File không có dữ liệu hoặc header"
        )

    return dataFrame


def prepareDataFrame(
    dataFrame: pd.DataFrame,
) -> pd.DataFrame:

    dataFrame = dataFrame.copy()

    # ================================
    # Chuẩn hóa tên cột
    # ================================

    dataFrame.columns = [
        normalizeColumnName(column)
        for column in dataFrame.columns
    ]

    # Nếu header trùng thì lấy cột sau cùng.
    dataFrame = dataFrame.loc[
        :,
        ~dataFrame.columns.duplicated(
            keep="last"
        ),
    ]

    missingColumns = [
        column
        for column in REQUIRED_COLUMNS
        if column not in dataFrame.columns
    ]

    if missingColumns:
        raise ImportCaseValidationError(
            {
                "message": "File thiếu cột bắt buộc",
                "missing_columns": missingColumns,
            }
        )

    # ================================
    # Rename cột bằng Pandas
    # ================================

    availableMapping = {
        source: target
        for source, target in COLUMN_MAPPING.items()
        if source in dataFrame.columns
    }

    dataFrame = dataFrame.rename(
        columns=availableMapping
    )

    dataFrame = dataFrame[
        list(availableMapping.values())
    ].copy()

    # ================================
    # Chuẩn hóa các cột text
    # ================================

    for column in TEXT_FIELDS:
        if column in dataFrame.columns:
            dataFrame[column] = (
                dataFrame[column]
                .map(normalizeTextValue)
            )

    # ================================
    # Số điện thoại
    # ================================

    if "phone_number" in dataFrame.columns:
        dataFrame["phone_number"] = (
            dataFrame["phone_number"]
            .map(normalizePhoneNumber)
        )

    # ================================
    # Datetime bằng Pandas
    # ================================

    for column in DATETIME_FIELDS:

        if column not in dataFrame.columns:
            dataFrame[column] = pd.NaT
            continue

        dataFrame[column] = pd.to_datetime(
            dataFrame[column],
            dayfirst=True,
            errors="coerce",
        )

    # ================================
    # Validate text bắt buộc
    # ================================

    invalidRequiredText = (
        dataFrame[
            list(REQUIRED_TEXT_FIELDS)
        ]
        .isna()
        .any(axis=1)
    )

    # ================================
    # Validate datetime bắt buộc
    # ================================

    invalidDateTime = (
        dataFrame["received_at"].isna()
        | dataFrame["deadline_at"].isna()
    )

    # ================================
    # Validate độ dài
    # ================================

    invalidLength = pd.Series(
        False,
        index=dataFrame.index,
    )

    for column, maxLength in (
        TEXT_LENGTH_LIMITS.items()
    ):
        if column not in dataFrame.columns:
            continue

        invalidLength |= (
            dataFrame[column]
            .fillna("")
            .astype(str)
            .str.len()
            .gt(maxLength)
        )

    # Dòng nào lỗi thì loại khỏi DataFrame.
    dataFrame["_has_error"] = (
        invalidRequiredText
        | invalidDateTime
        | invalidLength
    )

    return dataFrame


def getExistingCases(
    db: Session,
    caseCodes: list[str],
) -> dict[str, Case]:

    existingCases: dict[str, Case] = {}

    chunkSize = 1000

    for start in range(
        0,
        len(caseCodes),
        chunkSize,
    ):

        chunk = caseCodes[
            start : start + chunkSize
        ]

        statement = select(Case).where(
            Case.case_code.in_(chunk)
        )

        for case in db.scalars(statement):
            existingCases[
                case.case_code
            ] = case

    return existingCases


def importCases(
    db: Session,
    file: UploadFile,
) -> ImportCaseResult:

    # ================================
    # Pandas đọc + xử lý file
    # ================================

    dataFrame = readUploadedFile(file)

    dataFrame = prepareDataFrame(
        dataFrame
    )

    totalRecords = len(dataFrame)

    errorRecords = int(
        dataFrame["_has_error"].sum()
    )

    # Chỉ giữ record hợp lệ.
    validDataFrame = (
        dataFrame[
            ~dataFrame["_has_error"]
        ]
        .drop(
            columns=["_has_error"]
        )
        .copy()
    )

    # Nếu cùng case_code xuất hiện nhiều lần,
    # lấy record cuối cùng.
    validDataFrame = (
        validDataFrame
        .drop_duplicates(
            subset=["case_code"],
            keep="last",
        )
    )

    # NaN / NaT -> None cho SQLAlchemy.
    validDataFrame = validDataFrame.astype(
        object
    )

    validDataFrame = validDataFrame.where(
        pd.notna(validDataFrame),
        None,
    )

    records = validDataFrame.to_dict(
        orient="records"
    )

    insertedRecords = 0
    updatedRecords = 0
    completedRecords = 0
    processingRecords = 0
    unmappedRelationRecords = 0
    fieldMismatchRecords = 0

    try:

        caseCodes = [
            record["case_code"]
            for record in records
        ]

        existingCases = getExistingCases(
            db,
            caseCodes,
        )

        relationLookups = (
            loadCaseRelationLookups(db)
        )

        now = datetime.now()

        # ================================
        # Lưu DB
        # ================================

        for caseData in records:

            procedure = resolveProcedure(
                relationLookups,
                procedureName=caseData[
                    "procedure_name"
                ],
                fieldName=caseData[
                    "field_name"
                ],
            )

            department = resolveDepartment(
                relationLookups,
                departmentName=caseData[
                    "department_name"
                ],
            )

            officer = resolveOfficer(
                relationLookups,
                officerName=caseData.get(
                    "officer_name"
                ),
            )

            # ================================
            # FK
            # ================================

            caseData["procedure_id"] = (
                procedure.id
                if procedure is not None
                else None
            )

            caseData["department_id"] = (
                department.id
                if department is not None
                else None
            )

            caseData["officer_id"] = (
                officer.id
                if officer is not None
                else None
            )

            # ================================
            # Kiểm tra mapping
            # ================================

            officerExpected = (
                normalizeRelationText(
                    caseData.get(
                        "officer_name"
                    )
                )
                is not None
            )

            if (
                procedure is None
                or department is None
                or (
                    officerExpected
                    and officer is None
                )
            ):
                unmappedRelationRecords += 1

            # ================================
            # Kiểm tra field mismatch
            # ================================

            if (
                procedure is not None
                and normalizeRelationText(
                    caseData["field_name"]
                )
                != normalizeRelationText(
                    procedure.field.name
                )
            ):
                fieldMismatchRecords += 1

            # ================================
            # Insert / Update
            # ================================

            caseCode = caseData[
                "case_code"
            ]

            existingCase = (
                existingCases.get(caseCode)
            )

            if existingCase is None:

                newCase = Case(
                    **caseData
                )

                db.add(newCase)

                existingCases[
                    caseCode
                ] = newCase

                insertedRecords += 1

            else:

                for field, value in (
                    caseData.items()
                ):
                    setattr(
                        existingCase,
                        field,
                        value,
                    )

                existingCase.updated_at = now

                updatedRecords += 1

            # ================================
            # Thống kê
            # ================================

            if (
                caseData["completed_at"]
                is None
            ):
                processingRecords += 1
            else:
                completedRecords += 1

        db.commit()

    except SQLAlchemyError as exc:

        db.rollback()

        raise ImportCaseDatabaseError(
            "Không thể lưu dữ liệu hồ sơ "
            "vào database"
        ) from exc

    return ImportCaseResult(
        total_records=totalRecords,
        inserted_records=insertedRecords,
        updated_records=updatedRecords,
        error_records=errorRecords,
        completed_records=completedRecords,
        processing_records=processingRecords,
        unmapped_relation_records=(
            unmappedRelationRecords
        ),
        field_mismatch_records=(
            fieldMismatchRecords
        ),
    )