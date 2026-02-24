-- Auto-generated: Seed participants from Excel
-- Run with: psql -U postgres -d eventplatform -f seed_participants.sql

-- First, add unique constraint on email if not exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_email') THEN
        ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE (email);
    END IF;
END $$;

DO $$
DECLARE
    v_event_id UUID;
    v_user_id UUID;
BEGIN
    SELECT id INTO v_event_id FROM events WHERE slug = 'event';
    IF v_event_id IS NULL THEN
        RAISE EXCEPTION 'Event not found';
    END IF;

    -- ANANT THAKKAR (anant224kt@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('49784373-ad47-4cc2-bb6b-56c5e1563408', 'ANANT THAKKAR', 'anant224kt@gmail.com', '09724343046')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'anant224kt@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('268d902d-1158-4e52-adc8-3b8187ad5506', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e1bab8c1-a23a-462b-a4b5-01b60161a2d4', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ANANT THAKKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PARAG SURYAKANT SHAH (parag2002@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('769d54bb-4470-47dc-9526-dfcc6b861759', 'PARAG SURYAKANT SHAH', 'parag2002@yahoo.com', '9099927973')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'parag2002@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('97c4a1af-1c35-472d-a731-5e5b8082ae59', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('bc4f0014-1934-41c9-85ed-210e453b1d62', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Parag  SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vasudha (vasudhabhutadapp@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f6c049e0-ee04-4e56-b3e1-0876e1d6d2ee', 'Vasudha', 'vasudhabhutadapp@gmail.com', '919527848446')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vasudhabhutadapp@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fefdd597-37e4-4b02-af29-e48b75a95f43', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    -- Nirav M Desai (desainirav5@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9dd6423a-68db-4db1-8587-caba87f670f1', 'Nirav M Desai', 'desainirav5@gmail.com', '99789556690')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'desainirav5@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7dbce786-2676-4654-a16e-33933b1c1cea', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9d68702a-8076-4d43-b994-76479994ef9f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Nirav M Desai.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kinjal Dipal Patel (financialarchitect2016@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f7e1f0e1-a2b5-4a62-8d82-a7c139f362e8', 'Kinjal Dipal Patel', 'financialarchitect2016@gmail.com', '98252206600')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'financialarchitect2016@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('70a2ea81-8048-4fa0-a493-09aac8f42608', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('afd2ce34-9105-4d86-97c0-6a3a78211c78', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Kinjal Dipal Patel.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Ashish Anand Mahajan (ashish.mahajan210@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('73911cd1-f9c7-4461-8e50-552f8bd80a7b', 'Ashish Anand Mahajan', 'ashish.mahajan210@gmail.com', '09822131258')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ashish.mahajan210@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('cc5849d1-5dd9-4d96-953e-33496ff2ffa0', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('f666c609-435a-4d20-b874-df177eba529b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Ashish Anand Mahajan.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vishal Gawand (vishalgawand@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('07c159e8-4abd-48e4-bbb2-aea1b068b9cd', 'Vishal Gawand', 'vishalgawand@gmail.com', '98207147830')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vishalgawand@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('abf17a4d-5e0d-4b40-b330-ff70af604013', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('58907bf8-c98e-40c3-8126-d7da672dd32f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Vishal Gawand.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Aajay Beell (ajaybeel@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('bcf2c9d2-5ac3-4489-b89d-f8e834a58416', 'Aajay Beell', 'ajaybeel@gmail.com', '09831444448')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ajaybeel@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('44a79407-6a3d-4db6-a8cc-5f1d2e56807b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('802b8594-419e-4171-b402-e29c750a87f1', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Aajay Beell.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Viral Bhatt (viralbhatt@moneymantra.info)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d1d6d338-94fe-4fd7-a30f-ef3b955db6f7', 'Viral Bhatt', 'viralbhatt@moneymantra.info', '98199789550')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'viralbhatt@moneymantra.info';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fc0a8019-2e60-4ed0-8b33-5cf6038c0f3b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('556f36dd-189e-4520-8c86-36dcaf0724e9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Viral Bhatt.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- OMKAR GAJANAN PATWARDHAN (omkargp@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('958261cc-ab29-4344-b72f-84878ea7b0c1', 'OMKAR GAJANAN PATWARDHAN', 'omkargp@gmail.com', '98818800520')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'omkargp@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('20a9196e-bc5e-4d86-b1b3-36c6622d6a99', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('7011f9d0-3fd2-40da-86cc-56941c6780d7', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/OMKAR PATWARDHAN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- CA Pakshal Shah (capakshal.poonamwealth@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9ee5fe97-1a2b-4f47-b39f-c39c7b4b489b', 'CA Pakshal Shah', 'capakshal.poonamwealth@gmail.com', '99250058980')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'capakshal.poonamwealth@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d5df5c47-5a40-42b2-a1ca-71f2a2f87b69', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('13766c14-196f-4977-87dc-ef1146e8a40b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/CA Pakshal Shah.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vishwas Deshpande (vishwas@vishwasdeshpande.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3c3be8db-8922-4455-a5a5-bcd10224ae30', 'Vishwas Deshpande', 'vishwas@vishwasdeshpande.com', '99675497790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vishwas@vishwasdeshpande.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9cc712e8-8146-4379-aa93-6db739ccf8ff', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8972a38e-67da-440c-91b1-8fef637371e2', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Vishwas Deshpande.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- RUSHABH KIRTI AJMERA (ajmera1000@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('92f71afb-3173-4f65-9a7e-ae01f498f76a', 'RUSHABH KIRTI AJMERA', 'ajmera1000@gmail.com', '98204162760')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ajmera1000@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('b901b257-0c42-4028-9372-cadd207eb342', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b1aa75ec-3c17-484e-b702-3a020ced316d', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RUSHABH KIRTI AJMERA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Tarun Kumar Saxena (saxenatk@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e87896a9-55ef-401d-a9a8-79949ef74bf4', 'Tarun Kumar Saxena', 'saxenatk@gmail.com', '93503066760')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'saxenatk@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('59754e94-9155-4dbd-9be1-69b30a2c10ac', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3423d202-9735-43de-ace9-5bd135b8545e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Tarun Kumar Saxena.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Tanmay Yadav (pratapyadav1965@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('381cbcb2-1a74-4ffb-830d-431ccc4cca34', 'Tanmay Yadav', 'pratapyadav1965@gmail.com', '88289009460')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pratapyadav1965@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('85d406dd-8d7f-40b5-95f2-40068b8d3471', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c66561d6-584f-4f3c-baac-0e7555ea896f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Tanmay Yadav.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Siddappa Dhondappa karenavar (sdksbi@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('4b33dd92-818e-4161-b83a-72b510ddc823', 'Siddappa Dhondappa karenavar', 'sdksbi@gmail.com', '98228106030')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sdksbi@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e461dca4-1f88-4564-aeb4-457e076c0eec', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('60b85f3e-6375-4620-8457-c69f8b5c2f64', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Siddappa Dhondappa karenavar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Paras Shah (paras@dusfinserv.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('29ec9e74-c460-4b22-9618-17d5e11e2f53', 'Paras Shah', 'paras@dusfinserv.com', '81281596960')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'paras@dusfinserv.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2557c736-a8d7-45f6-8fbd-f8c82d8130c9', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('078e1eab-6c2e-488f-b5b1-63261c416066', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Paras Shah.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- VISHAL SRIVASTAVA (vishalen1044@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('61cbe856-3818-4378-a4bf-3ea8f9ff25cd', 'VISHAL SRIVASTAVA', 'vishalen1044@gmail.com', '75083611330')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vishalen1044@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('26b38069-1297-41cc-8de1-df94148223b7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c5a152bb-d929-4367-9360-50ec6c95d6d3', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VISHAL SRIVASTAVA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Nikhil Vasudev Thakkar (nikhil@wcfw.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b31aceed-6c85-4b20-9cf9-27f48d349c16', 'Nikhil Vasudev Thakkar', 'nikhil@wcfw.in', '98254254010')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nikhil@wcfw.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('f79f93f0-0fb1-4bce-9b12-5bbcaf28d25c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('2d7cfa90-6508-4900-a483-625fec306207', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Nikhil Vasudev Thakkar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Shiv Acharya (shivacharya2109@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7624d8f4-670d-4ab3-af88-b8b30b56031d', 'Shiv Acharya', 'shivacharya2109@gmail.com', '95379791490')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'shivacharya2109@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9b034a6a-63c2-4997-a5e8-3f5388a93e6b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4374bc38-ef28-4ce4-bc06-61d397963fe9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Shiv Acharya.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Viral Ashar (viral.ashar@yahoo.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d4b732bf-9852-4321-99e7-2c07fceeeea5', 'Viral Ashar', 'viral.ashar@yahoo.co.in', '70434003090')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'viral.ashar@yahoo.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('704fb8a6-f53f-4516-ab77-b0a223128c59', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('99f8503a-b429-46d7-ba54-1369783f296d', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Viral Ashar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Gaurav Bhansali (gaurav@khajanagroup.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9c410d6c-88bc-4271-83b3-a9f9c917dae3', 'Gaurav Bhansali', 'gaurav@khajanagroup.com', '98607948190')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'gaurav@khajanagroup.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('94cef68f-77e5-4656-bb31-ae6ea526268b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('82a5f879-e889-40dd-acfd-f87afd0b253e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/GAURAV BHANSALI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Pranav Joshi (prajo2002@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('63dadc09-ad79-404a-b39e-fd060b9547b0', 'Pranav Joshi', 'prajo2002@gmail.com', '77996466000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'prajo2002@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a95d6f30-d61f-4bd7-95e9-bde51391b244', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9e41542c-edbd-46f8-81ca-7acbdca06a95', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRANAV JOSHI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Anand prashant kempwad (kempwadanand92@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a588e208-1d12-4a51-8514-cbdad1417176', 'Anand prashant kempwad', 'kempwadanand92@gmail.com', '93707763500')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kempwadanand92@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('59d21c54-d58e-4175-a6e3-63b4fdbba88e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('f64ebe98-4bd6-43cd-a27c-d7f7f49a9f29', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ANAND KEMPWAD.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Jagdish nagdev (nagdevassociate@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a3b70f40-ef1a-4511-9738-3514c46affb7', 'Jagdish nagdev', 'nagdevassociate@gmail.com', '98270668230')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nagdevassociate@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c80fe91e-9ef7-412d-b478-d44ab1d068df', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('db9ee0d1-f24b-4d15-839c-bfdc243842e2', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JAGDISH NAGDEV.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Nimesh K Parikh (nimesh_dnpfin@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7a29b459-eb43-4e54-9a3c-328a80a71849', 'Nimesh K Parikh', 'nimesh_dnpfin@yahoo.com', '98250369060')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nimesh_dnpfin@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1183fb46-a954-4d4b-bb83-af800d5bdaf5', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('0ca4ca9f-27eb-4e72-b647-6373a6246833', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NIMESH PARIKH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Shailesh Gadre (shailesh@gkfsindia.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7a6c1724-09c8-4af7-bbff-c14aab2dc86b', 'Shailesh Gadre', 'shailesh@gkfsindia.com', '919860747334')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'shailesh@gkfsindia.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d073d2dc-5fee-4027-bd83-a814bea8c5e5', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ed0823ff-2c25-4f1d-9846-791e63bd9ae0', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHAILESH GADRE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mr. Mahesh Maruti Chavan (mahesh@i4investments.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a08689f1-e62f-496a-8ab9-e428016acd01', 'Mr. Mahesh Maruti Chavan', 'mahesh@i4investments.in', '9821899211')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mahesh@i4investments.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c7774523-1cfd-4d7b-a682-13b5bf786299', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('2f3c61e9-3198-4de6-b65a-8a863fa61413', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MAHESH CHAVAN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mr. Manoj Namdeo Malve (manoj.malave@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('95a6c616-59d2-4f33-a695-dee33bd7bf21', 'Mr. Manoj Namdeo Malve', 'manoj.malave@gmail.com', '98704356240')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'manoj.malave@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9d7bdcfc-56e1-4731-a074-b9fc038fc980', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('08a0854e-60a5-42a5-bf27-fbe9acd8dacf', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MANOJ MALVE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Navin Kumar (rpatelwealth@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('35cccbc2-6fe7-42e4-9015-c6ba51c26bd0', 'Navin Kumar', 'rpatelwealth@gmail.com', '98350249040')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rpatelwealth@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1dfb6e5b-660d-4c12-8f51-aa73e89689d0', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('17bb6fdf-6cdf-438e-a4e5-0a6563a9aa6c', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Navin Kumar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Jay Abhaybhai Desai (arjeinvestment@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('19010091-dfd2-49a9-bd95-7b515b36fcd3', 'Jay Abhaybhai Desai', 'arjeinvestment@gmail.com', '96383814140')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'arjeinvestment@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('71c9d468-3c49-4c49-95f9-ebe8baa1f3b2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8a506ab0-2e17-4e0c-ba91-afb0fef9b148', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JAY DESAI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Himanshu Dani (himanshudani@investsearch-india.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('c79912be-038b-4b84-9804-402eed6daa7b', 'Himanshu Dani', 'himanshudani@investsearch-india.com', '93218783640')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'himanshudani@investsearch-india.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('59240eaf-e16a-45ad-be60-99c67d58d776', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b5789a37-d0e2-4efb-b07f-5dfecd3644e9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Himanshu Dani.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Reshma Dalvi (saptshree.investment33@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('c04f7f42-72ad-4b9c-b3b5-79d1a0045ddf', 'Reshma Dalvi', 'saptshree.investment33@gmail.com', '08693020123')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'saptshree.investment33@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('83758383-b2c9-4103-8689-0aaff1651deb', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('84f20e7f-8923-40c4-a900-a192d9de9ddb', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Reshma Dalvi.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Prateek Hinger (phinger39@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0c086043-a107-47d9-b607-31772dd7e382', 'Prateek Hinger', 'phinger39@gmail.com', '75973339990')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'phinger39@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d835e629-03b0-4a28-9975-d97cfc178161', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e68a3719-e6a3-4209-a54d-26cbea441f44', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Prateek Hinger.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Manoj Manjrekar (manojmanjrekar@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('72a75d3f-49ae-4fb7-945e-8e4f29d25d1a', 'Manoj Manjrekar', 'manojmanjrekar@gmail.com', '98200994000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'manojmanjrekar@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c1adb82d-c467-469e-a3d2-178baa79213e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3d5bd9fe-f4b0-4b62-98aa-bb176919e14e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Manoj Manjrekar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- ASHWINI MANOJ MANJREKAR (poonammanjrekar72@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('8b5eadb6-1337-4e0b-88c8-da73f3d6db92', 'ASHWINI MANOJ MANJREKAR', 'poonammanjrekar72@gmail.com', '98204448550')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'poonammanjrekar72@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('3a9dca94-286b-42a8-a2d1-fbc8bdf82f0f', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4a6db889-2dfc-40a5-a4f4-4b4cc301ee1d', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ASHWINI MANOJ MANJREKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- JANARDHAN A LALWANI (jmdinvest79@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('2ca25506-1198-486d-a9f3-bcc724c1a170', 'JANARDHAN A LALWANI', 'jmdinvest79@gmail.com', '98211355050')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'jmdinvest79@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('dfe93306-df5c-4c0e-9042-d4aec03bea2a', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('64dcf35c-7dda-4eee-80f1-e1dcf82c3127', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JANARDHAN LALWANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Shamsad idrisi (smidrisi@yahoo.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('334366e2-6ff6-492b-a825-e11267ecb130', 'Shamsad idrisi', 'smidrisi@yahoo.in', '09821769549')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'smidrisi@yahoo.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d8af3ac0-261f-4c1e-85a3-657c03fbbd97', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b79a2c41-95fd-4837-9109-fe72d6fc8f74', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHAMSAD IDRISI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rakeshkumar Devchandbhai Patel (mayalnbt@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3e1ec883-65a0-4b89-af75-e696a0513b87', 'Rakeshkumar Devchandbhai Patel', 'mayalnbt@gmail.com', '98259383010')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mayalnbt@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1801b2cc-7fcf-4baa-8bdc-09bb93d3b99e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('49e7668d-d152-4893-b2b1-9ec5af19759c', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAKESHKUMAR PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mirang K Parikh (mirang@scudmarfin.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('30d0c502-fedd-4873-9d11-584b7d94c65b', 'Mirang K Parikh', 'mirang@scudmarfin.com', '98250930770')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mirang@scudmarfin.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('4eb1c1ed-f34e-4be8-8bc7-3b838bb5f9b9', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('fb537ef7-1ce4-470d-b438-21d5004ddcfa', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/Mirang K Parikh.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rishi Gupta (rishigupta1976@yahoo.co.uk)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d0055e4b-d833-4468-9bf2-c915690bfb51', 'Rishi Gupta', 'rishigupta1976@yahoo.co.uk', '97968994670')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rishigupta1976@yahoo.co.uk';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7c8a2ec6-fbc2-4ca7-899f-f44c6c9589a2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('da4c8801-b5a7-454b-9d15-95797ef1b43a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RISHI GUPTA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vishal Baxi (vishal@arthavriddhi.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('aedd57f6-ac76-4218-ab68-297c7bf0139f', 'Vishal Baxi', 'vishal@arthavriddhi.co.in', '9819946596')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vishal@arthavriddhi.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('aa204374-cb4e-47e5-8ecb-ec5dbc0bce06', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c191c828-9a04-4c7c-bcb0-c3ada134da81', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VISHAL BAXI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Partha Shah (partha.shah@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('eb36015e-bd21-4282-8e43-09d0401b1981', 'Partha Shah', 'partha.shah@gmail.com', '08141027000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'partha.shah@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fe398fe6-af30-49ef-b0f1-d62a5e1cc6bc', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('28e85e1e-b86d-41b6-a09c-f9b95ff2620b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PARTHA SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Viral Trivedi (viraal@fundfox.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b224e3b5-93e7-4ac1-bbc2-7d3f7b4c1b70', 'Viral Trivedi', 'viraal@fundfox.in', '96193961430')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'viraal@fundfox.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('ff0237c8-71a2-4569-87df-15e19c6342aa', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9ee9619b-613f-4157-8b7a-085205db8aab', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VIRAL TRIVEDI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- S G BHAGAT (support@bhagatfinplan.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('39df9afc-071f-4c60-9066-aa0ab0f05156', 'S G BHAGAT', 'support@bhagatfinplan.com', '98201905790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'support@bhagatfinplan.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('64113a20-adbc-4e84-bdb9-25c45195dfae', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ae8c38d9-2a63-43c9-8a96-027038128dc8', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/S G BHAGAT.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Neena Jamdade (neenajamdade@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('df361b16-847a-485f-8b6d-ddbd9fe7b827', 'Neena Jamdade', 'neenajamdade@gmail.com', '98194349750')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'neenajamdade@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('44362dc8-1d7b-454f-abc1-95210829f4d5', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d168217f-afbc-445b-8799-610d1f47b2dd', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NEENA JAMDADE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Navin mehandratta (mgm_ratta@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e5d9c776-6434-4b47-aede-08d69d415b1b', 'Navin mehandratta', 'mgm_ratta@yahoo.com', '98374546010')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mgm_ratta@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5d56bb9a-4960-4132-bd28-a5d4ccb696ae', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6c856590-12a0-4290-b1dd-0ff5a6bec8d3', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NAVIN MEHANDRATTA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Nihar Jayesh Shah (nminvestment.in@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('889e993a-eb09-4f9d-85be-78fa1260bde6', 'Nihar Jayesh Shah', 'nminvestment.in@gmail.com', '98259688770')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nminvestment.in@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('cf58e83d-436b-4fc1-a3f7-6dc95ff59527', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8787f4b8-4d67-4b51-a9c5-45d9ce3b5043', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NIHAR SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vaidehi Deshpande (vaidehi@vishwasdeshpande.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3ce5b02e-65b7-4c0f-b820-97600cccaa81', 'Vaidehi Deshpande', 'vaidehi@vishwasdeshpande.com', '98925381390')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vaidehi@vishwasdeshpande.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('64a1266a-a4b2-47b2-bea6-8725ec4b283d', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9f7eeb8d-e47f-48d3-b7a8-26c04dc93109', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VAIDEHI DESHPANDE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Shekhar Yashwant Mohite (shekharmohite26@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('63637c92-671d-4a6b-89f8-6ed990bf14d5', 'Shekhar Yashwant Mohite', 'shekharmohite26@gmail.com', '98503636120')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'shekharmohite26@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2b82c3c8-ac2c-432e-96ff-78e24a9e3fb7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('468db9cb-31fc-4a3c-a2f2-f8f293c70329', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHEKHAR MOHITE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Priyank Thakkar (sohamcapitalservices@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('64ef8a93-466e-4104-a6f6-ffcd5aa51a12', 'Priyank Thakkar', 'sohamcapitalservices@gmail.com', '97129362310')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sohamcapitalservices@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c9f3c93a-c7cc-4b16-9f1c-95dd2d317bc6', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('38ded27b-497b-4fcb-a23c-5e5c87d994e8', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRIYANK THAKKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- KEYUR DALAL (keyurdalal78@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('5ef9bbaf-d383-4b2f-b48d-14719e626fd7', 'KEYUR DALAL', 'keyurdalal78@gmail.com', '98250756440')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'keyurdalal78@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0fa6dc3d-a1be-4183-a9fb-c26fc35ec7f8', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('843ef270-abff-4dd6-aa87-d0589d25aeaa', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KEYUR DALAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- HEMANT RAHEJA (moneyvalueadvisory@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9a14b460-126d-4231-b8f2-0add73891319', 'HEMANT RAHEJA', 'moneyvalueadvisory@gmail.com', '98887078880')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'moneyvalueadvisory@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('4c0e4387-9979-49e3-a86f-8bfa88a2d78a', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('11bb5786-a285-4f2d-b667-3ec12debdcff', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HEMANT RAHEJA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rahul Desai (drinvestmentservices@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('32088efb-6c34-437a-aac2-8c6914148cae', 'Rahul Desai', 'drinvestmentservices@gmail.com', '99786238050')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'drinvestmentservices@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0924bf57-2b7c-46c4-9bb3-8324d2603a29', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('77a9f102-cadf-4eec-bd07-c5d4f19e5670', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAHUL DESAI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Pragya Sinha (lawyerpragya@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('15d7005e-8026-42e0-b577-0eed30900a4e', 'Pragya Sinha', 'lawyerpragya@gmail.com', '70330511420')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'lawyerpragya@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7cff0f76-9dce-4487-9229-557e70c820fa', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('14f8d269-32b5-44b7-90b3-fd3823ca56ee', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAGYA SINHA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rahul Mehra (rahulmehra.nbt@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e3ba6f77-ad5a-4582-9021-5b1966f21da9', 'Rahul Mehra', 'rahulmehra.nbt@gmail.com', '93100515920')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rahulmehra.nbt@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e259c2ec-9562-4870-8de8-8b6b1536b1a7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('900becb7-2088-462e-a67e-828425069dbf', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAHUL MEHRA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sagar Kirankumar Panchal (atyourservice@ragingsuccess1.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b569be4f-17dc-4e98-9c42-aadf50bd341c', 'Sagar Kirankumar Panchal', 'atyourservice@ragingsuccess1.com', '90333567220')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'atyourservice@ragingsuccess1.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('b091e8da-e57a-48c7-9d8a-fc0d3baa7cba', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('990a43be-c030-4221-a680-30ed9b351384', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SAGAR PANCHAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- MRUDANG PARIKH (mrudangparikh@zohomail.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d2682e7c-e409-4841-8681-807074d33416', 'MRUDANG PARIKH', 'mrudangparikh@zohomail.in', '93272556680')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mrudangparikh@zohomail.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7751d43a-dec1-4a1e-812b-b8bf304e385c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('a50c5a66-60ad-45b0-82ee-a002bef6100a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MRUDANG PARIKH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PARESH P PARIKH (paresh.parikh7@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('2684092f-a668-4b93-bb05-d1aa780787ec', 'PARESH P PARIKH', 'paresh.parikh7@gmail.com', '93762114460')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'paresh.parikh7@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2f833e12-a31d-45a2-ac89-5699eee4d41e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('46e600b2-dc53-4479-888a-445460c9f17c', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PARESH P PARIKH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- P B Gurusankar (p.gurusankar@futurevista.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9167fa1e-ae32-4cf8-a0f7-391ffede4d9b', 'P B Gurusankar', 'p.gurusankar@futurevista.co.in', '97654128350')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'p.gurusankar@futurevista.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('be3f1790-3947-42ae-8fc1-1e4d24d60572', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8ebb2ae2-393d-4180-af27-098a17dd1f4e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/P B Gurusankar.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kajal Balasaheb Patil (kajalpatil8474@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('044043f0-df55-47f5-abeb-3b8f8cb84320', 'Kajal Balasaheb Patil', 'kajalpatil8474@gmail.com', '84463094050')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kajalpatil8474@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a901c286-f974-47f8-bdb7-2ce525e7ca1c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('07ea91aa-b55b-43ae-b622-636d98b059c3', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KAJAL PATIL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Tushar Sheth (tusharcvma@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('91c3c5cf-10d1-4c02-b30b-2d18d1d15acb', 'Tushar Sheth', 'tusharcvma@gmail.com', '99757956690')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'tusharcvma@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('17ec30b9-6731-4088-8a4d-f7f86b7831df', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('93128ad4-2017-4fee-91e8-d68b91b1d52a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/TUSHAR SHETH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kalpesh Patel (kalpesh.patel1965@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('72ea1493-bc0d-49cd-93fb-2e07d67f3686', 'Kalpesh Patel', 'kalpesh.patel1965@gmail.com', '98795491560')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kalpesh.patel1965@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('219871e3-1274-40ff-9ff3-fd937448f53c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ae96accf-a7a6-440c-b794-e64996635c87', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KALPESH PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- DHEER TUSHAR SHETH (dheersheth17@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('1d469fae-2102-4f54-9f71-cb5f5b75d879', 'DHEER TUSHAR SHETH', 'dheersheth17@gmail.com', '95952979790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'dheersheth17@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('6b7c7e3a-92a7-406f-a964-45d9488a9f05', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d558764f-a3dc-490c-a53a-2a24235c591b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DHEER SHETH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rajesh Guliani (rguliani@talk2invest.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('ffbf1d56-600b-438b-8d34-09b3575a101d', 'Rajesh Guliani', 'rguliani@talk2invest.com', '98102150030')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rguliani@talk2invest.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('73053526-b0f5-4def-bbba-0d2525a5ebe4', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('be0f98e2-4561-460f-bcff-886bd7fd3f44', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAJESH GULIANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Priyanka Ketkar (priyanka@purplefinch.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e0cea99b-58e5-4b38-9b85-7038bb11a1b4', 'Priyanka Ketkar', 'priyanka@purplefinch.in', '91672944330')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'priyanka@purplefinch.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0e1ee652-a02d-4b90-9dfe-a7e7ab29aa4a', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d5ea405f-6134-413d-8a8e-6d941f96157a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRIYANKA KETKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- RUSHITA K PANCHAL (pasresh.parikh7@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('08774cae-ec42-4d3f-8377-ace5231e3027', 'RUSHITA K PANCHAL', 'pasresh.parikh7@gmail.com', '93762114460')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pasresh.parikh7@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fe51d1c3-6a47-4973-a0bd-fe18f845bb30', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6d17ab52-0407-4f0a-b966-1cb79744feb0', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RUSHITA PANCHAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rakesh kumar mishra (rakeshmgkp@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a3b6573e-23d7-4302-9e3c-0bb310273802', 'Rakesh kumar mishra', 'rakeshmgkp@gmail.com', '94502342690')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rakeshmgkp@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a8286afb-2958-471b-9191-7c25f511607a', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('cdb4c260-db7f-498e-a1b2-b83bd84cff02', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAKESH MISHRA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Yogesh Chintaman Kulkarni (yogesh.royal@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('06b45cb6-3906-45e3-8a1d-9493c8a13f1a', 'Yogesh Chintaman Kulkarni', 'yogesh.royal@gmail.com', '94220076700')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'yogesh.royal@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1ee53d3a-c380-4ae8-914b-4ef826f1de85', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('22fa36aa-058d-425a-a460-d2c74603c8ee', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/YOGESH KULKARNI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- AMOL PRAKASH LIGADE (ligadeamol4u@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('69076707-11c8-4755-9e54-8b10b5dafc38', 'AMOL PRAKASH LIGADE', 'ligadeamol4u@gmail.com', '99702802570')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ligadeamol4u@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5519ddff-26fa-4d06-aab7-33ded62126dd', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('fdfd8d43-72b1-4ba3-b85d-48707ecf48a4', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AMOL LIGADE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- DEVANG N PAREKH (parekhdevang7@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('aa81f167-5ab8-4588-a41b-5fcb868e1417', 'DEVANG N PAREKH', 'parekhdevang7@gmail.com', '99235599920')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'parekhdevang7@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e1c69eb2-dce1-4a05-b655-a0da78818a8e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9b1cebb4-8ee5-42bc-8d00-a8e4e0c4295e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DEVANG PAREKH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Srikanth Matrubai (matrubai.srikanth@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9db2b4cc-bc71-4474-b690-c9a818231c76', 'Srikanth Matrubai', 'matrubai.srikanth@gmail.com', '09620080360')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'matrubai.srikanth@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('f2deb436-b6c8-4911-8cf9-4b8a8c57b1d2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('eb2bae3c-5785-4080-93f7-c2ccc8f3f5b5', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SRIKANTH MATRUBAI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Tushar Ramdas Amrutkar (tushareamrutkar@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('dc73dea9-bb38-43cf-9a97-017807911c6c', 'Tushar Ramdas Amrutkar', 'tushareamrutkar@gmail.com', '94222522400')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'tushareamrutkar@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5ad64205-2ff7-480f-b807-b703142a5b33', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3716d20b-545e-42ef-9eea-93481d2eb6d7', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/TUSHAR AMRUTKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Devendra Hinger (dkhinger1@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7d3a0ee6-bee7-4424-b0be-c5c8cc6cce9c', 'Devendra Hinger', 'dkhinger1@gmail.com', '94141749230')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'dkhinger1@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('07f7eac3-11aa-4fca-a705-07c4c52f2adf', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('987cfc95-d794-486a-9946-c7274acebd2a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DEVENDRA HINGER.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Ankita Shastry (ashwamedhindia@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('65e14e1e-31ee-4a04-81fe-ecaf9bf7ea88', 'Ankita Shastry', 'ashwamedhindia@gmail.com', '97731643870')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ashwamedhindia@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('4856e941-3ee2-48cc-855d-3a0047f2b3cb', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e69a76ab-d491-4e9f-8c9c-b2ac65acc1df', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ANKITA SHASTRY.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Dhansukh Swarupchand Shah (poonam_invest@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d55686be-bf54-4a90-8e75-758d1168ff02', 'Dhansukh Swarupchand Shah', 'poonam_invest@yahoo.com', '98251317710')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'poonam_invest@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fc247f95-fa43-43e3-be5a-3397c55e81d1', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('1b9af288-b880-40fb-a2cb-dd3cb26bb6e3', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DHANSUKH SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- sailee velankar (saileepv74@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('2f0d9a80-ac25-463d-b070-b75654ec6c0a', 'sailee velankar', 'saileepv74@gmail.com', '98339208980')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'saileepv74@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('cfaf7cb0-e250-4b3f-b2a9-bc342a4139b3', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('2ce3ef57-a61d-4e2e-ac19-3616dc7a939a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SAILEE VELANKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Labdhi Shah (labdhishah.invest@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d4d9db90-6c9d-4dd4-ba82-3e14f35d45f7', 'Labdhi Shah', 'labdhishah.invest@gmail.com', '99873279120')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'labdhishah.invest@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a3cb216c-a970-4266-8cbc-ef368314bcf3', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c0d35148-4d4f-4daf-aeb5-13f0c38eb7a9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/LABDHI SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vishwajeet Vijayakumar Dalvi (vishwajeet555@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('97445771-801d-409d-b846-5538c0c13206', 'Vishwajeet Vijayakumar Dalvi', 'vishwajeet555@gmail.com', '93711215530')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vishwajeet555@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('af846fa6-1027-463a-9728-b8a5e51d9b6d', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3b41c7bc-ec92-41bf-9d1d-7ceaad443f89', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VISHWAJEET DALVI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Ravindra Shankar Deshmukh (ravideshmukh35@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('aefc5059-a587-4950-a686-b2b69d631241', 'Ravindra Shankar Deshmukh', 'ravideshmukh35@gmail.com', '90961023010')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ravideshmukh35@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('36f59ea2-b34d-49b9-8bef-bceb2aaec0ad', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('7797e91f-4b6f-499a-9e52-434c01ef50bb', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAVINDRA DESHMUKH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- BHAGYESH MAHENDRA JOSHI (bhagyesh301296@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('4531ae46-6563-43c0-91b5-cda7d7c4e000', 'BHAGYESH MAHENDRA JOSHI', 'bhagyesh301296@gmail.com', '82089005980')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'bhagyesh301296@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('3bbbd0f3-98a3-4f63-b3c5-e20813195bb9', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b4fd17ab-9e71-4880-8f83-5addf3495171', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/BHAGYESH JOSHI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vinay Singh (vinaysingh_2000@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('21948594-b8cf-4476-ac95-47aa27102e42', 'Vinay Singh', 'vinaysingh_2000@yahoo.com', '98205978790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vinaysingh_2000@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('102af406-533f-487b-a27f-11e0dcb1b97c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8ed66cdf-ce1f-4ac0-9fd0-ae4e30801af3', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VINAY SINGH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sandeep Bhargava (sandeep@srinvestmentsonline.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d4318b67-beb6-4b2f-bfc0-e5811d15323d', 'Sandeep Bhargava', 'sandeep@srinvestmentsonline.com', '98103872340')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sandeep@srinvestmentsonline.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1889719f-d697-404e-b063-1bba3215c82e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b8df35fe-528a-462b-95a0-599286e1c20d', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SANDEEP BHARGAVA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Pankaj Kumar Gera (pankaj@gwc.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('cf1eaff0-ef0e-41c8-9563-b9780ebef0bc', 'Pankaj Kumar Gera', 'pankaj@gwc.co.in', '98912504430')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pankaj@gwc.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d100e3e8-7c56-4762-97e3-7496cd277f26', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8dc1920d-db0c-4e27-b8d4-bd38b5d7273c', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PANKAJ GERA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Satyajit Ratnakumar Shah (satyajitinvestment@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('51c80df4-74e6-405c-b6c3-5d76aff43a36', 'Satyajit Ratnakumar Shah', 'satyajitinvestment@yahoo.com', '98230205500')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'satyajitinvestment@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('95f0ba8f-1295-4117-8100-376abc6cfdb6', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b8a372aa-8c4c-4e84-99e3-0c7331f6811a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SATYAJIT SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- RAVINDRA SUDHAKAR KULKARNI (ravindra.kulkarni@futurevista.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('31236fc7-814c-4e85-bda0-3235dd8804d7', 'RAVINDRA SUDHAKAR KULKARNI', 'ravindra.kulkarni@futurevista.co.in', '09850984699')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ravindra.kulkarni@futurevista.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c1b756f3-edfa-4b85-8281-1b5b80dff950', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8228b887-9520-4bc0-aae5-a23094634fa5', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAVINDRA KULKARNI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Dipti Thakkar (thakkarassociates2012@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9dfc3939-782e-4895-85ae-d9a8a215c750', 'Dipti Thakkar', 'thakkarassociates2012@gmail.com', '98190187750')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'thakkarassociates2012@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('8df58692-f439-4e04-bc6f-4ee03ff8a7c6', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('bcd5780b-ec4f-45ef-9d08-1221ce6c8d6a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DIPTI THAKKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Parshant Khandelwal (parshant16@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('6ae5ec2f-4786-4687-b47a-4f65ee5b5bf3', 'Parshant Khandelwal', 'parshant16@gmail.com', '93154258080')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'parshant16@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('92724ef8-c248-443d-91e2-26925bddccab', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6ea5668f-839b-4a8c-8267-ac040c0a7bc5', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PARSHANT KHANDELWAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Jagdish L Kakadia (jagdishkakadia.nbt@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0d4a3b69-1d8f-4576-a4f8-917db46a2b51', 'Jagdish L Kakadia', 'jagdishkakadia.nbt@gmail.com', '98255851740')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'jagdishkakadia.nbt@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('60f07556-b2e4-40b3-a1a8-6e52b4d47e0f', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b34ef671-d246-4d64-aebe-a43b307ffe56', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JAGDISH L KAKADIA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- AMIT PRADEEP SHARMA (sharmaconsultantsthane@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('dfcca2fa-1fbd-4caf-b3d0-72875155e80c', 'AMIT PRADEEP SHARMA', 'sharmaconsultantsthane@gmail.com', '09821810076')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sharmaconsultantsthane@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('bb86b11b-dd02-42e4-8ad2-35d0fc9f5364', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('0aa9e5fe-5df1-46ec-b779-a657b55826be', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AMIT SHARMA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- DEVANG SHAH (devang@dusfinserv.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('ca03cad0-7cac-4565-9a98-139c587774ef', 'DEVANG SHAH', 'devang@dusfinserv.com', '98251331400')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'devang@dusfinserv.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5b2b7501-22fb-45a5-896f-cdc606df7730', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('89b46b12-53f9-458b-93fe-2708a9e78c55', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DEVANG SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sharvari Deodhar (sharvarideodhar17@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('dc8dab2e-4deb-4459-9241-582af0f2fba4', 'Sharvari Deodhar', 'sharvarideodhar17@gmail.com', '99204350930')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sharvarideodhar17@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('3c9e7221-8ce9-41b6-a65f-b40e5d8453a7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4f497600-0431-4de2-96c3-ed0b216577e4', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHARVARI DEODHAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kashyap mukundbhai patel (growwellwithnbt2022@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f94fd0ff-1c90-4f00-bfe9-a2c64f824dc5', 'Kashyap mukundbhai patel', 'growwellwithnbt2022@gmail.com', '95865792730')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'growwellwithnbt2022@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2e82fb58-4f5d-4b5a-bb7c-44a05ca111b7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6902e461-b69e-4eda-841e-8931e27b8add', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KASHYAP PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PARESH VANMALI HALDANKAR (paresh.haldankar@yahoo.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('868a42ee-a228-4499-9b8b-cf35b741600d', 'PARESH VANMALI HALDANKAR', 'paresh.haldankar@yahoo.in', '98200843240')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'paresh.haldankar@yahoo.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('6d5b9643-83aa-47ff-935d-5900c3da06c2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4373f7e8-c8cc-4dbc-998a-ddf3fb573333', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PARESH HALDANKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- urvish vasawnala (urvish@finoptical.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e89d03fd-1915-4185-be37-17966c1cc97f', 'urvish vasawnala', 'urvish@finoptical.com', '80007464000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'urvish@finoptical.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e952864d-3e9e-4ca2-ae0b-ff786e424a9e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('01a670e3-d1ee-4bb8-a625-cf0116f23d89', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/URVISH VASAWNALA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- AVINASH SINGH (moneyfarming.as@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3af76763-f70e-4c8c-8633-5454fde755bf', 'AVINASH SINGH', 'moneyfarming.as@gmail.com', '07874444400')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'moneyfarming.as@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('8a62d206-e631-4081-a7ab-318ad19eb0f3', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e5932d91-14b2-46e8-91ec-32157255277f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AVINASH SINGH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sagar Sampat (sampat.associates2018@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('9e58b0c7-bba3-4ff2-a7c0-9a495f318a00', 'Sagar Sampat', 'sampat.associates2018@gmail.com', '86907162340')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sampat.associates2018@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9d4d9187-774c-41c6-b407-a151b00e48b9', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('af906edf-1cc7-4044-95b5-11b68a027129', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SAGAR SAMPAT.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Aaditya Velankar (aadityav03@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0d49ba30-df1a-4b8a-b0d9-726e1b046786', 'Aaditya Velankar', 'aadityav03@gmail.com', '99202821920')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'aadityav03@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('bba58f4d-730d-4ee4-a120-4e324497455c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('714536e4-36ad-42e8-a61e-5b392c83e7b7', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AADITYA VELANKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sanjeev Puri (snjv.puri@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('53a35f9a-2dc3-41d3-95ec-587d56af5e57', 'Sanjeev Puri', 'snjv.puri@gmail.com', '09205926207')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'snjv.puri@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2f890794-b6f3-4034-a143-b793b7286448', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3387313f-c3c8-4452-ab4c-6432eb70c56e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SANJEEV PURI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Krishna Pandhare (kmpandhare@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f416995b-2d6a-4970-9b30-6b39d9532093', 'Krishna Pandhare', 'kmpandhare@gmail.com', '98229146920')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kmpandhare@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fc5920f5-552b-4ac0-b3ce-4e480470039b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('25344ea0-6288-420d-9ce2-e1d5a61d71a9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KRISHNA PANDHARE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Dinesh Bhalawala (bhalawan@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('bc93ba1d-f310-4721-937f-492d42ad1ddd', 'Dinesh Bhalawala', 'bhalawan@gmail.com', '98241576540')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'bhalawan@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c4aa869f-f9ff-4236-9b28-9b3da03011e8', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('12609f94-52ec-4896-ab1a-b3f32042c60f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DINESH BHALAWALA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Hitesh Vasani (hiteshvasani03@yahoo.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('668b35dd-a3c9-47e6-afc6-cd0b23c0c714', 'Hitesh Vasani', 'hiteshvasani03@yahoo.co.in', '98251357680')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'hiteshvasani03@yahoo.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('56130ce2-6c67-468f-85ee-0f5675203c8c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('80f7614b-79aa-43a5-b632-2443cf4e77c9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HITESH VASANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Pratik Pawar (pawarpratik555@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('80171cd1-b729-41d7-9fd1-b44c188edc6f', 'Pratik Pawar', 'pawarpratik555@gmail.com', '73855557770')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pawarpratik555@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5b54b669-0976-4944-9402-a359ef288621', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('94589efa-0278-43c4-a2dc-a360ae53d977', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRATIK PAWAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Dharmesh Mehta (prathaminvest@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b75771c6-d2d0-4f13-bcf6-8a5bd5350a68', 'Dharmesh Mehta', 'prathaminvest@yahoo.com', '98251237670')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'prathaminvest@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('f43a08da-ae32-428e-a0d7-5e70e0e2b8aa', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('43691c98-eaf4-42ea-bbed-f7a8f3284911', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DHARMESH MEHTA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- SACHIN PATIL (sachin.patil2345@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3287c75d-6192-468b-a99f-78f05cd36c9a', 'SACHIN PATIL', 'sachin.patil2345@gmail.com', '94239135600')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sachin.patil2345@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('cb9fde1b-247f-4fbc-82f6-9ee1aa5d838c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8e598298-9514-450d-af3e-b1f8f5302188', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SACHIN PATIL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- HEMANSHU AGARWAL (hemanshuagarwal@yahoo.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('804a761b-2da1-4821-99b8-a936c0227432', 'HEMANSHU AGARWAL', 'hemanshuagarwal@yahoo.in', '99032995290')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'hemanshuagarwal@yahoo.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('f2165cfc-63c9-49e0-9865-bc8e27a4feca', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4c705d0e-ef17-4e76-9f68-430c49cda131', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HEMANSHU AGARWAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Jenil Jethwani (learning.jenil@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('ff0c61ae-17b8-490f-8078-d133f8eb7cb6', 'Jenil Jethwani', 'learning.jenil@gmail.com', '90162588520')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'learning.jenil@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1dd0da0b-7fe6-431e-850a-145b058d1241', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('1a618fe1-8f24-42a9-bf62-b6a955077330', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JENIL JETHWANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kiran Prakash Jethwani (kiranjethwanilearnings@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e3122d8b-a465-478b-ae37-d4895b040750', 'Kiran Prakash Jethwani', 'kiranjethwanilearnings@gmail.com', '77779239430')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kiranjethwanilearnings@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0284eed2-89ce-4f5d-a697-3e38370f7fad', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6575b8b8-63e9-4d7f-893c-882da5f61ce6', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KIRAN JETHWANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mukesh Jetani (mukeshjetani@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3947fd04-7b8e-45cb-bb40-3b045628dc5a', 'Mukesh Jetani', 'mukeshjetani@gmail.com', '98249866990')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mukeshjetani@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0fa7f7e2-eba0-48eb-b12e-60d44ce08284', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('f8638443-ecef-4b51-8825-ec255f19486a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MUKESH JETANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Himani Jetani (himanijetani@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3102543e-ff2a-4ab6-bb2e-2e3a22a509bc', 'Himani Jetani', 'himanijetani@gmail.com', '90234102790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'himanijetani@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('34e25844-3e54-49a1-b27b-ecf67c1146fd', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('13686365-e03d-44a7-babd-ea9ecfe58146', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HIMANI JETANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Nensi Paun (nencypaun0505@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f29f69a1-3cc2-46f9-99ab-dd35d4aaeba7', 'Nensi Paun', 'nencypaun0505@gmail.com', '87805361790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nencypaun0505@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('345df76a-061d-4c9b-982f-84c2e33db5a4', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('60b213e2-dd79-431a-adb0-7667a580bce7', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NENSI PAUN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Yogita Bobale (yogita.ingulkar@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('2749ca2a-d6d3-45d8-b998-ca35ecb8302e', 'Yogita Bobale', 'yogita.ingulkar@gmail.com', '97022201750')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'yogita.ingulkar@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('371f340e-9b99-4f17-8d2d-c47dac3245ff', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('79c6c020-d724-4bdc-9ddc-7a0e3f8164e2', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/YOGITA BOBALE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Hardik Vekaria (hkvekaria@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('fdc51d53-48f7-4906-9458-886fc40615ba', 'Hardik Vekaria', 'hkvekaria@gmail.com', '98248385710')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'hkvekaria@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e9dc90a1-fd55-4bb9-a2f6-b54e3e51789c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ee31b9cf-acc3-40ec-8ba8-1dc3dedcd7b6', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HARDIK VEKARIA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rohanshu Savalia (rohanshu60@yahoo.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('dde95695-961f-496e-b583-c74d9f22bf88', 'Rohanshu Savalia', 'rohanshu60@yahoo.in', '88668002210')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rohanshu60@yahoo.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5e3cb796-c319-44f6-9808-a930fdc1b676', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d8220c5d-880a-4150-b3b5-cf98f8a34a26', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ROHANSHU SAVALIA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Santosh Suresh Shah (santoshshah44@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3fb2f33a-7108-47d4-8cea-a3567f1f3d1e', 'Santosh Suresh Shah', 'santoshshah44@yahoo.com', '75882865200')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'santoshshah44@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('633faa98-b5ef-42bc-8926-45bb24111e45', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('7b6119cb-21b2-4564-b991-8fc825d02a70', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SANTOSH SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Prakash Rane (realnet@njfundz.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('edcbd52c-2cbc-4fbc-bf7a-2cd17219aba4', 'Prakash Rane', 'realnet@njfundz.com', '98200846820')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'realnet@njfundz.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('2c4eb1d9-1da4-4bf3-80d0-d1e953c8047d', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('df63176c-9be1-43fc-9968-908cdfcbfcc9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAKASH RANE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Jittendra Khairnar (jeet.khairnar@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0f755ed5-0a3c-4be0-81e4-c3bc50dd6f85', 'Jittendra Khairnar', 'jeet.khairnar@gmail.com', '98224778790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'jeet.khairnar@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a465b770-a603-40ab-83a2-4c59241c9f23', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('f0b4fd0c-5d0e-42ec-b2f4-0e29270d98f8', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JITTENDRA KHAIRNAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Vishal vishnukant shah (vvs.vishalshah@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3f13ec8b-8fac-4fd8-876e-29843fba10d0', 'Vishal vishnukant shah', 'vvs.vishalshah@gmail.com', '91564030690')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vvs.vishalshah@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fa650566-d067-4399-a5d6-26b7a6b0041f', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3571de3c-3879-422c-bf31-8cf792c3fccf', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/VISHAL SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Shubham Malani (srinvestmenttraning@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('28eb8398-b523-456d-8180-9f41461e7f80', 'Shubham Malani', 'srinvestmenttraning@gmail.com', '70758675350')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'srinvestmenttraning@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('b32e5ff5-3ed8-4d84-9332-22ef962692c0', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e6af41ca-c0ae-4417-bcc4-3d139287e32b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHUBHAM MALANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Prasad Joglekar (prasad@finkeys.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('dcd7e784-0182-480a-92a2-b67c5c66a9fd', 'Prasad Joglekar', 'prasad@finkeys.in', '98693269990')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'prasad@finkeys.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('8945d5b0-7541-47ff-a4c4-42c46aa12e15', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('541f6845-a538-4fb8-817b-0b391dfd3cf8', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRASAD JOGLEKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Biranchi Narayan Sarangi (arbiswealth@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('6b59c885-8518-49cd-8aeb-69ad0f46f561', 'Biranchi Narayan Sarangi', 'arbiswealth@gmail.com', '99300747190')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'arbiswealth@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('cdbd9260-9b6b-4bdc-98c1-8bd3d7bbe5b6', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('1e414073-d99c-413f-88d3-68a358c2977b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/BIRANCHI SARANGI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Bhavin Sarda (sardainvestment@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('30c64a9e-3a12-410b-825c-2579c94f88f1', 'Bhavin Sarda', 'sardainvestment@gmail.com', '82001216000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sardainvestment@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('f515d91d-451f-4d67-88f3-4badbd7e9604', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('44d8d8ef-6120-4c17-a5c9-981190384762', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/BHAVIN SARDA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Dinesh Anand Suvarna (dinesh@njfundz.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('fbf8c285-64b3-473d-80e1-722d160bb70e', 'Dinesh Anand Suvarna', 'dinesh@njfundz.com', '98199974340')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'dinesh@njfundz.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('949d2ab6-24f8-4cf5-b799-c7920d25d25a', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('7b6fa4df-fa81-4781-a4f1-60fb87e0de7f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/DINESH SUVARNA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sharan Patil (sharanpatil@inspireindiafs.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('10250ab8-df48-4a83-87d3-23d10ee30638', 'Sharan Patil', 'sharanpatil@inspireindiafs.com', '96630668990')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sharanpatil@inspireindiafs.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('b8f209a7-202b-46e3-9481-f76fb0b766bf', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8bbf6627-8f94-42bf-9723-06f99f884db1', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SHARAN PATIL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kavitha Matrubai (kavikent@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a046f224-2d91-4b39-a1f2-fe0499adf94a', 'Kavitha Matrubai', 'kavikent@gmail.com', '90369557330')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kavikent@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('8a258d2e-2a54-4b2b-8d4f-bc9cdf553994', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('200b9944-13d0-4948-ab05-496ee99f0023', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KAVITHA MATRUBAI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PRATIK RASHMIKANT SHAH (pratik@milestonefinancial.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('215fdafe-de9d-41c0-9b7e-098301201340', 'PRATIK RASHMIKANT SHAH', 'pratik@milestonefinancial.in', '99799111100')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pratik@milestonefinancial.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1508c1e2-be2d-474c-b343-50f4aea13ce4', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('20164928-cba7-40b0-90dd-c4f1f907511d', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRATIK SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- jaykumar patel (jaykumar.investments@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('5efa61aa-acd7-4b33-9fc1-fef89106ddfa', 'jaykumar patel', 'jaykumar.investments@gmail.com', '89809929920')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'jaykumar.investments@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('166cedbf-d85c-4cb0-af64-db8f0e190e14', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('4e93a7f5-0779-46da-8bfb-de66325002b0', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/JAYKUMAR PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Prakash Jethwani (ppjethwani@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a52e0954-9a2b-4437-863b-cea9c420c8e1', 'Prakash Jethwani', 'ppjethwani@gmail.com', '9821913140')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ppjethwani@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9a505453-0965-4d28-9e31-a0bae9931a51', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('a815c17f-0419-418e-a609-e58c2c766ba7', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAKASH JETHWANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Laxmikant Mundada (poortata@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('908f434a-43c6-4d92-83fe-6227dcc0d605', 'Laxmikant Mundada', 'poortata@gmail.com', '09820452002')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'poortata@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('5471b9e3-a24a-4800-b257-4e4bc299ecd8', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6d870152-b714-4e20-86b2-1c4f1c8c1e1e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/LAXMIKANT MUNDADA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Praveen P Jain (praveen@kfsindia.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('2a41f381-80bc-4a05-be9e-d84ff05286fe', 'Praveen P Jain', 'praveen@kfsindia.com', '75750670000')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'praveen@kfsindia.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('68a7790d-deeb-41ef-b181-b9059e8b1576', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('41d218d6-14db-4a53-9a3c-1f82a963c96a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAVEEN JAIN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Varsha Praveen Jain (varsha@kfsindia.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7e995388-35a1-4731-ae21-352779c59214', 'Varsha Praveen Jain', 'varsha@kfsindia.com', '89800472490')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'varsha@kfsindia.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c7871f1a-f2a0-44cd-862e-04caae2bf8ba', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('0f64b237-855d-4571-a6b8-36127e6985ba', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAVEEN JAIN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- MIHIR MALI (mihirmali368@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('92e03560-c099-4f1e-ac70-aceae1768c3b', 'MIHIR MALI', 'mihirmali368@gmail.com', '98985558800')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mihirmali368@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('aaaeaffe-e03c-44e5-86ee-073cb973cb93', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('66d5e72e-8ba9-479c-a5eb-470749182259', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MIHIR MALI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Ruchi Patel (ruchi@vishwasdeshpande.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('e5840daa-1b73-4811-8564-48af6de96195', 'Ruchi Patel', 'ruchi@vishwasdeshpande.com', '93213383190')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ruchi@vishwasdeshpande.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1a64cae3-8077-43ba-948e-031c6ba32899', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c4252a48-21ba-4124-b3dd-c811f3d44134', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RUCHI PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Aruna patil (patilaruna2018@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0b571319-4be8-4aaf-bc0b-3441893a3e89', 'Aruna patil', 'patilaruna2018@gmail.com', '72182502520')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'patilaruna2018@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('42fe08a1-e650-4c94-9303-d4a43e6cc98c', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e27a79f0-6617-4909-bb51-9918703d56c1', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ARUNA PATIL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kaushik Patel (kaushik@aktawealth.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d35b5442-6401-4a73-b0ab-9acff4fc1234', 'Kaushik Patel', 'kaushik@aktawealth.com', '98245035720')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kaushik@aktawealth.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('177792bd-d6eb-48c8-851a-a99f730180d8', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c320001a-8bd1-41c5-9e15-b449ccc7a966', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KAUSHIK PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Gautam Desai (gautam@aktawealth.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('51ba74f1-367b-4ed9-8342-fb0cb63daf38', 'Gautam Desai', 'gautam@aktawealth.com', '98257963710')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'gautam@aktawealth.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7eac27b8-956f-4294-965a-4cb90b712b82', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6bb7be7b-8483-42ec-9ce1-59d34e90f1fc', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/GAUTAM DESAI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- ROHIT R CHANDAK (sriwealthindia@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('455dadb4-bf74-4a64-b41f-2fceee8d1227', 'ROHIT R CHANDAK', 'sriwealthindia@gmail.com', '98220122550')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sriwealthindia@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('fe03d924-2e86-48da-8c71-1cc4354b5cfc', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('78c64165-984b-487c-a9a2-acd3b0d940bb', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ROHIT CHANDAK.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- SUKUMAR BARMAN (mutualfundsbi141@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a2685c6b-40f5-4694-a7e3-914ee0b98ddc', 'SUKUMAR BARMAN', 'mutualfundsbi141@gmail.com', '96794716250')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mutualfundsbi141@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('1c44fc88-c561-437d-9353-4847307ff155', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('fcaacf2a-3a5b-4b2b-abe6-85cd4d2696a4', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SUKUMAR BARMAN.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Toral Somaiya (toralsomaiya2014@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d5f3eaf0-3b49-4e27-97b6-ff43e06f6501', 'Toral Somaiya', 'toralsomaiya2014@gmail.com', '99989740430')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'toralsomaiya2014@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('e24cbb7b-6d59-4596-a4c4-f296af6ad216', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('f58a1b65-28b8-468f-8ba5-611552b74191', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/TORAL SOMAIYA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mohit Arora (writetoxpert@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('146fb2fc-84f3-4fbf-9745-3ca4ab05765c', 'Mohit Arora', 'writetoxpert@gmail.com', '98156864330')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'writetoxpert@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a3518214-80dc-4933-a262-f21810e1d721', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ceb98c5d-2a6d-4586-b09c-138291cd4ccc', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MOHIT ARORA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kalpesh Babulal Shah (veerwealth@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3a088116-d64e-4661-8c9b-a62c0d7ba811', 'Kalpesh Babulal Shah', 'veerwealth@gmail.com', '93772912110')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'veerwealth@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d7d80fd8-0282-4b5a-b26d-2da4834ba725', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('26b46a55-2e0a-4688-b32a-66bea1d9b51c', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KALPESH SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PRATIK SHAH (pratik.vikasinvestments@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('d5808b79-eef3-4ba5-99df-109034de0814', 'PRATIK SHAH', 'pratik.vikasinvestments@gmail.com', '99789141320')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pratik.vikasinvestments@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0a2d466a-8e12-4c3a-bdcb-fcb025816fc2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('86bb1c99-05ae-4afe-a483-0b5f34915ded', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRATIK SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- KETAN NANIVADEKAR (ketan@moneq.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('3e5cbde9-a8e1-4da1-b329-69d2dca73738', 'KETAN NANIVADEKAR', 'ketan@moneq.in', '93722777070')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ketan@moneq.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('3e1b3bb5-4cb3-4d36-96c2-0dd2b5679a8b', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ec3e9ce6-d739-487e-8bf8-44e7208e2e45', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KETAN NANIVADEKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Bikash Harlalka (harlalkabikash@yahoo.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('1a6b2d05-1a72-473f-bbbd-37bd0458ce44', 'Bikash Harlalka', 'harlalkabikash@yahoo.in', '98641543200')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'harlalkabikash@yahoo.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('9f0f124f-9769-4a31-957e-6fc1f38ec0d4', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('2151906d-eed6-4b23-8e51-6345c13f564f', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/BIKASH HARLALKA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sourabh Shrivastava (sourabh.s@winfinacapital.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('5e18df82-5ae3-4f10-b2f2-34e24de8adab', 'Sourabh Shrivastava', 'sourabh.s@winfinacapital.com', '94253030640')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sourabh.s@winfinacapital.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('6b2519a1-872c-4bc0-9463-4f64b13c4d5e', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e4cc5daa-926f-4ce3-82b9-c3b93d878f47', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SOURABH SHRIVASTAVA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rucchika Verma (ruchika@realvaluefin.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('4e73e751-8c06-45f6-9209-7a4c01fb458b', 'Rucchika Verma', 'ruchika@realvaluefin.com', '98103987500')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'ruchika@realvaluefin.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0ca1fd0e-2c68-49c2-a3a6-0233d3f6f579', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c58f5d93-1a4c-4b2e-8ac9-0731c3c3d725', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RUCCHIKA VERMA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Ramganesh D Dhamankar (wealthkreators@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('53ae0756-9f10-41d9-b11d-fbab9c7d823a', 'Ramganesh D Dhamankar', 'wealthkreators@gmail.com', '97024247240')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'wealthkreators@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('a3421321-6110-47cb-b062-921828a2f4f0', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8f1912a2-c46b-4462-aa1b-d8586d425bf6', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAMGANESH DHAMANKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- ARTI PATEL (vikasinvestments01@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('85990827-76ca-47f5-980b-546958e8793f', 'ARTI PATEL', 'vikasinvestments01@gmail.com', '99789141320')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'vikasinvestments01@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('38556520-5b87-4bd9-b870-1d459a7bae09', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('b4c97ff4-2975-4f70-b8cb-be069500d22b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ARTI PATEL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Kiran Deodhar (kirandeodhar@hotmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('f4f17b64-f5fc-493e-83e6-2d4d6d9a3112', 'Kiran Deodhar', 'kirandeodhar@hotmail.com', '98203350930')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kirandeodhar@hotmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('01227da8-4ede-484d-9b85-76cbb6f66f17', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('9eddc0a7-8dba-46db-b470-30c8e19d474b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/KIRAN DEODHAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- CHIRAG ARVINDBHAI SHAH (chirag.shah@ckredencewealth.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b2437e84-cffa-4b3a-ae9b-37854d1ff293', 'CHIRAG ARVINDBHAI SHAH', 'chirag.shah@ckredencewealth.com', '92279079790')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'chirag.shah@ckredencewealth.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7f08d5f7-f92b-4a97-beb3-247432d089d7', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8dc7e1e0-c9a4-4bbc-92b9-ce5b636135f9', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/CHIRAG SHAH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mohan sippy (mohansippy@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('145f5fc9-c9c7-4c2d-b0e7-b563a17404bb', 'Mohan sippy', 'mohansippy@gmail.com', '98703414440')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mohansippy@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('114da6ce-ed9d-42a1-b8a9-9bdea13520b6', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('0ecc5c44-b841-4997-bf5f-7e8f7fb45518', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MOHAN SIPPY.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mansi Gupta (mansigupta942@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('8512e9e4-c28d-4f83-b80a-55cc38dc4d0a', 'Mansi Gupta', 'mansigupta942@gmail.com', '99994394170')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mansigupta942@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('4c54dd37-4f5c-4cbc-9aeb-8ccd997f3399', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d45c4cf0-7ce4-44c2-a720-01b68ba933d5', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MANSI GUPTA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Nayna Nalini Nagesh (nayna63@yahoo.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('eb4063a1-2f6d-4582-bbc5-d21df9e10ebf', 'Nayna Nalini Nagesh', 'nayna63@yahoo.co.in', '98692422680')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nayna63@yahoo.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('8e8376a1-8279-43b3-bbf6-e361270a281d', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('e19a4b05-b731-43c4-a7c4-cc132df0791e', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NAYNA NAGESH.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Sanjeev Prakash Chhapwale (sanjeev1807@yahoo.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('416d27fa-8221-44d6-b12f-272d830f59a8', 'Sanjeev Prakash Chhapwale', 'sanjeev1807@yahoo.co.in', '98207627630')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'sanjeev1807@yahoo.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('86a682b3-fb00-42d1-8f45-0423da2860f3', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('0ec97050-8f1f-4e4f-81db-6a0ceb7c316a', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/SANJEEV CHHAPWALE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Mangesh Wazurkar (mangesh19899@yahoo.co.in)
    INSERT INTO users (id, name, email, phone)
    VALUES ('1e07d4bc-083c-4713-9aa2-b8b7c9287cd9', 'Mangesh Wazurkar', 'mangesh19899@yahoo.co.in', '92718771880')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'mangesh19899@yahoo.co.in';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('565f3ad9-057e-4e97-a74a-69029d5031c1', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('cda1ef32-d219-4856-b5cd-28f162f98870', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/MANGESH WAZURKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- PRASAD VELANKAR (pvelankar71@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('4c7a5a39-0b69-4f91-bf62-6872c7ca8f49', 'PRASAD VELANKAR', 'pvelankar71@gmail.com', '97197773940')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pvelankar71@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('d2e04877-ad38-41a5-9233-a2d59ceb3e62', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8756b349-2f74-4f74-9c5a-a102b6529f65', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRASAD VELANKAR.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Pramod Kumar  Saraswat (pramodsaraswat@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('27e6f0c7-58df-4075-8e3c-85458ab09c39', 'Pramod Kumar  Saraswat', 'pramodsaraswat@yahoo.com', '98990424190')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'pramodsaraswat@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('990da52c-9744-4710-bedc-5d965a186aa2', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('c3977522-6c14-469e-aed2-d81b15437f8b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/PRAMOD SARASWAT.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Alpesh Kanani (kanethic@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('7ddfa67b-c1ad-4f71-b0d4-752f637f5ec9', 'Alpesh Kanani', 'kanethic@yahoo.com', '99981700930')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'kanethic@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('ff65646b-16fd-4fcc-ae63-e985cad54050', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('30e1b4a6-1cff-4bc4-81c1-4e35ee4c595b', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ALPESH KANANI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Harsh Gupta (hg9722@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a2b9a444-4a08-4b4b-b995-a69dbda6809d', 'Harsh Gupta', 'hg9722@gmail.com', '88606807980')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'hg9722@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('dd4989dd-c033-4da9-a3a9-166f63211e36', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('8f5a3da6-1341-4bb5-b5b9-3ce2c87dc348', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/HARSH GUPTA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rajiv Verma (rajiv@realvaluefin.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('5a7c4870-5288-4a24-96ac-e2c406a45c17', 'Rajiv Verma', 'rajiv@realvaluefin.com', '99108944220')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rajiv@realvaluefin.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('77ff2d7a-4499-4d0e-b4a3-9880554a7697', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('d3c9a1c6-9384-40e2-b698-90c01506d9fb', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/RAJIV VERMA.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- AMIT PATIL (amitpa99@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('0c3767e2-bb7a-475c-9828-5d66d8048864', 'AMIT PATIL', 'amitpa99@gmail.com', '98906434450')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'amitpa99@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('119ca9bd-4b55-410b-83d4-98a74d51c1b4', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('ee5df765-4a48-4204-a122-5a08e828e581', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AMIT PATIL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- NIRMAL DOSHI (nirmaldoshi18@yahoo.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('781e4bcf-3a8b-451c-87c8-50cdb0272e6a', 'NIRMAL DOSHI', 'nirmaldoshi18@yahoo.com', '99251094350')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'nirmaldoshi18@yahoo.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('c9597085-92ad-4cf5-8e97-f61f2cae8d1d', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('36939d83-1a2d-4901-9092-fbd3d4496194', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/NIRMAL DOSHI.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- AMAR BHIMRAO SALUNKHE (amarsalunkhe123.isha@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('a9363e7e-4a54-4ec8-8c6d-5863b74b1136', 'AMAR BHIMRAO SALUNKHE', 'amarsalunkhe123.isha@gmail.com', '94238688850')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'amarsalunkhe123.isha@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('0d231753-c30a-4176-9b95-387c70a80561', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('6297c8a7-67f1-471b-b509-a282b97f1627', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/AMAR SALUNKHE.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    -- Rohit mudgal (rohit.mudgal.67@gmail.com)
    INSERT INTO users (id, name, email, phone)
    VALUES ('b2fca285-4a8d-4072-9017-8d99b8ad47e9', 'Rohit mudgal', 'rohit.mudgal.67@gmail.com', '95685857020')
    ON CONFLICT ON CONSTRAINT uq_users_email DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone;
    SELECT id INTO v_user_id FROM users WHERE email = 'rohit.mudgal.67@gmail.com';

    INSERT INTO registrations (id, user_id, event_id)
    VALUES ('7c79e317-d3e6-4cd5-bacf-4a319bfb8efb', v_user_id, v_event_id)
    ON CONFLICT ON CONSTRAINT uq_registration_user_event DO NOTHING;

    INSERT INTO certificates (id, user_id, event_id, pdf_url, status)
    VALUES ('3f2f11e0-374e-4482-8f37-5fa60f350327', v_user_id, v_event_id,
        '/api/v1/certificates/image/' || v_event_id::text || '/ROHIT MUDGAL.jpg', 'ready')
    ON CONFLICT ON CONSTRAINT uq_certificate_user_event DO UPDATE SET
        pdf_url = EXCLUDED.pdf_url, status = 'ready';

    RAISE NOTICE 'Done. Users: %, Registrations: %, Certificates: %',
        (SELECT count(*) FROM users),
        (SELECT count(*) FROM registrations),
        (SELECT count(*) FROM certificates);
END $$;