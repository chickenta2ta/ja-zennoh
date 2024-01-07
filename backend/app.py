import atexit
import datetime
import os
import threading

import cv2
from flask import Flask, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="/app/ja-zennoh/frontend/out")
CORS(app)

stream_url = "http://localhost:8080/?action=stream"
cap = cv2.VideoCapture(stream_url)
current_frame = None

lock = threading.Lock()


def update_frame():
    global current_frame
    while True:
        ret, frame = cap.read()
        if ret:
            with lock:
                current_frame = frame


thread = threading.Thread(target=update_frame)
thread.daemon = True
thread.start()

today = datetime.date.today().strftime("%Y%m%d")

folder_name = f"/app/images/{today}"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)


@app.route("/api/capture")
def capture():
    timestamp = request.args.get("timestamp")

    with lock:
        if current_frame is not None:
            cv2.imwrite(
                os.path.join(folder_name, f"frame_{timestamp}.jpg"), current_frame
            )
            return "Image captured successfully", 200
        else:
            return "No frame available", 500


def cleanup():
    cap.release()


atexit.register(cleanup)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")
