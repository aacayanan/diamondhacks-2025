import os
import tempfile

from flask import Flask, request, jsonify
import cv2

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify(message="Hello World")


@app.route('/process', methods=['POST'])
def process():
    video = request.data

    # define the path where you want to save the video locally
    save_dir = './'
    os.makedirs(save_dir, exist_ok=True)  # ensure the directory exists
    save_path = os.path.join(save_dir, 'uploaded_video.webm')

    # save the uploaded video bytes directly to the target path
    with open(save_path, 'wb') as f:
        f.write(video)

    # process the saved video
    cap = cv2.VideoCapture(save_path)

    if not cap.isOpened():
        return "Error opening video file", 400

    ret, frame = cap.read()

    if ret:
        cv2.imshow('Frame', frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

    cap.release()

    return f"Video saved and processed at: {save_path}", 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
