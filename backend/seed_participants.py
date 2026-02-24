"""
Seed participants from Excel into the database and map certificates.

This script:
1. Reads participant data from 'Participant Details.xlsx'
2. Generates SQL to insert users, registrations, and certificate records
"""
import openpyxl
import uuid
import os
import re

EXCEL_PATH = "/Users/avi/Event Handler/Participant Details.xlsx"
CERT_DIR = "/Users/avi/Event Handler/RAJ DARBAR 2026 - Certificates"
EVENT_SLUG = "event"

def normalize_name(name: str) -> str:
    """Normalize name for matching: uppercase, strip, collapse spaces."""
    return re.sub(r'\s+', ' ', name.strip().upper())

def main():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active
    
    # Read all certificate file names and build lookup
    cert_files = {}
    if os.path.exists(CERT_DIR):
        for f in os.listdir(CERT_DIR):
            if f.lower().endswith('.jpg') or f.lower().endswith('.png'):
                name_part = os.path.splitext(f)[0]
                cert_files[normalize_name(name_part)] = f
    print(f"Found {len(cert_files)} certificate files")
    
    # Track unique emails+names
    participants = []
    seen = {}
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        if row[0] is None or row[1] is None:
            continue
        
        name = str(row[1]).strip()
        phone_raw = str(row[3]).strip() if row[3] else "0000000000"
        phone = re.sub(r'[^0-9]', '', phone_raw)[:20]  # strip non-digits, max 20 chars
        if not phone:
            phone = "0000000000"
        email = str(row[4]).strip().lower().strip() if row[4] else ""
        
        if not email:
            continue
        
        # Dedup by email (user wants email as unique key)
        # For shared emails, keep the first entry
        if email in seen:
            # Still try to map certificate for the person with same email
            # But skip DB insert for duplicate email
            continue
        seen[email] = True
        
        # Find matching certificate
        norm_name = normalize_name(name)
        cert_file = cert_files.get(norm_name)
        
        # Try partial matching if exact not found
        if not cert_file:
            name_parts = norm_name.split()
            for cert_name, cert_filename in cert_files.items():
                cert_parts = cert_name.split()
                if all(p in cert_parts for p in name_parts) or all(p in name_parts for p in cert_parts):
                    cert_file = cert_filename
                    break
        
        participants.append({
            "name": name,
            "email": email,
            "phone": phone,
            "cert_file": cert_file,
        })
    
    print(f"Total unique participants (by email): {len(participants)}")
    
    # Generate SQL
    sql_lines = []
    sql_lines.append("-- Auto-generated: Seed participants from Excel")
    sql_lines.append("-- Run with: psql -U postgres -d eventplatform -f seed_participants.sql")
    sql_lines.append("")
    sql_lines.append("-- First, add unique constraint on email if not exists")
    sql_lines.append("DO $$ BEGIN")
    sql_lines.append("    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_email') THEN")
    sql_lines.append("        ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);")
    sql_lines.append("    END IF;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    sql_lines.append("DO $$")
    sql_lines.append("DECLARE")
    sql_lines.append("    v_event_id UUID;")
    sql_lines.append("    v_user_id UUID;")
    sql_lines.append("BEGIN")
    sql_lines.append(f"    SELECT id INTO v_event_id FROM events WHERE slug = '{EVENT_SLUG}';")
    sql_lines.append("    IF v_event_id IS NULL THEN")
    sql_lines.append("        RAISE EXCEPTION 'Event not found';")
    sql_lines.append("    END IF;")
    sql_lines.append("")
    
    matched = 0
    unmatched = []
    
    for p in participants:
        user_id = str(uuid.uuid4())
        escaped_name = p["name"].replace("'", "''")
        escaped_email = p["email"].replace("'", "''")
        
        sql_lines.append(f"    -- {p['name']} ({p['email']})")
        sql_lines.append(f"    INSERT INTO users (id, name, email, phone)")
        sql_lines.append(f"    VALUES ('{user_id}', '{escaped_name}', '{escaped_email}', '{p['phone']}')")
        sql_lines.append(f"    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET")
        sql_lines.append(f"        name = EXCLUDED.name,")
        sql_lines.append(f"        phone = EXCLUDED.phone;")
        sql_lines.append(f"    SELECT id INTO v_user_id FROM users WHERE email = '{escaped_email}';")
        sql_lines.append("")
        
        # Registration record
        reg_id = str(uuid.uuid4())
        sql_lines.append(f"    INSERT INTO registrations (id, user_id, event_id)")
        sql_lines.append(f"    VALUES ('{reg_id}', v_user_id, v_event_id)")
        sql_lines.append(f"    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;")
        sql_lines.append("")
        
        # Certificate record
        if p["cert_file"]:
            cert_id = str(uuid.uuid4())
            cert_filename = p["cert_file"].replace("'", "''")
            sql_lines.append(f"    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)")
            sql_lines.append(f"    VALUES ('{cert_id}', v_user_id, v_event_id,")
            sql_lines.append(f"        '/api/v1/certificates/image/' || v_event_id::text || '/{cert_filename}', 'ready')")
            sql_lines.append(f"    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET")
            sql_lines.append(f"        pdf_url = EXCLUDED.pdf_url, status = 'ready';")
            sql_lines.append("")
            matched += 1
        else:
            unmatched.append(p["name"])
    
    sql_lines.append("    RAISE NOTICE 'Done. Users: %, Registrations: %, Certificates: %',")
    sql_lines.append("        (SELECT count(*) FROM users),")
    sql_lines.append("        (SELECT count(*) FROM registrations),")
    sql_lines.append("        (SELECT count(*) FROM certificates);")
    sql_lines.append("END $$;")
    
    # Write SQL file
    sql_path = "/Users/avi/Event Handler/backend/seed_participants.sql"
    with open(sql_path, "w") as f:
        f.write("\n".join(sql_lines))
    
    print(f"\nGenerated SQL: {sql_path}")
    print(f"Certificates matched: {matched}")
    if unmatched:
        print(f"Unmatched ({len(unmatched)}): {unmatched}")


if __name__ == "__main__":
    main()
