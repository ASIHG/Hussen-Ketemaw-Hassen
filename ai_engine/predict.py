import pandas as pd
from prophet import Prophet
import json

def generate_forecast(historical_data):
    """
    Simulates the AI Prediction Engine for Afro Space.
    Uses Facebook Prophet for time-series forecasting.
    """
    df = pd.DataFrame(historical_data)
    df.columns = ['ds', 'y']
    
    model = Prophet(changepoint_prior_scale=0.05, daily_seasonality=False)
    model.fit(df)
    
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    
    # Extract prediction insights
    insight = {
        "trend": "bullish",
        "expected_growth": forecast['yhat'].iloc[-1] / forecast['yhat'].iloc[0],
        "risk_score": 0.15,  # Low risk placeholder
        "recommendation": "Maintain asset allocation; high probability of sector breakout."
    }
    
    return json.dumps(insight)

if __name__ == "__main__":
    # Sample data ingestion
    sample_data = [
        {"ds": "2023-01-01", "y": 100},
        {"ds": "2023-02-01", "y": 110},
        {"ds": "2023-03-01", "y": 105},
        {"ds": "2023-04-01", "y": 125},
    ]
    print(generate_forecast(sample_data))
