import json

with open('api-docs.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

schemas = data.get('components', {}).get('schemas', {})

print("\nDetail for TicketResponse:")
print(json.dumps(schemas.get('TicketResponse', 'Not Found'), indent=2))

print("\nDetail for allRoomsResonse:")
print(json.dumps(schemas.get('allRoomsResonse', 'Not Found'), indent=2))

print("\nDetail for RoomResponseDTO:")
print(json.dumps(schemas.get('RoomResponseDTO', 'Not Found'), indent=2))
