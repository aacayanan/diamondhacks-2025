import os
from supabase import create_client, Client
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from video_process import process_video

app = Flask(__name__)
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
        'l_elbow_angle': send_to_supabase[1]
    }
    response = supabase.table('sessions').update(data).eq('id', session_id).execute()
    print(response)
    return f"Video saved and processed at: {save_path}", 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
