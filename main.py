import picographics
import jpegdec
from pimoroni import Button
import time

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

show_image("sketch-1.jpeg")

while True:
    if button_a.read():
        show_image("sketch-1.jpeg")
    elif button_b.read():
        show_image("sketch-2.jpeg")
    elif button_x.read():
        show_image("sketch-1.jpeg")
    elif button_y.read():
        show_image("sketch-1.jpeg")

    time.sleep(0.1)  # how frequently the Pico checks for button presses

