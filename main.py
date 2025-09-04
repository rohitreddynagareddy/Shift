from flask import Flask, render_template, request, jsonify
from roster_generator import RosterGenerator
import json
import datetime

app = Flask(__name__)

# It's better to create a single instance of the generator
roster_generator_instance = RosterGenerator()

# In-memory data store for employees
employees_db = [
    { "Name": 'Rohit', "Role": 'Development', "serviceNow": 5, "jira": 8, "csat": 92, "ticketsResolved": 13, "avgResolutionTime": 45, "leaveBalance": 20, "isAiAgentActive": False },
    { "Name": 'Keerthi', "Role": 'Operations', "serviceNow": 3, "jira": 12, "csat": 98, "ticketsResolved": 15, "avgResolutionTime": 30, "leaveBalance": 20, "isAiAgentActive": False },
    { "Name": 'Naresh', "Role": 'DBA', "serviceNow": 7, "jira": 4, "csat": 95, "ticketsResolved": 11, "avgResolutionTime": 55, "leaveBalance": 20, "isAiAgentActive": False },
]

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

@app.route('/api/analytics/team_averages', methods=['GET'])
def get_team_averages():
    log_to_file("Get team averages route was hit.")
    if not employees_db:
        return jsonify({
            "avg_tickets_resolved": 0,
            "avg_resolution_time": 0,
            "avg_csat": 0
        })

    total_tickets = sum(e.get('ticketsResolved', 0) for e in employees_db)
    total_resolution_time = sum(e.get('avgResolutionTime', 0) for e in employees_db)
    total_csat = sum(e.get('csat', 0) for e in employees_db)
    num_employees = len(employees_db)

    averages = {
        "avg_tickets_resolved": round(total_tickets / num_employees, 1),
        "avg_resolution_time": round(total_resolution_time / num_employees, 1),
        "avg_csat": round(total_csat / num_employees, 1)
    }

    log_to_file(f"Calculated team averages: {json.dumps(averages, indent=2)}")
    return jsonify(averages)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
