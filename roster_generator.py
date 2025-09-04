import re

class RosterGenerator():
    def __init__(self):
        pass

    def forward(self, members, constraints):
        # This is the mock generation logic, now used directly.
        roster = self._generate_automated_roster_mock(members, constraints)
        return roster

    def _generate_automated_roster_mock(self, members, structured_constraints):
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        shifts = ["Morning", "Afternoon", "Evening", "Night"]
        roster = {}
        workload = {m['Name']: {'totalShifts': 0, 'weekendShifts': 0, 'lastDayWorked': -1, 'shiftCounts': {s: 0 for s in shifts}} for m in members}

        for day_index, day in enumerate(days):
            roster[day] = {shift: [] for shift in shifts}
            assigned_today = []

            # Handle "day_off" and "must_work" constraints first
            for constraint in structured_constraints:
                if constraint['day'].lower() == day.lower():
                    member_name = constraint['person']
                    member_obj = next((m for m in members if m['Name'] == member_name), None)

                    if member_obj:
                        if constraint['type'] == 'day_off':
                            if member_name not in assigned_today:
                                assigned_today.append(member_name)
                        elif constraint['type'] == 'must_work':
                            target_shift = constraint['shift']
                            if member_name not in assigned_today:
                                roster[day][target_shift].append({'name': member_obj['Name'], 'role': member_obj['Role']})
                                assigned_today.append(member_name)
                                workload[member_name]['totalShifts'] += 1
                                workload[member_name]['shiftCounts'][target_shift] += 1
                                workload[member_name]['lastDayWorked'] = day_index
                                if day in ["Saturday", "Sunday"]:
                                    workload[member_name]['weekendShifts'] += 1


            for shift in shifts:
                for _ in range(2):
                    best_candidate = None
                    best_score = -float('inf')

                    available_members = [m for m in members if m['Name'] not in assigned_today and workload[m['Name']]['lastDayWorked'] < day_index - 1]
                    if not available_members:
                        continue

                    for member in available_members:
                        score = 100
                        score -= workload[member['Name']]['totalShifts'] * 10
                        score -= workload[member['Name']]['shiftCounts'][shift] * 5
                        if day in ["Saturday", "Sunday"]:
                            score -= workload[member['Name']]['weekendShifts'] * 20
                        if any(p['role'] == member['Role'] for p in roster[day][shift]):
                            score -= 50

                        if score > best_score:
                            best_score = score
                            best_candidate = member

                    if best_candidate:
                        roster[day][shift].append({'name': best_candidate['Name'], 'role': best_candidate['Role']})
                        assigned_today.append(best_candidate['Name'])
                        workload[best_candidate['Name']]['totalShifts'] += 1
                        workload[best_candidate['Name']]['shiftCounts'][shift] += 1
                        workload[best_candidate['Name']]['lastDayWorked'] = day_index
                        if day in ["Saturday", "Sunday"]:
                            workload[best_candidate['Name']]['weekendShifts'] += 1

            roster[day]['Off'] = ', '.join([m['Name'] for m in members if m['Name'] not in assigned_today])

        return roster

# Example usage (for testing)
if __name__ == '__main__':
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
    print(json.dumps(prediction, indent=2))
