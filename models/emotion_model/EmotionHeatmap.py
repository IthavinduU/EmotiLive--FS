import matplotlib.pyplot as plt
import numpy as np
import random

class EmotionHeatmap:
    def __init__(self, num_students=10):
        self.num_students = num_students
        self.emotion_map = {}  # Stores student emotions
        self.emotion_colors = {
            "Happy": "green",
            "Sad": "blue",
            "Angry": "red",
            "Surprise": "yellow",
            "Neutral": "gray"
        }
        
    def update_emotion(self, student_id, emotion):
        """Update the emotion of a student."""
        self.emotion_map[student_id] = emotion

    def generate_heatmap(self):
        """Generates a grid-based heatmap visualization of student emotions."""
        grid_size = int(np.ceil(np.sqrt(self.num_students)))  # Create a square layout
        fig, ax = plt.subplots(figsize=(6, 6))

        # Create an empty grid
        emotion_grid = np.full((grid_size, grid_size), "Neutral", dtype=object)
        student_ids = list(self.emotion_map.keys())

        # Assign emotions to grid positions
        for i, student in enumerate(student_ids):
            row, col = divmod(i, grid_size)
            emotion_grid[row, col] = self.emotion_map[student]

        # Generate the heatmap
        for row in range(grid_size):
            for col in range(grid_size):
                emotion = emotion_grid[row, col]
                color = self.emotion_colors.get(emotion, "gray")
                ax.add_patch(plt.Rectangle((col, grid_size - row - 1), 1, 1, color=color))
                ax.text(col + 0.5, grid_size - row - 0.5, emotion[0], ha="center", va="center", fontsize=12, color="white")

        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlim(0, grid_size)
        ax.set_ylim(0, grid_size)
        ax.set_title("Real-Time Student Emotion Heatmap")

        plt.show()

