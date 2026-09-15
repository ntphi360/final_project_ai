from app.ai.model_loader import getModelBundle


def main() -> None:
    bundle = getModelBundle()
    print("MODEL V3 LOADED")
    print(f"Model version: {bundle.model_version}")
    print(f"CatBoost: OK ({len(bundle.catboost_models)} seeds)")
    print(f"XGBoost: OK ({len(bundle.xgboost_models)} seeds)")
    print(f"Procedure stats: {'OK' if bundle.procedure_stats else 'MISSING'}")
    print(f"Prior stats: {'OK' if bundle.prior_stats else 'MISSING'}")
    print(f"Encoder: {'OK' if bundle.ordinal_encoder is not None else 'MISSING'}")
    print(f"Weights: {bundle.weights}")
    print(f"Artifacts loaded: {len(bundle.loaded_artifacts)}")
    if bundle.compatibility_warnings:
        print("Encoder compatibility: WARNING (artifact sklearn 1.6.1, runtime sklearn 1.9.1)")


if __name__ == "__main__":
    main()
