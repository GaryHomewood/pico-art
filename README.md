# Pico art

A web page of [p5js](https://p5js.org/) sketches that can be regenerated and uploaded to a button on a Raspberry Pico.

Uses [ampy](https://github.com/scientifichackers/ampy) to upload the generated jpeg sketch to the Pico over a serial connection.

## Screenshots

Web page:

![web page of sketches for the pico](/screenshots/pico-art-web.png)

Pico:

![web page of sketches for the pico](/screenshots/pico.jpg)

## Installation

Install requirements:

```shell
pip install -r requirements.txt
```

Copy `main.py` to the Pico

Set the Pico port in `.ampy`

Run the Flask app:

```shell
flask --app app run -h <ip-address>
```
