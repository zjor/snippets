import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from PIL import Image

# Load the generated image
image_path = "elara.png"  # Replace with the actual image path
elara_img = Image.open(image_path)
elara_array = np.array(elara_img)

# Create figure and axis
fig, ax = plt.subplots(figsize=(6, 6))
ax.axis('off')  # Hide axes
img_display = ax.imshow(elara_array, alpha=1.0)

# Define animation function
def animate(frame):
    alpha_value = 0.8 + 0.2 * np.sin(frame * 0.1)  # Subtle glow effect
    img_display.set_alpha(alpha_value)
    return img_display,

# Create animation
ani = animation.FuncAnimation(fig, animate, frames=60, interval=50, blit=False)

# Save animation as MP4 video file
ani.save("elara_animation.mp4", writer="ffmpeg", fps=20)

print("Animation saved as elara_animation.mp4")