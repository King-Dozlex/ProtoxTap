from pathlib import Path
from datetime import datetime
import shutil
import sys

PROJECT_ROOT = Path(__file__).resolve().parent
TARGET = PROJECT_ROOT / "server" / "index.ts"

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
BACKUP = PROJECT_ROOT / "server" / f"index.ts.backup_{timestamp}"


def fail(message):
    print(f"ERROR: {message}")
    print("No changes were made.")
    sys.exit(1)


if not TARGET.exists():
    fail(f"Could not find {TARGET}")


text = TARGET.read_text(encoding="utf-8")

# -----------------------------------------------------
# Make sure this is the version we expect
# -----------------------------------------------------

if "schema.cardEvents" not in text:
    fail("schema.cardEvents was not found.")

if '"tap"' not in text:
    fail('The existing "tap" event was not found.')

if "userAgent" not in text:
    print("No userAgent references found.")
    print("The file may already be updated.")
    sys.exit(0)


# -----------------------------------------------------
# Backup
# -----------------------------------------------------

shutil.copy2(TARGET, BACKUP)
print(f"Backup created: {BACKUP}")


# -----------------------------------------------------
# Assignment event
# -----------------------------------------------------

assignment_marker = '''        // =================================================
        // ACTIVATE CARD
'''

assignment_pos = text.find(assignment_marker)

if assignment_pos == -1:
    fail("Could not find ACTIVATE CARD section.")


before_activate = text[:assignment_pos]

if 'eventType:\n                "assigned"' not in before_activate:
    send_json_marker = '''          sendJson(
            res,
            200,
            result[0]
          );

          return;
        }

'''

    insert_pos = before_activate.rfind(send_json_marker)

    if insert_pos == -1:
        fail("Could not find assignment response block.")

    assignment_event = '''          await db
            .insert(
              schema.cardEvents
            )
            .values({
              cardId,

              eventType:
                "assigned",
            });

'''

    text = (
        text[:insert_pos]
        + assignment_event
        + text[insert_pos:]
    )

    print("✓ Added assigned event")
else:
    print("✓ Assigned event already exists")


# -----------------------------------------------------
# Activation event
# -----------------------------------------------------

old_activation = '''              userAgent:
                req.headers[
                  "user-agent"
                ] ?? null,
'''

new_activation = '''              eventType:
                "activated",
'''

if old_activation not in text:
    fail("Could not find activation userAgent block.")

text = text.replace(
    old_activation,
    new_activation,
    1
)

print("✓ Updated activation event")


# -----------------------------------------------------
# Deactivation event
# -----------------------------------------------------

if old_activation not in text:
    fail("Could not find deactivation userAgent block.")

text = text.replace(
    old_activation,
    '''              eventType:
                "deactivated",
''',
    1
)

print("✓ Updated deactivation event")


# -----------------------------------------------------
# Verify
# -----------------------------------------------------

if "userAgent" in text:
    shutil.copy2(BACKUP, TARGET)
    fail("userAgent still exists after patch. Backup restored.")


required = [
    '"tap"',
    '"assigned"',
    '"activated"',
    '"deactivated"',
]

for event in required:
    if event not in text:
        shutil.copy2(BACKUP, TARGET)
        fail(f"Missing event type {event}. Backup restored.")


# -----------------------------------------------------
# Write
# -----------------------------------------------------

TARGET.write_text(text, encoding="utf-8")

print()
print("========================================")
print("ProtoxTap card event update complete")
print("========================================")
print()
print("Events:")
print("  ✓ assigned")
print("  ✓ activated")
print("  ✓ deactivated")
print("  ✓ tap")
print()
print("No IP address or user-agent tracking.")
print()
print(f"Backup: {BACKUP}")
