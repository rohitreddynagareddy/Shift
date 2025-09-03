from flask import Flask, render_template, request, jsonify
from roster_generator import RosterGenerator
import json
import datetime

app = Flask(__name__)

# It's better to create a single instance of the generator
roster_generator_instance = RosterGenerator()

# In-memory data store for employees
employees_db = [
    { "name": 'Rohit', "role": 'Development', "serviceNow": 5, "jira": 8, "csat": 92, "ticketsResolved": 13, "avgResolutionTime": 45, "leaveBalance": 20 },
    { "name": 'Keerthi', "role": 'Operations', "serviceNow": 3, "jira": 12, "csat": 98, "ticketsResolved": 15, "avgResolutionTime": 30, "leaveBalance": 20 },
    { "name": 'Naresh', "role": 'DBA', "serviceNow": 7, "jira": 4, "csat": 95, "ticketsResolved": 11, "avgResolutionTime": 55, "leaveBalance": 20 },
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

@app.route('/api/employees', methods=['GET'])
def get_employees():
    log_to_file("Get all employees route was hit.")
    return jsonify(employees_db)

# In-memory data store for leave requests
leave_requests_db = []
request_id_counter = 0

@app.route('/api/leave_requests', methods=['GET'])
def get_leave_requests():
    log_to_file("Get all leave requests route was hit.")
    return jsonify(leave_requests_db)

@app.route('/api/leave_requests', methods=['POST'])
def create_leave_request():
    global request_id_counter
    log_to_file("Create leave request route was hit.")
    data = request.get_json()
    if not data or 'engineerName' not in data or 'startDate' not in data or 'endDate' not in data:
        return jsonify({"error": "Missing required fields for leave request"}), 400

    request_id_counter += 1
    new_request = {
        "id": request_id_counter,
        "engineerName": data['engineerName'],
        "startDate": data['startDate'],
        "endDate": data['endDate'],
        "reason": data.get('reason', ''),
        "status": "Pending"
    }
    leave_requests_db.append(new_request)
    log_to_file(f"Created new leave request: {json.dumps(new_request, indent=2)}")
    return jsonify(new_request), 201

@app.route('/api/leave_requests/<int:request_id>/status', methods=['PUT'])
def update_leave_request_status(request_id):
    log_to_file(f"Update status route was hit for request ID: {request_id}")
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Missing 'status' in request body"}), 400

    new_status = data['status']
    if new_status not in ['Approved', 'Rejected']:
        return jsonify({"error": "Invalid status value"}), 400

    request_to_update = next((req for req in leave_requests_db if req['id'] == request_id), None)

    if not request_to_update:
        return jsonify({"error": "Leave request not found"}), 404

    # If approving, update leave balance
    if new_status == 'Approved':
        try:
            start_date = datetime.datetime.strptime(request_to_update['startDate'], '%Y-%m-%d')
            end_date = datetime.datetime.strptime(request_to_update['endDate'], '%Y-%m-%d')
            duration = (end_date - start_date).days + 1

            employee = next((emp for emp in employees_db if emp['name'] == request_to_update['engineerName']), None)
            if employee:
                if employee['leaveBalance'] >= duration:
                    employee['leaveBalance'] -= duration
                    log_to_file(f"Updated {employee['name']}'s leave balance to {employee['leaveBalance']}")
                else:
                    # Not enough leave balance, reject the request instead
                    log_to_file(f"Insufficient leave balance for {employee['name']}. Rejecting request.")
                    new_status = 'Rejected'
            else:
                log_to_file(f"Could not find employee {request_to_update['engineerName']} to update balance.")

        except (ValueError, TypeError) as e:
            log_to_file(f"Error processing date for leave balance update: {e}")
            pass

    request_to_update['status'] = new_status
    log_to_file(f"Updated leave request {request_id} to status: {new_status}")
    return jsonify(request_to_update)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
