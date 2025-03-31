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


# %%
# %% [Select Video]
input_path = r'D:\University\IIT\Level 7\Final Year Project\MVP\EmotiLive\ESRGAN Model\inputs\ds3_1.mp4'  # Change this to your input video path

if not os.path.exists(input_path):
    raise ValueError(f"❌ Video file not found: {input_path}")

file_name = os.path.basename(input_path)
print(f"🎬 Selected Video: {file_name}")


# %%
# %% [Extract Frames]
print("🔄 Extracting frames from video...")

cmd = [
    'ffmpeg',
    '-i', input_path,
    '-vf', 'fps=15',  # Extract at 15 FPS (changeable)
    '-q:v', '1',       # High-quality extraction
    f'{temp_folder}/frame_%08d.png'
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
frame_count = len(os.listdir(temp_folder))

if process.returncode != 0 or frame_count == 0:
    raise RuntimeError("❌ Error extracting frames")

print(f"✅ Extracted {frame_count} frames successfully!")


# %%
# %% [Pre-Process Frames: Denoising]
print("🧹 Denoising extracted frames...")

for frame_path in glob.glob(os.path.join(temp_folder, "*.png")):
    frame = cv2.imread(frame_path)
    frame = cv2.fastNlMeansDenoisingColored(frame, None, 10, 10, 7, 21)  # Denoise
    cv2.imwrite(frame_path, frame)

print("✅ Denoising complete!")


# %%
# %% [Enhance Frames]
import subprocess

print("🚀 Enhancing frames using Real-ESRGAN...")

cmd = [
    'python', 'inference_realesrgan.py',
    '-n', 'RealESRGAN_x8',  # Use the 8x model
    '-i', temp_folder,
    '--outscale', '8',  # Match upscale factor with model
    '--face_enhance',
    '--tile', '128',  # Reduce tile size for CPU stability
    '--fp32'  # Ensure CPU runs in full precision mode
]

# Run the command and capture output
process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

# Check if Real-ESRGAN execution failed
if process.returncode != 0:
    print("❌ Error enhancing frames! Full error message:")
    print(process.stderr)  # Print full error log for debugging
    raise RuntimeError("Real-ESRGAN frame enhancement failed")

print("✅ Frame enhancement complete!")


# %%
# %% [Post-Process Frames: Sharpening]
print("🔍 Applying sharpening filter...")

sharpen_kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])

for frame_path in glob.glob(os.path.join(temp_folder, "*.png")):
    frame = cv2.imread(frame_path)
    frame = cv2.filter2D(frame, -1, sharpen_kernel)  # Apply sharpening
    cv2.imwrite(frame_path, frame)

print("✅ Sharpening complete!")


# %%
# %% [Recreate Video]
print("🎥 Recreating video from enhanced frames...")

output_video = os.path.join(result_folder, f"enhanced_{file_name}")
fps = 15  # Set output frame rate

cmd = [
    'ffmpeg',
    '-framerate', str(fps),
    '-i', os.path.join(temp_folder, 'frame_%08d.png'),
    '-c:v', 'libx265',  # H.265 codec for better compression
    '-crf', '16',  # Lower CRF for higher quality
    '-preset', 'slow',  # Better compression (slower encoding)
    '-pix_fmt', 'yuv420p',
    output_video
]

process = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

if process.returncode != 0:
    raise RuntimeError("❌ Error recreating video")

print(f"✅ Enhanced video saved as: {output_video}")


# %%
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
        print(f"📸 Processing frame {frame_count}...")

        psnr_values.append(compute_psnr(frame1, frame2))
        ssim_values.append(compute_ssim(frame1, frame2))
        mse_values.append(compute_mse(frame1, frame2))
        lpips_values.append(compute_lpips(frame1, frame2))

    original_video.release()
    enhanced_video.release()

    print("\n=== 🎯 Video Quality Comparison Results ===")
    print(f"📌 Average PSNR:  {np.mean(psnr_values):.2f} dB")
    print(f"📌 Average SSIM:  {np.mean(ssim_values):.4f}")
    print(f"📌 Average MSE:   {np.mean(mse_values):.2f}")
    print(f"📌 Average LPIPS: {np.mean(lpips_values):.4f}")

compare_videos(input_path, output_video)



