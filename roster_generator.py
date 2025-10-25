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

        if not members:
            return {}

        workload = {m['name']: {'totalShifts': 0, 'weekendShifts': 0, 'lastDayWorked': -2, 'shiftCounts': {s: 0 for s in shifts}} for m in members}

        # Dynamic scaling of people per shift
        # Aims for a 5-day work week spread over 7 days (4 shifts per day)
        people_per_shift = max(2, round(len(members) * 5 / (len(days) * len(shifts))))

        # Calculate average shifts for workload balancing
        total_shifts_to_assign = len(days) * len(shifts) * people_per_shift
        average_shifts_per_person = total_shifts_to_assign / len(members)

        parsed_constraints = []
        for c in user_constraints.lower().split('\n'):
            match = re.search(r'(\w+)\s+needs\s+(\w+)\s+off', c)
            if match:
                parsed_constraints.append({'name': match.group(1).lower(), 'day': match.group(2).lower()})

        for day_index, day in enumerate(days):
            roster[day] = {shift: [] for shift in shifts}
            assigned_today = []

            # Pre-assign "off" days based on constraints
            for c in parsed_constraints:
                if c['day'] == day.lower():
                    member_name_match = next((m['name'] for m in members if m['name'].lower() == c['name']), None)
                    if member_name_match and member_name_match not in assigned_today:
                        assigned_today.append(member_name_match)

            for shift in shifts:
                for _ in range(people_per_shift):
                    best_candidate = None
                    best_score = -float('inf')

                    available_members = [m for m in members if m['name'] not in assigned_today]

                    if not available_members:
                        continue

                    for member in available_members:
                        score = 100
                        wl = workload[member['name']]

                        # 1. Heavily penalize assigning more shifts than average
                        if wl['totalShifts'] > average_shifts_per_person:
                            score -= (wl['totalShifts'] - average_shifts_per_person) * 25
                        # Reward taking shifts if below average
                        else:
                            score += (average_shifts_per_person - wl['totalShifts']) * 10

                        # 2. Penalize working consecutive days
                        if wl['lastDayWorked'] == day_index - 1:
                            score -= 40

                        # 3. Penalize weekend shifts heavily
                        if day in ["Saturday", "Sunday"] and wl['weekendShifts'] > 0:
                            score -= (wl['weekendShifts'] * 30)

                        # 4. Enforce role diversity on a shift with a very high penalty
                        roles_on_shift = [p['role'] for p in roster[day][shift]]
                        if member['role'] in roles_on_shift:
                            score -= 1000 # Heavily penalize adding a duplicate role

                        # 5. Encourage project diversity on a shift
                        projects_on_shift = [p.get('project') for p in roster[day][shift] if p.get('project')]
                        if member.get('project') and member.get('project') not in projects_on_shift:
                            score += 20 # Reward for adding a new project to the shift

                        # 6. Penalize taking the same shift type too often
                        score -= wl['shiftCounts'][shift] * 5

                        if score > best_score:
                            best_score = score
                            best_candidate = member

                    if best_candidate:
                        roster[day][shift].append({
                            'name': best_candidate['name'],
                            'role': best_candidate['role'],
                            'project': best_candidate.get('project'),
                            'costCenter': best_candidate.get('costCenter')
                        })
                        assigned_today.append(best_candidate['name'])

                        # Update workload
                        wl = workload[best_candidate['name']]
                        wl['totalShifts'] += 1
                        wl['shiftCounts'][shift] += 1
                        wl['lastDayWorked'] = day_index
                        if day in ["Saturday", "Sunday"]:
                            wl['weekendShifts'] += 1

            # Assign remaining people to 'Off'
            off_today = [m['name'] for m in members if m['name'] not in assigned_today]
            roster[day]['Off'] = ', '.join(sorted(off_today))

        return roster

# Example usage (for testing)
if __name__ == '__main__':
    # Mock DSPy setup
    # dspy.configure(lm=dspy.OpenAI(model='gpt-3.5-turbo')) # This would be a real LM

    # Mock members and constraints
    mock_members = [
        {'name': 'Rohit', 'role': 'Development', 'project': 'Phoenix', 'costCenter': 'RND-101'},
        {'name': 'Keerthi', 'role': 'Operations', 'project': 'Orion', 'costCenter': 'OPS-202'},
        {'name': 'Naresh', 'role': 'DBA', 'project': 'Phoenix', 'costCenter': 'RND-101'},
        {'name': 'Saanvi', 'role': 'Support', 'project': 'Orion', 'costCenter': 'OPS-202'},
        {'name': 'Amit', 'role': 'Development', 'project': 'Phoenix', 'costCenter': 'RND-101'},
    ]
    mock_constraints = "Keerthi needs Saturday off"

    # Instantiate and run the generator
    roster_gen = RosterGenerator()
    prediction = roster_gen.forward(members=mock_members, constraints=mock_constraints)

    import json
    print(json.dumps(prediction.roster, indent=2))
