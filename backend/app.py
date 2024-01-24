import atexit
import datetime
import os
import queue
import threading

import cv2
from flask import Flask, Response, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder="/app/ja-zennoh/frontend/out")
CORS(app)

today = datetime.date.today().strftime("%Y%m%d")

folder_name = f"/app/images/{today}"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)

write_queue = queue.Queue()


def write_frame():
    while True:
        frame, timestamp = write_queue.get()

        if frame is None:
            break

        cv2.imwrite(os.path.join(folder_name, f"frame_{timestamp}.jpg"), frame)


write_thread = threading.Thread(target=write_frame)
write_thread.daemon = True
write_thread.start()

cap = cv2.VideoCapture(0)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1920)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 1080)

cap.set(cv2.CAP_PROP_FPS, 30)

current_frame = None
is_recording = False


def update_frame():
    global current_frame
    while True:
        ret, frame = cap.read()
        if ret:
            current_frame = frame
            if is_recording:
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                write_queue.put((current_frame, timestamp))


update_thread = threading.Thread(target=update_frame)
update_thread.daemon = True
update_thread.start()


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


@app.route("/api/capture/thumbnail")
def get_thumbnail():
    global current_frame
    if current_frame is not None:
        retval, buf = cv2.imencode(".jpg", current_frame)
        if retval:
            return Response(buf.tobytes(), mimetype="image/jpeg")


def cleanup():
    cap.release()
    write_queue.put((None, None))
    write_thread.join()


atexit.register(cleanup)


@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/_next/static/<path:filename>")
def next_static(filename):
    return send_from_directory("/app/ja-zennoh/frontend/out/_next/static", filename)
