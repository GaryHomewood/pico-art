from flask import Flask, render_template, request
from http import HTTPStatus
import json
import subprocess
import urllib

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

# API to save p5 sketch as a png image and show on an eInk display
@app.route('/api/v1/save', methods = ['POST'])
def save():
    # Receive the name and a dataURL representation of a p5 sketch canvas
    data = str(request.get_data(), 'utf-8')
    data_json = json.loads(data)
    sketch_name = data_json['sketchName']
    sketch_file_name = f'static/img/{sketch_name}.jpeg'

    # Save as a jpeg
    response = urllib.request.urlopen(data_json['dataURL'])
    with open(sketch_file_name, 'wb') as f:
        f.write(response.file.read())

    # Synchronise the clock on the Pico so last modified date for the jpeg is correct
    subprocess.check_output("rshell date -b pyboard", shell=True)

    # Upload the jpeg to the Pico with ampy (Adafruit MicroPython tool) 
    subprocess.check_output(f'ampy put {sketch_file_name}', shell=True)

    # Reset the board
    subprocess.check_output("rshell -f reset.sh", shell=True)
    
    return '', HTTPStatus.NO_CONTENT
