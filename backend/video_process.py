# import dependencies
import cv2
import mediapipe as mp
import numpy as np
import math
import scipy.signal as ss
import tempfile


def calculate_angle(a, b, c):
    # find vector between AB (vector u) and AC (vector v)
    u = ((a.x - b.x), (a.y - b.y))
    v = ((a.x - c.x), (a.y - c.y))

    # dot_product
    dot_uv = np.dot(u, v)

    # magnitude of u
    mag_u = math.sqrt(pow(u[0], 2) + pow(u[1], 2))
    mag_v = math.sqrt(pow(v[0], 2) + pow(v[1], 2))

    # magnitude of uv
    mag_uv = mag_u * mag_v

    theta_rad = math.acos(dot_uv / mag_uv)

    # radians to degrees
    theta_deg = math.degrees(theta_rad)
    return round(theta_deg, 2)


def get_averages(re_angle, le_angle, r_should):
    r_elbow_avg = np.mean(re_angle)
    l_elbow_avg = np.mean(le_angle)
    r_should_avg = np.mean(r_should)
    return r_elbow_avg, l_elbow_avg, r_should_avg


def get_bpm(r_should):
    time_interval = []
    peak_index = ss.find_peaks(r_should, prominence=0.013)
    for i in range(len(peak_index[0]) - 1):
        second = (peak_index[0][i + 1] - peak_index[0][i]) / 21.8
        time_interval.append(second)
    seconds_avg = np.mean(time_interval)
    return (1 / seconds_avg) * 60


def process_video(video_path):
    # initialize the mediapipe poses and drawing utilities
    mp_drawing = mp.solutions.drawing_utils
    mp_pose = mp.solutions.pose

    # with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp:
    #     tmp.write(video_file.read())
    #     tmp_path = tmp.name

    # open video file
    cap = cv2.VideoCapture(video_path)

    # get video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps == 0 or fps is None:
        fps = 30.0  # fallback value if fps metadata is unavailable
    frame_count = 0

    # define the codec and create VideoWriter object
    fourcc = cv2.VideoWriter.fourcc(*'VP80')
    out = cv2.VideoWriter('output.webm', fourcc, fps, (width, height))

    r_elbow_angle = []
    l_elbow_angle = []
    r_shoulder_ycord = []

    # check if video opened
    if not cap.isOpened():
        print("Could not open video file")
        exit()

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            frame_count += 1
            ret, frame = cap.read()

            if not ret:
                print("Empty frame, ending video processing")
                break

            # invert the video
            frame = cv2.flip(frame, 1)

            # recolor image to RGB
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False  # makes image read-only for detection

            # make the detection
            results = pose.process(image)

            # recolor back to BGR
            image.flags.writeable = True
            image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

            # get landmarks
            try:
                landmarks = results.pose_landmarks.landmark

                # get coordinates right shoulder
                r_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value]
                r_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value]
                r_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value]
                # get coordinates left shoulder
                l_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value]
                l_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value]
                l_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value]

                # calculate angle
                r_angle = calculate_angle(r_elbow, r_wrist, r_shoulder)
                l_angle = calculate_angle(l_elbow, l_wrist, l_shoulder)

                r_elbow_angle.append(r_angle)
                l_elbow_angle.append(l_angle)
                r_shoulder_ycord.append(round(r_shoulder.y, 4))

                # visualize
                cv2.putText(image, str(r_angle),
                            tuple(np.multiply((r_elbow.x, r_elbow.y), [width, height]).astype(int)),
                            cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(image, str(l_angle),
                            tuple(np.multiply((l_elbow.x, l_elbow.y), [width, height]).astype(int)),
                            cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 2, cv2.LINE_AA)
                cv2.putText(image, str(round(r_shoulder.y, 4)),
                            tuple(np.multiply((r_shoulder.x, r_shoulder.y), [width, height]).astype(int)),
                            cv2.FONT_HERSHEY_PLAIN, 1.5, (255, 255, 255), 2, cv2.LINE_AA)
            except AttributeError:
                pass

            # render detections
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                                      mp_drawing.DrawingSpec(color=(0, 0, 255)),
                                      mp_drawing.DrawingSpec(color=(0, 255, 0)))

            # write the processed frame to the output video file
            out.write(image)

    cap.release()
    out.release()
    cv2.destroyAllWindows()
    avgs = get_averages(r_elbow_angle, l_elbow_angle, r_shoulder_ycord)
    bpm = get_bpm(r_shoulder_ycord)
    return avgs[0], avgs[1], bpm


if __name__ == '__main__':
    # values = process_video('dh-video-test-cpr-2.mkv')
    with open('dh-video-test.webm', 'rb') as f:
        values = process_video(f)
    print(values[0])
    print(values[1])
    print(values[2])
