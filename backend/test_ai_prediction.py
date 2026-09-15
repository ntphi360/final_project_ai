from pathlib import Path

import pandas as pd

from app.ai.model_loader import MODEL_DIR, getModelBundle
from app.ai.predictor import predictCase


EXPECTED_COLUMNS = {
    "PROC": "pred_procedure_median",
    "PRIOR": "pred_hierarchical_prior",
    "CAT_RATIO": "pred_cat_ratio",
    "XGB_LOG": "pred_xgb_log",
}


def main() -> None:
    bundle = getModelBundle()
    heldOut = pd.read_csv(Path(MODEL_DIR) / "final_test_predictions.csv")
    record = heldOut.iloc[0]
    sample = {feature: record[feature] for feature in bundle.features}
    result = predictCase(sample)

    print(f"Model version: {result['model_version']}")
    print()
    for expert, prediction in result["experts"].items():
        print(f"{expert:<10}: {prediction:.9f}")
    print()
    print(f"FINAL     : {result['predicted_processing_hours']:.9f} hours")

    differences = {
        expert: abs(result["experts"][expert] - float(record[column]))
        for expert, column in EXPECTED_COLUMNS.items()
    }
    finalDifference = abs(
        result["predicted_processing_hours"] - float(record["predicted_processing_hours"])
    )
    print(f"Held-out max expert delta: {max(differences.values()):.12f}")
    print(f"Held-out final delta: {finalDifference:.12f}")


if __name__ == "__main__":
    main()
