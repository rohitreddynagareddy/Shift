from flask import Flask, render_template, request, jsonify
from roster_generator import RosterGenerator
import json
import datetime
from datetime import timedelta

app = Flask(__name__)

# It's better to create a single instance of the generator
roster_generator_instance = RosterGenerator()

# In-memory data store for the generated roster
current_roster = {}

# In-memory data store for employees
employees_db = [
    { "name": 'Rohit', "role": 'Development', "serviceNow": 5, "jira": 8, "csat": 92, "ticketsResolved": 13, "avgResolutionTime": 45, "leaveBalance": 20, "isAiAgentActive": False },
    { "name": 'Keerthi', "role": 'Operations', "serviceNow": 3, "jira": 12, "csat": 98, "ticketsResolved": 15, "avgResolutionTime": 30, "leaveBalance": 20, "isAiAgentActive": False },
    { "name": 'Naresh', "role": 'DBA', "serviceNow": 7, "jira": 4, "csat": 95, "ticketsResolved": 11, "avgResolutionTime": 55, "leaveBalance": 20, "isAiAgentActive": False },
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
        global current_roster
        prediction = roster_generator_instance.forward(members=members, constraints=constraints)
        current_roster = prediction
        log_to_file(f"Generated and saved roster: {json.dumps(current_roster, indent=2)}")
        return jsonify(current_roster)
    except Exception as e:
        log_to_file(f"Error generating roster: {e}")
        return jsonify({"error": "Failed to generate roster"}), 500

@app.route('/api/roster/status', methods=['GET'])
def roster_status():
    log_to_file("Roster status route was hit.")
    return jsonify({"isGenerated": bool(current_roster)})

@app.route('/api/employees', methods=['GET'])
def get_employees():
    log_to_file("Get all employees route was hit.")
    return jsonify(employees_db)

@app.route('/api/employees/<string:name>/shifts', methods=['GET'])
def get_employee_shifts(name):
    log_to_file(f"Get shifts for employee {name} route was hit.")
    if not current_roster:
        return jsonify([]) # Return empty list if no roster is generated

    employee_shifts = []
    for day, shifts in current_roster.items():
        for shift_name, people in shifts.items():
            if isinstance(people, list):
                if any(p.get('name') == name for p in people):
                    employee_shifts.append({
                        "day": day,
                        "shift": shift_name
                    })

    log_to_file(f"Found {len(employee_shifts)} shifts for {name}: {json.dumps(employee_shifts, indent=2)}")
    return jsonify(employee_shifts)

@app.route('/api/employees/<string:name>/ai_status', methods=['PUT'])
def update_ai_status(name):
    log_to_file(f"Update AI status route was hit for employee: {name}")
    data = request.get_json()
    if not data or 'isAiAgentActive' not in data:
        return jsonify({"error": "Missing 'isAiAgentActive' in request body"}), 400

    is_active = data['isAiAgentActive']

    employee = next((emp for emp in employees_db if emp['name'] == name), None)

    if not employee:
        return jsonify({"error": "Employee not found"}), 404

    employee['isAiAgentActive'] = is_active
    log_to_file(f"Updated {name}'s AI agent status to: {is_active}")
    return jsonify(employee)

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

    conflict_warning = None
    # If approving, do conflict check and update leave balance
    if new_status == 'Approved':
        # Conflict Detection
        if current_roster:
            try:
                leave_start_date = datetime.datetime.strptime(request_to_update['startDate'], '%Y-%m-%d').date()
                leave_end_date = datetime.datetime.strptime(request_to_update['endDate'], '%Y-%m-%d').date()
                engineer_name = request_to_update['engineerName']

                conflicting_days = []
                delta = leave_end_date - leave_start_date

                for i in range(delta.days + 1):
                    day = leave_start_date + timedelta(days=i)
                    day_name = day.strftime('%A') # e.g., "Monday"

                    if day_name in current_roster:
                        for shift, people in current_roster[day_name].items():
                            if isinstance(people, list):
                                if any(p.get('name') == engineer_name for p in people):
                                    conflicting_days.append(day_name)
                                    break

                if conflicting_days:
                    conflict_warning = f"Warning: This leave conflicts with the generated roster on {', '.join(conflicting_days)}."
                    log_to_file(f"Conflict detected for {engineer_name}: {conflict_warning}")

            except (ValueError, TypeError) as e:
                log_to_file(f"Error during conflict detection: {e}")

        # Update leave balance
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
                    log_to_file(f"Insufficient leave balance for {employee['name']}. Rejecting request.")
                    new_status = 'Rejected'
            else:
                log_to_file(f"Could not find employee {request_to_update['engineerName']} to update balance.")

        except (ValueError, TypeError) as e:
            log_to_file(f"Error processing date for leave balance update: {e}")
            pass

    request_to_update['status'] = new_status
    log_to_file(f"Updated leave request {request_id} to status: {new_status}")

    response_data = request_to_update.copy()
    if conflict_warning:
        response_data['conflict_warning'] = conflict_warning

    return jsonify(response_data)

# --- Shift Swap Endpoints ---

# In-memory data store for swap requests
swap_requests_db = []
swap_request_id_counter = 0

@app.route('/api/swap_requests', methods=['GET'])
def get_swap_requests():
    engineer_name = request.args.get('engineerName')
    if not engineer_name:
        return jsonify({"error": "Missing engineerName query parameter"}), 400

    # Return requests where the engineer is either the requester or the responder
    relevant_requests = [
        req for req in swap_requests_db
        if req['requesterName'] == engineer_name or req['responderName'] == engineer_name
    ]
    log_to_file(f"Fetched {len(relevant_requests)} swap requests for {engineer_name}")
    return jsonify(relevant_requests)

@app.route('/api/swap_requests', methods=['POST'])
def create_swap_request():
    global swap_request_id_counter
    log_to_file("Create swap request route was hit.")
    data = request.get_json()
    required_fields = ['requesterName', 'responderName', 'requesterShift', 'responderShift']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields for swap request"}), 400

    swap_request_id_counter += 1
    new_request = {
        "id": swap_request_id_counter,
        "requesterName": data['requesterName'],
        "responderName": data['responderName'],
        "requesterShift": data['requesterShift'], # e.g., { "day": "Monday", "shift": "Morning" }
        "responderShift": data['responderShift'], # e.g., { "day": "Tuesday", "shift": "Evening" }
        "status": "Pending" # Status: Pending, Approved, Rejected
    }
    swap_requests_db.append(new_request)
    log_to_file(f"Created new swap request: {json.dumps(new_request, indent=2)}")
    return jsonify(new_request), 201

@app.route('/api/swap_requests/<int:request_id>/status', methods=['PUT'])
def update_swap_request_status(request_id):
    log_to_file(f"Update swap status route was hit for request ID: {request_id}")
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Missing 'status' in request body"}), 400

    new_status = data['status']
    if new_status not in ['Approved', 'Rejected']:
        return jsonify({"error": "Invalid status value"}), 400

    request_to_update = next((req for req in swap_requests_db if req['id'] == request_id), None)

    if not request_to_update:
        return jsonify({"error": "Swap request not found"}), 404

    # If approved, perform the swap in the current_roster
    if new_status == 'Approved' and current_roster:
        try:
            requester_name = request_to_update['requesterName']
            responder_name = request_to_update['responderName']
            req_shift_info = request_to_update['requesterShift']
            res_shift_info = request_to_update['responderShift']

            # Find the engineers in the roster
            requester_obj = next((emp for emp in employees_db if emp['name'] == requester_name), None)
            responder_obj = next((emp for emp in employees_db if emp['name'] == responder_name), None)

            if not requester_obj or not responder_obj:
                raise ValueError("Could not find one of the employees for the swap.")

            # Remove requester from their original shift
            current_roster[req_shift_info['day']][req_shift_info['shift']] = [
                p for p in current_roster[req_shift_info['day']][req_shift_info['shift']] if p['name'] != requester_name
            ]
            # Remove responder from their original shift
            current_roster[res_shift_info['day']][res_shift_info['shift']] = [
                p for p in current_roster[res_shift_info['day']][res_shift_info['shift']] if p['name'] != responder_name
            ]

            # Add requester to responder's original shift
            current_roster[res_shift_info['day']][res_shift_info['shift']].append(requester_obj)
            # Add responder to requester's original shift
            current_roster[req_shift_info['day']][req_shift_info['shift']].append(responder_obj)

            log_to_file(f"Successfully swapped shifts in roster for request {request_id}")
            log_to_file(f"Updated roster: {json.dumps(current_roster, indent=2)}")

        except (KeyError, ValueError) as e:
            log_to_file(f"Error swapping shifts for request {request_id}: {e}")
            # If the swap fails, reject the request to prevent inconsistency
            request_to_update['status'] = 'Rejected'
            return jsonify({"error": f"Failed to perform swap in roster: {e}"}), 500

    request_to_update['status'] = new_status
    log_to_file(f"Updated swap request {request_id} to status: {new_status}")
    return jsonify(request_to_update)


if __name__ == '__main__':
    app.run(debug=True, port=5002)
