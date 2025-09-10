import json
import pytest
# Import the app and the global variables to control state during tests
from main import app, employees, leave_requests, swap_requests, last_roster

@pytest.fixture
def client():
    app.config['TESTING'] = True
    # Reset state before each test
    employees.clear()
    employees.update({
        1: {"id": 1, "name": "Alice", "role": "Engineer", "leaveBalance": 20, "isAiAgentActive": False, "performance": {"tasksCompleted": 15, "codeQuality": 95, "kudos": []}, "schedule": []},
        2: {"id": 2, "name": "Bob", "role": "Engineer", "leaveBalance": 5, "isAiAgentActive": False, "performance": {"tasksCompleted": 20, "codeQuality": 98, "kudos": []}, "schedule": []},
        3: {"id": 3, "name": "Charlie", "role": "Manager", "leaveBalance": 30, "performance": {"tasksCompleted": 10, "codeQuality": 99, "kudos": []}, "schedule": []}
    })
    leave_requests.clear()
    swap_requests.clear()
    last_roster.clear()

    with app.test_client() as client:
        yield client

def test_get_employees(client):
    """Test fetching all employees."""
    rv = client.get('/api/employees')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert len(data) == 3
    assert data[0]['name'] == 'Alice'

def test_get_employee_by_id(client):
    """Test fetching a single employee by ID."""
    rv = client.get('/api/employees/1')
    assert rv.status_code == 200
    data = json.loads(rv.data)
    assert data['name'] == 'Alice'

    rv = client.get('/api/employees/99')
    assert rv.status_code == 404

def test_create_leave_request(client):
    """Test creating a new leave request."""
    response = client.post('/api/leave_requests', json={
        "employeeId": 1,
        "startDate": "2024-10-20",
        "endDate": "2024-10-22"
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'Pending'
    assert len(leave_requests) == 1
    assert leave_requests[0]['id'] == data['id']

def test_approve_leave_request_success(client):
    """Test approving a leave request and check leave balance."""
    client.post('/api/leave_requests', json={
        "employeeId": 1, "startDate": "2024-11-01", "endDate": "2024-11-05" # 5 days
    })
    request_id = leave_requests[0]['id']
    response = client.put(f'/api/leave_requests/{request_id}', json={"status": "Approved"})
    assert response.status_code == 200
    employee = employees[1]
    assert employee['leaveBalance'] == 15 # 20 - 5
    updated_req = next((r for r in leave_requests if r['id'] == request_id), None)
    assert updated_req['status'] == 'Approved'

def test_approve_leave_request_insufficient_balance(client):
    client.post('/api/leave_requests', json={
        "employeeId": 2, "startDate": "2024-11-01", "endDate": "2024-11-10" # 10 days
    })
    request_id = leave_requests[0]['id']
    response = client.put(f'/api/leave_requests/{request_id}', json={"status": "Approved"})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "Insufficient leave balance" in data['error']
    assert employees[2]['leaveBalance'] == 5

def test_roster_generation_and_conflict_warning(client):
    """Test generating a roster and getting a warning for a conflicting leave approval."""
    roster_payload = {
        "members": [{"name": "Alice", "role": "Engineer"}, {"name": "Bob", "role": "Engineer"}],
        "constraints": []
    }
    response = client.post('/api/generate_roster', json=roster_payload)
    assert response.status_code == 200
    generated_roster = json.loads(response.data)
    assert generated_roster, "Roster from response should not be empty"

    test_date = list(generated_roster.keys())[0]
    last_roster.clear()
    last_roster[test_date] = {"Morning": "Alice", "Evening": "Bob"}

    client.post('/api/leave_requests', json={
        "employeeId": 1, "startDate": test_date, "endDate": test_date
    })
    request_id = leave_requests[0]['id']

    response = client.put(f'/api/leave_requests/{request_id}', json={"status": "Approved"})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert "warning" in data
    assert "conflicts with the existing roster" in data['warning']

def test_create_and_approve_swap_request(client):
    """Test creating a shift swap request and approving it."""
    roster_payload = {
        "members": [{"name": "Alice", "role": "Engineer"}, {"name": "Bob", "role": "Engineer"}],
        "constraints": []
    }
    response = client.post('/api/generate_roster', json=roster_payload)
    assert response.status_code == 200
    generated_roster = json.loads(response.data)
    assert generated_roster, "Roster from response should not be empty"

    swap_date = list(generated_roster.keys())[0]
    # Set the state of the roster *before* the swap request
    last_roster.clear()
    last_roster[swap_date] = {"Morning": "Alice", "Evening": "Bob"}

    requester_shift = {"date": swap_date, "shift": "Morning"}
    response = client.post('/api/swap_requests', json={
        "requesterId": 1, "requestedId": 2, "requesterShift": requester_shift
    })
    assert response.status_code == 201
    swap_id = json.loads(response.data)['id']

    # Approve the swap
    response = client.put(f'/api/swap_requests/{swap_id}', json={"status": "Approved"})
    assert response.status_code == 200

    # 5. Verify the roster from the response body
    data = json.loads(response.data)
    assert "roster" in data
    updated_roster = data["roster"]
    assert updated_roster[swap_date]["Morning"] == "Bob"
