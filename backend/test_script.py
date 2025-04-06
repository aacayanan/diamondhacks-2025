import requests

url = 'http://127.0.0.1:5000/process'
video_url = './dh-video-test.webm'

with open(video_url, 'rb') as f:
    video = f.read()
    response = requests.post(url, data=video)

print(response.text)
