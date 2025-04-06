# %%
# %% [Setup]
import os
import shutil
import subprocess
import cv2
import numpy as np
import torch
import lpips
from skimage.metrics import structural_similarity as ssim

# Define paths
temp_folder = 'tmp_frames'
result_folder = 'results'

# Clean existing folders
for folder in [temp_folder, result_folder]:
    if os.path.isdir(folder):
        shutil.rmtree(folder)
    os.mkdir(folder)

print("Directories set up successfully!")


# %%
# %% [Select Video]
input_path = r'D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\ESRGAN Model\inputs\ds3_1.mp4'  

if not os.path.exists(input_path):
    raise ValueError(f"Video file not found: {input_path}")

file_name = os.path.basename(input_path)
print(f"Selected Video: {file_name}")


# %%
print("Extracting frames from video...")

cmd = [
    'ffmpeg',
    '-i', input_path,
    '-vf', 'fps=15',  
    '-q:v', '1',      
    f'{temp_folder}/frame_%08d.png'
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
frame_count = len(os.listdir(temp_folder))

if process.returncode != 0 or frame_count == 0:
    raise RuntimeError("Error extracting frames")

print(f"Extracted {frame_count} frames successfully!")

# %%
print("Enhancing frames using Real-ESRGAN...")

cmd = [
    'python', 'inference_realesrgan.py',
    '-n', 'RealESRGAN_x4plus',
    '-i', temp_folder,
    '--outscale', '4',
    '--face_enhance'  
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if process.returncode != 0:
    raise RuntimeError("Error enhancing frames")

print("Frame enhancement complete!")


# %%
import subprocess
import os

print("🎥 Recreating video from enhanced frames...")

output_video = os.path.join(result_folder, f"enhanced_{file_name}")
fps = 15  
cmd = [
    'ffmpeg',
    '-framerate', str(fps),
    '-i', os.path.join(temp_folder, 'frame_%08d.png'),  
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '23',
    '-r', str(fps),
    '-pix_fmt', 'yuv420p',
    output_video
]


process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

# Print the FFmpeg error message for debugging
print("FFmpeg Output:", process.stdout)
print("FFmpeg Error:", process.stderr)

if process.returncode != 0:
    raise RuntimeError(f"Error recreating video. FFmpeg Error:\n{process.stderr}")

print(f"Enhanced video saved as: {output_video}")


# %%
# %% [Define Quality Metrics]
print("Initializing quality metrics")

lpips_loss = lpips.LPIPS(net='alex')  

def compute_psnr(image1, image2):
    mse = np.mean((image1 - image2) ** 2)
    return 100 if mse == 0 else 20 * np.log10(255.0 / np.sqrt(mse))

def compute_ssim(image1, image2):
    return ssim(image1, image2, data_range=255, channel_axis=-1)

def compute_mse(image1, image2):
    return np.mean((image1 - image2) ** 2)

def compute_lpips(image1, image2):
    image1 = torch.from_numpy(image1).float().permute(2, 0, 1).unsqueeze(0) / 255.0
    image2 = torch.from_numpy(image2).float().permute(2, 0, 1).unsqueeze(0) / 255.0
    return lpips_loss(image1, image2).item()

print("Quality metrics initialized!")


# %%
# %% [Compare Videos]
def compare_videos(original_video_path, enhanced_video_path):
    original_video = cv2.VideoCapture(original_video_path)
    enhanced_video = cv2.VideoCapture(enhanced_video_path)

    psnr_values, ssim_values, mse_values, lpips_values = [], [], [], []
    frame_count = 0

    while original_video.isOpened() and enhanced_video.isOpened():
        ret1, frame1 = original_video.read()
        ret2, frame2 = enhanced_video.read()

        if not ret1 or not ret2:
            break  # Stop when no more frames

        frame1 = cv2.resize(frame1, (640, 640))
        frame2 = cv2.resize(frame2, (640, 640))

        frame_count += 1

        # Compute quality metrics
        psnr_values.append(compute_psnr(frame1, frame2))
        ssim_values.append(compute_ssim(frame1, frame2))
        mse_values.append(compute_mse(frame1, frame2))
        lpips_values.append(compute_lpips(frame1, frame2))

    original_video.release()
    enhanced_video.release()

    # Print Average Results
    print("\nVideo Quality Comparison Results")
    print(f"Average PSNR:  {np.mean(psnr_values):.2f} dB ")
    print(f"Average SSIM:  {np.mean(ssim_values):.4f} ")
    print(f"Average MSE:   {np.mean(mse_values):.2f} ")
    print(f"Average LPIPS: {np.mean(lpips_values):.4f}")

# Run comparison
compare_videos(input_path, output_video)



