from flask import Flask, render_template, request, jsonify
from roster_generator import RosterGenerator
import json
import datetime

app = Flask(__name__)

# It's better to create a single instance of the generator
roster_generator_instance = RosterGenerator()

def log_to_file(message):
    with open("app.log", "a") as f:
        f.write(f"[{datetime.datetime.now()}] {message}\n")

@app.route('/')
def index():
    log_to_file("Index route was hit.")
    return render_template('index.html')

@app.route('/api/generate_roster', methods=['POST'])
def generate_roster():
    log_to_file("Generate roster route was hit.")
    data = request.get_json()
    log_to_file(f"Received data: {json.dumps(data, indent=2)}")

    if not data or 'members' not in data:
        log_to_file("Error: Missing 'members' in request body")
        return jsonify({"error": "Missing 'members' in request body"}), 400

    members = data['members']
    constraints = data.get('constraints', '')

    try:
        # Use the roster generator instance
        prediction = roster_generator_instance.forward(members=members, constraints=constraints)
        log_to_file(f"Generated roster: {json.dumps(prediction.roster, indent=2)}")
        return jsonify(prediction.roster)
    except Exception as e:
        log_to_file(f"Error generating roster: {e}")
        return jsonify({"error": "Failed to generate roster"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
