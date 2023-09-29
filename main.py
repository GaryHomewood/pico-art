import picographics
import jpegdec
from pimoroni import Button
import time
import os

button_a = Button(12, invert=True)
button_b = Button(13, invert=True)
button_x = Button(14, invert=True)
button_y = Button(15, invert=True)

def show_image(image):
    display = picographics.PicoGraphics(display=picographics.DISPLAY_PICO_DISPLAY_2)
    j = jpegdec.JPEG(display)
    j.open_file(image)
    j.decode(0, 0, jpegdec.JPEG_SCALE_FULL, dither=True)
    display.update()

# Get the most recently modified sketch to display on reset.
sketches = {}
for i in range(1, 5):
    sketch_file_name = f"sketch-{i}.jpeg"
    sketch = os.stat(f"{sketch_file_name}")
    dt = time.localtime(sketch[7])
    # 7, 8, and 9 are all the same, set to the modification time
    sketches[sketch_file_name] = sketch[7]

sorted_sketches = sorted(sketches.items(), key=lambda x:x[1], reverse=True)
last_modified_sketch_file_name = sorted_sketches[0][0]
show_image(last_modified_sketch_file_name)

while True:
    if button_a.read():
        show_image("sketch-1.jpeg")
    elif button_b.read():
        show_image("sketch-2.jpeg")
    elif button_x.read():
        show_image("sketch-3.jpeg")
    elif button_y.read():
        show_image("sketch-4.jpeg")

    time.sleep(0.1)  # how frequently the Pico checks for button presses

