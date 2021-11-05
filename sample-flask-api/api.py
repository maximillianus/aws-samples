import flask

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return "<h1>Simple Flask API</h1><p>This site is a prototype API for Python Flask.</p>"

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)