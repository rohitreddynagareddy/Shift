import dspy
import re

class RosterSignature(dspy.Signature):
    """Generate a roster for a team of engineers."""
    members = dspy.InputField(desc="A list of team members with their roles.")
    constraints = dspy.InputField(desc="Any additional constraints for the roster.")
    roster = dspy.OutputField(desc="A JSON object representing the generated roster.")

class RosterGenerator(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate_roster = dspy.Predict(RosterSignature)

    def forward(self, members, constraints):
        # In a real DSPy application, you would call the language model like this:
        # result = self.generate_roster(members=members, constraints=constraints)
        # return result.roster

        # For this example, we'll use the ported Python logic as a mock.
        roster = self._generate_automated_roster_mock(members, constraints)
        return dspy.Prediction(roster=roster)

    def _generate_automated_roster_mock(self, members, user_constraints):
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        shifts = ["Morning", "Afternoon", "Evening", "Night"]
        roster = {}
        workload = {m['name']: {'totalShifts': 0, 'weekendShifts': 0, 'lastDayWorked': -1, 'shiftCounts': {s: 0 for s in shifts}} for m in members}

        parsed_constraints = []
        for c in user_constraints.lower().split('\n'):
            match = re.search(r'(\w+)\s+needs\s+(\w+)\s+off', c)
            if match:
                parsed_constraints.append({'name': match.group(1), 'day': match.group(2)})

        for day_index, day in enumerate(days):
            roster[day] = {shift: [] for shift in shifts}
            assigned_today = []

            for c in parsed_constraints:
                if c['day'].lower() == day.lower():
                    member_name = next((m['name'] for m in members if m['name'].lower() == c['name'].lower()), None)
                    if member_name:
                        assigned_today.append(member_name)

            for shift in shifts:
                for _ in range(2):
                    best_candidate = None
                    best_score = -float('inf')

                    available_members = [m for m in members if m['name'] not in assigned_today and workload[m['name']]['lastDayWorked'] < day_index - 1]
                    if not available_members:
                        continue

                    for member in available_members:
                        score = 100
                        score -= workload[member['name']]['totalShifts'] * 10
                        score -= workload[member['name']]['shiftCounts'][shift] * 5
                        if day in ["Saturday", "Sunday"]:
                            score -= workload[member['name']]['weekendShifts'] * 20
                        if any(p['role'] == member['role'] for p in roster[day][shift]):
                            score -= 50

                        if score > best_score:
                            best_score = score
                            best_candidate = member

                    if best_candidate:
                        roster[day][shift].append({'name': best_candidate['name'], 'role': best_candidate['role']})
                        assigned_today.append(best_candidate['name'])
                        workload[best_candidate['name']]['totalShifts'] += 1
                        workload[best_candidate['name']]['shiftCounts'][shift] += 1
                        workload[best_candidate['name']]['lastDayWorked'] = day_index
                        if day in ["Saturday", "Sunday"]:
                            workload[best_candidate['name']]['weekendShifts'] += 1

            roster[day]['Off'] = ', '.join([m['name'] for m in members if m['name'] not in assigned_today])

        return roster

# Example usage (for testing)
if __name__ == '__main__':
    # Mock DSPy setup
    # dspy.configure(lm=dspy.OpenAI(model='gpt-3.5-turbo')) # This would be a real LM

    # Mock members and constraints
    mock_members = [
        {'name': 'Rohit', 'role': 'Development'},
        {'name': 'Keerthi', 'role': 'Operations'},
        {'name': 'Naresh', 'role': 'DBA'},
        {'name': 'Saanvi', 'role': 'Support'},
        {'name': 'Amit', 'role': 'Development'},
    ]
    mock_constraints = "Keerthi needs Saturday off"

    # Instantiate and run the generator
    roster_gen = RosterGenerator()
    prediction = roster_gen.forward(members=mock_members, constraints=mock_constraints)

    import json
    print(json.dumps(prediction.roster, indent=2))
