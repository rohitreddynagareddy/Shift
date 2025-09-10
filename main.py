import datetime
import json
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# --- In-Memory Database ---
employees = {
    1: {"id": 1, "name": "Alice", "role": "Engineer", "leaveBalance": 20, "isAiAgentActive": False, "performance": {"tasksCompleted": 15, "codeQuality": 95, "kudos": ["Great teamwork!", "Excellent problem-solving."]}, "schedule": []},
    2: {"id": 2, "name": "Bob", "role": "Engineer", "leaveBalance": 20, "isAiAgentActive": False, "performance": {"tasksCompleted": 20, "codeQuality": 98, "kudos": ["Always delivers on time."]}, "schedule": []},
    3: {"id": 3, "name": "Charlie", "role": "Manager", "leaveBalance": 30, "performance": {"tasksCompleted": 10, "codeQuality": 99, "kudos": []}, "schedule": []}
}
leave_requests = []
swap_requests = []
# Store the last generated roster
last_roster = {}
request_counter = 1

# --- Utility Functions ---
def log_to_file(message):
    with open("app.log", "a") as f:
        f.write(f"[{datetime.datetime.now()}] {message}\n")

def find_employee_by_name(name):
    for emp in employees.values():
        if emp['name'] == name:
            return emp
    return None

# --- Main Routes ---
@app.route('/')
def index():
    return render_template('index.html')

# --- Employee API ---
@app.route('/api/employees', methods=['GET'])
def get_employees():
    return jsonify(list(employees.values()))

@app.route('/api/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    employee = employees.get(employee_id)
    if employee:
        return jsonify(employee)
    return jsonify({"error": "Employee not found"}), 404

@app.route('/api/employees/<int:employee_id>/ai_status', methods=['POST'])
def set_ai_status(employee_id):
    data = request.get_json()
    status = data.get('isAiAgentActive')
    if employee_id in employees and isinstance(status, bool):
        employees[employee_id]['isAiAgentActive'] = status
        return jsonify(employees[employee_id])
    return jsonify({"error": "Invalid request"}), 400

# --- Leave Request API ---
@app.route('/api/leave_requests', methods=['GET', 'POST'])
def handle_leave_requests():
    global request_counter
    if request.method == 'POST':
        data = request.get_json()
        employee_id = data.get('employeeId')
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        if not all([employee_id, start_date, end_date]):
            return jsonify({"error": "Missing required fields"}), 400

        new_request = {
            "id": request_counter,
            "employeeId": employee_id,
            "startDate": start_date,
            "endDate": end_date,
            "status": "Pending"
        }
        leave_requests.append(new_request)
        request_counter += 1
        return jsonify(new_request), 201

    # GET request
    return jsonify(leave_requests)

@app.route('/api/leave_requests/<int:request_id>', methods=['PUT'])
def update_leave_request(request_id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status or new_status not in ['Approved', 'Rejected']:
        return jsonify({"error": "Invalid status"}), 400

    leave_req = next((r for r in leave_requests if r['id'] == request_id), None)

    if not leave_req:
        return jsonify({"error": "Leave request not found"}), 404

    # --- Leave Balance and Roster Conflict Logic ---
    warning = ""
    if new_status == 'Approved':
        # Calculate leave duration
        start = datetime.datetime.strptime(leave_req['startDate'], '%Y-%m-%d')
        end = datetime.datetime.strptime(leave_req['endDate'], '%Y-%m-%d')
        duration = (end - start).days + 1

        employee = employees.get(leave_req['employeeId'])
        if not employee:
             return jsonify({"error": "Employee not found for this request"}), 404

        if employee['leaveBalance'] < duration:
            return jsonify({"error": f"Insufficient leave balance. Requires {duration} days, has {employee['leaveBalance']}."}), 400

        employee['leaveBalance'] -= duration

        # Check for roster conflicts
        if last_roster:
            employee_name = employee['name']
            leave_dates = { (start + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(duration) }

            for date, shifts in last_roster.items():
                if date in leave_dates:
                    for shift, member in shifts.items():
                        if member == employee_name:
                            warning = f"Warning: This leave conflicts with the existing roster. {employee_name} is scheduled for the '{shift}' shift on {date}."
                            break
                if warning:
                    break

    leave_req['status'] = new_status
    response = {"request": leave_req}
    if warning:
        response["warning"] = warning

    return jsonify(response)

# --- Roster API ---
from roster_generator import RosterGenerator
roster_generator_instance = RosterGenerator()

@app.route('/api/generate_roster', methods=['POST'])
def generate_roster():
    global last_roster
    log_to_file("Generate roster route was hit.")
    data = request.get_json()

    if not data or 'members' not in data:
        return jsonify({"error": "Missing 'members' in request body"}), 400

    try:
        prediction = roster_generator_instance.forward(
            members=data['members'],
            constraints=data.get('constraints', [])
        )
        last_roster = prediction.roster # Save the generated roster

        # Update employee schedules
        for emp in employees.values():
            emp['schedule'] = []
        for date, shifts in last_roster.items():
            for shift, name in shifts.items():
                employee = find_employee_by_name(name)
                if employee:
                    employee['schedule'].append({"date": date, "shift": shift})

        return jsonify(prediction.roster)
    except Exception as e:
        log_to_file(f"Error generating roster: {e}")
        return jsonify({"error": f"Failed to generate roster: {str(e)}"}), 500

# --- Shift Swap API ---
@app.route('/api/swap_requests', methods=['GET', 'POST'])
def handle_swap_requests():
    global request_counter
    if request.method == 'POST':
        data = request.get_json()
        requester_id = data.get('requesterId')
        requested_id = data.get('requestedId')
        requester_shift = data.get('requesterShift')

        new_swap = {
            "id": request_counter,
            "requesterId": requester_id,
            "requestedId": requested_id,
            "requesterShift": requester_shift,
            "status": "Pending"
        }
        swap_requests.append(new_swap)
        request_counter += 1
        return jsonify(new_swap), 201

    employee_id = request.args.get('employeeId', type=int)
    if employee_id:
        outgoing = [r for r in swap_requests if r['requesterId'] == employee_id]
        incoming = [r for r in swap_requests if r['requestedId'] == employee_id]
        return jsonify({"outgoing": outgoing, "incoming": incoming})

    return jsonify(swap_requests)

@app.route('/api/swap_requests/<int:request_id>', methods=['PUT'])
def update_swap_request(request_id):
    data = request.get_json()
    new_status = data.get('status')

    swap_req = next((r for r in swap_requests if r['id'] == request_id), None)
    if not swap_req:
        return jsonify({"error": "Swap request not found"}), 404

    if new_status == "Approved":
        # Logic to find and swap shifts in the last_roster
        requester_name = employees[swap_req['requesterId']]['name']
        requested_name = employees[swap_req['requestedId']]['name']
        shift_date = swap_req['requesterShift']['date']
        shift_name = swap_req['requesterShift']['shift']

        if shift_date in last_roster and last_roster[shift_date].get(shift_name) == requester_name:
            # Simple swap: requester takes a day off, requested takes the shift
            # A more complex swap would involve finding a shift for the requester to take
            last_roster[shift_date][shift_name] = requested_name

            # Update employee schedules
            emp1 = find_employee_by_name(requester_name)
            emp2 = find_employee_by_name(requested_name)

            emp1['schedule'] = [s for s in emp1['schedule'] if not (s['date'] == shift_date and s['shift'] == shift_name)]
            emp2['schedule'].append({"date": shift_date, "shift": shift_name})

            swap_req['status'] = 'Approved'
        else:
            return jsonify({"error": "Shift to swap no longer exists in the current roster."}), 400

    elif new_status == "Rejected":
        swap_req['status'] = 'Rejected'
    else:
        return jsonify({"error": "Invalid status"}), 400

    return jsonify({"swap_request": swap_req, "roster": last_roster})

# --- Analytics API ---
@app.route('/api/analytics/team_averages', methods=['GET'])
def get_team_averages():
    eng_perf = [e['performance'] for e in employees.values() if e['role'] == 'Engineer']
    if not eng_perf:
        return jsonify({"avgTasks": 0, "avgCodeQuality": 0})

    avg_tasks = sum(p['tasksCompleted'] for p in eng_perf) / len(eng_perf)
    avg_quality = sum(p['codeQuality'] for p in eng_perf) / len(eng_perf)

    return jsonify({
        "avgTasks": round(avg_tasks, 2),
        "avgCodeQuality": round(avg_quality, 2)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
