import datetime
import re

class RosterGenerator:
    """
    A standalone, date-based roster generator.
    This version removes the dependency on DSPy and uses standard Python types.
    """
    def forward(self, members, constraints):
        """
        Generates a roster for a 7-day period starting from tomorrow.

        Args:
            members (list of dict): A list of team members. e.g., [{'name': 'Alice', 'role': 'Engineer'}]
            constraints (list of dict): A list of structured constraints.
                                        e.g., [{'type': 'needs_day_off', 'name': 'Alice', 'date': '2024-10-21'}]

        Returns:
            A dictionary representing the roster with date strings as keys.
        """
        roster = self._generate_automated_roster_mock(members, constraints)
        # The original returned a dspy.Prediction object, now we just return the roster dict.
        # To match the structure main.py expects, we wrap it.
        return type('Prediction', (), {'roster': roster})()


    def _generate_automated_roster_mock(self, members, parsed_constraints):
        # Generate for the next 7 days starting from tomorrow
        start_date = datetime.date.today() + datetime.timedelta(days=1)
        days = [(start_date + datetime.timedelta(days=i)).strftime('%Y-%m-%d') for i in range(7)]

        shifts = ["Morning", "Evening"] # Simplified shifts
        roster = {}
        workload = {m['name']: {'totalShifts': 0, 'lastDayWorked': None} for m in members}

        for day in days:
            roster[day] = {}
            assigned_today = []

            # Apply "needs_day_off" constraints for the current day
            for constraint in parsed_constraints:
                if constraint.get('type') == 'needs_day_off' and constraint.get('date') == day:
                    # Find the full name from the member list, case-insensitively
                    member_name = next((m['name'] for m in members if m['name'].lower() == constraint['name'].lower()), None)
                    if member_name and member_name not in assigned_today:
                        assigned_today.append(member_name)

            # Apply "must_work_shift" constraints
            for constraint in parsed_constraints:
                 if constraint.get('type') == 'must_work_shift' and constraint.get('date') == day:
                    member_name = next((m['name'] for m in members if m['name'].lower() == constraint['name'].lower()), None)
                    shift = constraint.get('shift')
                    if member_name and shift and member_name not in assigned_today:
                        roster[day][shift] = member_name
                        assigned_today.append(member_name)
                        workload[member_name]['totalShifts'] += 1
                        workload[member_name]['lastDayWorked'] = day


            # Fill remaining shifts
            for shift in shifts:
                if shift in roster[day]: # Skip if filled by a constraint
                    continue

                # Simple round-robin for available members
                available_members = sorted(
                    [m for m in members if m['name'] not in assigned_today],
                    key=lambda m: workload[m['name']]['totalShifts']
                )

                if not available_members:
                    roster[day][shift] = "Unassigned"
                    continue

                best_candidate = available_members[0]

                roster[day][shift] = best_candidate['name']
                assigned_today.append(best_candidate['name'])
                workload[best_candidate['name']]['totalShifts'] += 1
                workload[best_candidate['name']]['lastDayWorked'] = day

        return roster

# Example usage (for testing)
if __name__ == '__main__':
    mock_members = [
        {'name': 'Alice', 'role': 'Engineer'},
        {'name': 'Bob', 'role': 'Engineer'},
        {'name': 'Eve', 'role': 'Support'},
    ]

    tomorrow = (datetime.date.today() + datetime.timedelta(days=1)).strftime('%Y-%m-%d')

    mock_constraints = [
        {'type': 'needs_day_off', 'name': 'Alice', 'date': tomorrow},
        {'type': 'must_work_shift', 'name': 'Eve', 'shift': 'Morning', 'date': tomorrow}
    ]

    roster_gen = RosterGenerator()
    prediction = roster_gen.forward(members=mock_members, constraints=mock_constraints)

    import json
    print(json.dumps(prediction.roster, indent=2))
