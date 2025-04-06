import os
import tempfile

from flask import Flask, request, jsonify
import cv2
from video_process import process_video

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify(message="Hello World")


@app.route('/process', methods=['POST'])
def process():
    if 'blob' not in request.files:
        return jsonify(message="No file", status_code=400)

    video = request.files['blob']

    # define the path where you want to save the video locally
    save_dir = './'
    os.makedirs(save_dir, exist_ok=True)  # ensure the directory exists
    save_path = os.path.join(save_dir, 'uploaded_video.webm')

    # save the uploaded video file directly using FileStorage.save()
    video.save(save_path)

    process_video(save_path)

    return f"Video saved and processed at: {save_path}", 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
