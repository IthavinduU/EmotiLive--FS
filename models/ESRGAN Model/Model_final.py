# %% [Setup]
import os
import shutil
import subprocess
import cv2
import numpy as np
import torch
import lpips
from skimage.metrics import structural_similarity as ssim
import glob

# Define paths
temp_folder = 'tmp_frames'
result_folder = 'results'

# Clean existing folders
for folder in [temp_folder, result_folder]:
    if os.path.isdir(folder):
        shutil.rmtree(folder)
    os.mkdir(folder)

print("✅ Directories set up successfully!")

# %% [Select Video]
input_path = r'D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\ESRGAN Model\inputs\ds3_1.mp4'

if not os.path.exists(input_path):
    raise ValueError(f"❌ Video file not found: {input_path}")

file_name = os.path.basename(input_path)
print(f"🎬 Selected Video: {file_name}")

# %% [Extract Frames]
print("🔄 Extracting frames from video...")

cmd = [
    'ffmpeg',
    '-i', input_path,
    '-vf', 'fps=15',  # Extract at 15 FPS (changeable)
    '-q:v', '1',       # High-quality extraction
    os.path.join(temp_folder, 'frame_%08d.png')
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Ensure frames were extracted
frame_list = glob.glob(os.path.join(temp_folder, "*.png"))
frame_count = len(frame_list)

if process.returncode != 0 or frame_count == 0:
    print(process.stderr.decode())  # Print detailed error
    raise RuntimeError("❌ Error extracting frames")

print(f"✅ Extracted {frame_count} frames successfully!")

# %% [Enhance Frames]
print("🚀 Enhancing frames using Real-ESRGAN...")

cmd = [
    'python', 'inference_realesrgan.py',
    '-n', 'RealESRGAN_x4plus',
    '-i', temp_folder,
    '--outscale', '4',
    '--face_enhance'  # Optional: Enable face enhancement
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if process.returncode != 0:
    print(process.stderr.decode())  # Print detailed error
    raise RuntimeError("❌ Error enhancing frames")

print("✅ Frame enhancement complete!")

# %% [Rename Enhanced Frames]
print("📝 Renaming enhanced frames...")

for filename in os.listdir(temp_folder):
    if filename.endswith("_out.png"):
        new_filename = filename.replace("_out", "")  # Remove "_out"
        os.rename(os.path.join(temp_folder, filename), os.path.join(temp_folder, new_filename))

print("✅ Renamed enhanced frames successfully!")

# %% [Recreate Video]
print("🎥 Recreating video from enhanced frames...")

output_video = os.path.join(result_folder, f"enhanced_{file_name}")
fps = 15  # Set output frame rate

cmd = [
    'ffmpeg',
    '-framerate', str(fps),
    '-i', os.path.join(temp_folder, 'frame_%08d.png'),  # Fixed input pattern
    '-c:v', 'libx265',  # H.265 codec for better compression
    '-crf', '23',        # Adjust CRF for quality vs. size
    '-pix_fmt', 'yuv420p',
    output_video
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if process.returncode != 0:
    print(process.stderr.decode())  # Print detailed error
    raise RuntimeError("❌ Error recreating video")

print(f"✅ Enhanced video saved as: {output_video}")

# %% [Define Quality Metrics]
print("📊 Initializing quality metrics...")

lpips_loss = lpips.LPIPS(net='alex')  # Perceptual loss function

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

print("✅ Quality metrics initialized!")

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

        # Ensure both frames are the same size
        frame2 = cv2.resize(frame2, (frame1.shape[1], frame1.shape[0]))

        frame_count += 1
        print(f"📸 Processing frame {frame_count}...")

        # Compute quality metrics
        psnr_values.append(compute_psnr(frame1, frame2))
        ssim_values.append(compute_ssim(frame1, frame2))
        mse_values.append(compute_mse(frame1, frame2))
        lpips_values.append(compute_lpips(frame1, frame2))

    original_video.release()
    enhanced_video.release()

    # Print Average Results
    print("\n=== 🎯 Video Quality Comparison Results ===")
    print(f"📌 Average PSNR:  {np.mean(psnr_values):.2f} dB (Higher is better)")
    print(f"📌 Average SSIM:  {np.mean(ssim_values):.4f} (1.0 = Perfect match)")
    print(f"📌 Average MSE:   {np.mean(mse_values):.2f} (Lower is better)")
    print(f"📌 Average LPIPS: {np.mean(lpips_values):.4f} (Lower is better, deep-learning based)")

# Run comparison
compare_videos(input_path, output_video)
