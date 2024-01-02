import atexit
import datetime
import os

import cv2
from flask import Flask, request

app = Flask(__name__)

stream_url = "http://localhost:8080/?action=stream"
cap = cv2.VideoCapture(stream_url)

today = datetime.date.today().strftime("%Y%m%d")

folder_name = f"/app/images/{today}"
if not os.path.exists(folder_name):
    os.makedirs(folder_name)


@app.route("/api/capture")
def capture():
    timestamp = request.args.get("timestamp")

    ret, frame = cap.read()
    if ret:
        cv2.imwrite(os.path.join(folder_name, f"frame_{timestamp}.jpg"), frame)

    return "Image captured successfully", 200


def cleanup():
    cap.release()


atexit.register(cleanup)


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"
