import numpy as np

# Function to calculate angular error
def angular_error(true_angles, predicted_angles):
    return np.mean(np.abs(true_angles - predicted_angles))

# Dummy data for true and predicted gaze angles (in degrees)
true_gaze_angles = np.array([30, 45, 60, 90, 120, 150])
predicted_gaze_angles = np.array([32, 43, 59, 88, 118, 148])

# Calculate the average angular error
error = angular_error(true_gaze_angles, predicted_gaze_angles)

# Calculate MAE, MSE, and RMSE
mae = np.mean(np.abs(true_gaze_angles - predicted_gaze_angles))
mse = np.mean((true_gaze_angles - predicted_gaze_angles) ** 2)
rmse = np.sqrt(mse)

# Print the values
print(f"Average Angular Error: {error} degrees")
print(f"Mean Absolute Error (MAE): {mae}")
print(f"Mean Squared Error (MSE): {mse}")
print(f"Root Mean Squared Error (RMSE): {rmse}")
