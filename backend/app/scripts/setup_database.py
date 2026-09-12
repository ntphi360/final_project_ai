import subprocess
import sys


def runAlembicUpgrade() -> None:
    print("Đang chạy Alembic upgrade...")

    subprocess.run(
        [
            sys.executable,
            "-m",
            "alembic",
            "upgrade",
            "head",
        ],
        check=True,
    )


def runModule(moduleName: str) -> None:
    print(f"Đang chạy: {moduleName}")

    subprocess.run(
        [
            sys.executable,
            "-m",
            moduleName,
        ],
        check=True,
    )


def main() -> None:
    print("Bắt đầu setup database...")

    runAlembicUpgrade()
    runModule("app.seeds.catalog_seed")
    runModule("app.seeds.officer_seed")
    runModule("app.scripts.backfill_case_relations")

    print("Setup database hoàn tất.")


if __name__ == "__main__":
    main()