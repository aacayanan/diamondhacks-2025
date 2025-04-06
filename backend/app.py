import math
import os

import cv2
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from video_process import process_video
from google import genai
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
load_dotenv()


@app.route("/")
def home():
    return jsonify(message="Hello World")


@app.route('/process', methods=['POST'])
def process():
    if 'blob' not in request.files:
        return jsonify(message="No file", status_code=400)

    video = request.files['blob']
    session_id = request.form['session_id']

    # define the path where you want to save the video locally
    save_dir = './'
    os.makedirs(save_dir, exist_ok=True)  # ensure the directory exists
    save_path = os.path.join(save_dir, 'uploaded_video.webm')

    # save the uploaded video file directly using FileStorage.save()
    video.save(save_path)

    # now send to supabase
    # supabase url and api key
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(url, key)
    send_to_supabase = process_video(save_path)

    data = {
        'r_elbow_angle': send_to_supabase[0],
        'l_elbow_angle': send_to_supabase[1],
        'bpm': send_to_supabase[2],
    }
    response = supabase.table('sessions').update(data).eq('id', session_id).execute()
    print(response)
    return f"Video saved and processed at: {save_path}", 200


@app.route('/gemini', methods=['POST'])
def gemini():
    left_arm = request.form['left_arm']
    right_arm = request.form['right_arm']
    bpm = request.form['bpm']

    # # Load environment variables
    # dotenv_path = find_dotenv()
    # load_dotenv(dotenv_path)
    gemini_key = os.getenv('GEMINI_KEY')

    # Prepare prompt dynamically
    system_prompt = (
        "You are an AI assistant that gives CPR performance feedback.\n"
        "Do not have an humanoid introduction, it should be straight to the point.\n"
        "Evaluate the following metrics and give constructive advice:\n"
    )
    content = f"Left Arm Angle Straightness Accuracy: {left_arm}% Right Arm Angle Straightness Accuracy: {right_arm}% BPM: {bpm}"

    # Set up Gemini client
    client = genai.Client(api_key=gemini_key)

    # Call Gemini model
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=[system_prompt + content],
    )

    # Extract and return the generated text
    generated_text = response.candidates[0].content.parts[0].text
    print(generated_text)
    return generated_text


if __name__ == "__main__":
    app.run(debug=True, port=5000)
