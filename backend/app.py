import atexit
import datetime
import os
import threading

import cv2
from flask import Flask, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="/app/ja-zennoh/frontend/out")
CORS(app)

stream_url = "http://localhost:8080/?action=stream"
cap = cv2.VideoCapture(stream_url)
current_frame = None

is_recording = False


def update_frame():
    global current_frame
    while True:
        ret, frame = cap.read()
        if ret:
            current_frame = frame
            if is_recording:
                now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                cv2.imwrite(
                    os.path.join(folder_name, f"frame_{now}.jpg"), current_frame
                )


thread = threading.Thread(target=update_frame)
thread.daemon = True
thread.start()

today = datetime.date.today().strftime("%Y%m%d")

folder_name = f"/app/images/{today}"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)


@app.route("/api/capture/start")
def start_capture():
    global is_recording
    is_recording = True
    return "Recording started", 200


@app.route("/api/capture/stop")
def stop_capture():
    global is_recording
    is_recording = False
    return "Recording stopped", 200


def cleanup():
    cap.release()


atexit.register(cleanup)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/_next/static/<path:filename>")
def next_static(filename):
    return send_from_directory("/app/ja-zennoh/frontend/out/_next/static", filename)
