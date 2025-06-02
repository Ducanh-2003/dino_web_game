from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

@app.route('/')
def start():
    return render_template('start.html')

@app.route('/game')
def game():
    return render_template('index.html')


@app.route('/scores')
def score_history():
    try:
        with open('score.json', 'r') as f:
            scores = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        scores = []

    return render_template('scores.html', scores=scores)


@app.route('/save_score', methods=['POST'])
def save_score():
    data = request.get_json()
    new_score = int(data.get("score", 0))

    try:
        with open('score.json', 'r') as f:
            scores = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        scores = []

    scores.insert(0, new_score)

    with open('score.json', 'w') as f:
        json.dump(scores, f)

    return jsonify({"status": "success"}), 200

if __name__ == '__main__':
    app.run()
