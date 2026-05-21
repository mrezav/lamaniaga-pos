SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict QgR8sbHGWXTCLiBPOJgeR3y2paac3ebDRAZpzQAUisI8baKiQ6w41Fy2lGNvNbJ

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '59775f95-0ea3-4653-b2b8-260e0474d650', '{"action":"user_confirmation_requested","actor_id":"9d2cffa6-4c03-46bb-b87d-6ba20d51b93f","actor_name":"Natasya","actor_username":"natasya@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-05-21 06:55:21.355481+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a9d75b26-e991-4865-992b-3bad1e2f95d1', '{"action":"user_signedup","actor_id":"9d2cffa6-4c03-46bb-b87d-6ba20d51b93f","actor_name":"Natasya","actor_username":"natasya@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2026-05-21 06:55:30.355635+00', ''),
	('00000000-0000-0000-0000-000000000000', '788941e0-2e83-4581-86fa-f48ffc9521d7', '{"action":"login","actor_id":"9d2cffa6-4c03-46bb-b87d-6ba20d51b93f","actor_name":"Natasya","actor_username":"natasya@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2026-05-21 06:55:52.949473+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b8b5a338-44e2-486f-924c-428dfc3ad7ba', '{"action":"logout","actor_id":"9d2cffa6-4c03-46bb-b87d-6ba20d51b93f","actor_name":"Natasya","actor_username":"natasya@gmail.com","actor_via_sso":false,"log_type":"account"}', '2026-05-21 07:16:27.02939+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2cb0ff1-fa4c-429e-b081-77a2141be6d2', '{"action":"user_confirmation_requested","actor_id":"3cd2ee31-f1db-4a30-a338-af2a44b3243d","actor_name":"mike","actor_username":"mike@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}', '2026-05-21 07:16:36.49814+00', '');


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('fd0e70f1-f1a7-48c4-a836-bbe920e1d06a', '58a1b860-0d1c-410a-b7f5-133b595588c7', '6943cf18-210c-4af3-81e7-f98ad7de4a98', 's256', 'mAXgCC9Ym6FAiKy19nxPeRKLUvuueHqWRpaS2smah2I', 'email', '', '', '2026-05-16 12:44:53.859286+00', '2026-05-16 13:11:42.015032+00', 'email/signup', '2026-05-16 13:11:42.014976+00', NULL, NULL, NULL, NULL, false),
	('405ef1ee-e196-49df-911f-2d4b95d01eea', '9d2cffa6-4c03-46bb-b87d-6ba20d51b93f', '255b3356-25fb-4183-af8b-826502bca3d9', 's256', 'tDLrb1y4nJSVmN2gmBWXgiF7Q4fCbe2kGxyw-Z5Nq_k', 'email', '', '', '2026-05-21 06:55:21.356988+00', '2026-05-21 06:55:30.368078+00', 'email/signup', '2026-05-21 06:55:30.368025+00', NULL, NULL, NULL, NULL, false),
	('b65dd75b-dd6e-47e2-8bbc-1fffaedde041', '3cd2ee31-f1db-4a30-a338-af2a44b3243d', '27e3d303-90d8-4ae0-862c-3de3fdffc74d', 's256', 'E0syplkvcQYzcRw7vo4XBDL-v3sIxs7gQfPRvO0Uepg', 'email', '', '', '2026-05-21 07:16:36.499497+00', '2026-05-21 07:16:36.499497+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '43dc8d44-00ae-445b-b8ac-bdce080ad3db', 'authenticated', 'authenticated', 'lamaniaga.web@gmail.com', '$2a$10$1GMXnYWeB7ibAyweny/nEeKfZw/E9oRpZ0vKvOoJWSZOcnegXbqUC', '2026-05-19 07:28:47.722233+00', NULL, '', '2026-05-19 07:28:09.678825+00', '', NULL, '', '', NULL, '2026-05-20 01:55:36.958854+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "43dc8d44-00ae-445b-b8ac-bdce080ad3db", "email": "lamaniaga.web@gmail.com", "full_name": "Lamaniaga", "email_verified": true, "phone_verified": false}', NULL, '2026-05-19 07:28:09.634447+00', '2026-05-20 01:55:36.973572+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '23552259-f516-4f73-a154-a15e526aaf09', 'authenticated', 'authenticated', 'mrezavahlevi66@gmail.com', '$2a$10$FUQKYrTqqGhy0kW/yR3RvuwsvR4BYh1O.BvhqgaKS/fI7TQ7aSRWO', '2026-05-19 08:08:49.744123+00', NULL, '', '2026-05-19 08:07:43.098371+00', '', NULL, '', '', NULL, '2026-05-20 01:56:11.901451+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "23552259-f516-4f73-a154-a15e526aaf09", "email": "mrezavahlevi66@gmail.com", "full_name": "Reza", "email_verified": true, "phone_verified": false}', NULL, '2026-05-19 08:07:43.04091+00', '2026-05-21 03:32:11.082566+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9d2cffa6-4c03-46bb-b87d-6ba20d51b93f', 'authenticated', 'authenticated', 'natasya@gmail.com', '$2a$10$73ZBHtJ./b.zBeD6/N0NAeXNH6G/yoL3VO2agmPjbBtjOz6zVcGzi', '2026-05-21 06:55:30.356917+00', NULL, '', '2026-05-21 06:55:21.35828+00', '', NULL, '', '', NULL, '2026-05-21 06:55:52.951483+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "9d2cffa6-4c03-46bb-b87d-6ba20d51b93f", "email": "natasya@gmail.com", "full_name": "Natasya", "email_verified": true, "phone_verified": false}', NULL, '2026-05-21 06:55:21.342321+00', '2026-05-21 06:55:52.956042+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3cd2ee31-f1db-4a30-a338-af2a44b3243d', 'authenticated', 'authenticated', 'mike@gmail.com', '$2a$10$CT.ZCawipP9l8Q/v3yFnze8UJwpumFDNmrYSoMbu4dk69NPiukrX.', NULL, NULL, 'pkce_3c8a6ebc08b28b0b6c81b4e77772901c4f1b83d41ce61ae3beef0be3', '2026-05-21 07:16:36.50082+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "3cd2ee31-f1db-4a30-a338-af2a44b3243d", "email": "mike@gmail.com", "full_name": "mike", "email_verified": false, "phone_verified": false}', NULL, '2026-05-21 07:16:36.484259+00', '2026-05-21 07:16:36.523343+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('43dc8d44-00ae-445b-b8ac-bdce080ad3db', '43dc8d44-00ae-445b-b8ac-bdce080ad3db', '{"sub": "43dc8d44-00ae-445b-b8ac-bdce080ad3db", "email": "lamaniaga.web@gmail.com", "full_name": "Lamaniaga", "email_verified": true, "phone_verified": false}', 'email', '2026-05-19 07:28:09.661208+00', '2026-05-19 07:28:09.661272+00', '2026-05-19 07:28:09.661272+00', '2c3b7a1a-ba20-4f1a-8a55-881bea0709ef'),
	('23552259-f516-4f73-a154-a15e526aaf09', '23552259-f516-4f73-a154-a15e526aaf09', '{"sub": "23552259-f516-4f73-a154-a15e526aaf09", "email": "mrezavahlevi66@gmail.com", "full_name": "Reza", "email_verified": true, "phone_verified": false}', 'email', '2026-05-19 08:07:43.078198+00', '2026-05-19 08:07:43.078246+00', '2026-05-19 08:07:43.078246+00', '640c1766-7fa7-4f16-bc5c-0f88aa0bc814'),
	('9d2cffa6-4c03-46bb-b87d-6ba20d51b93f', '9d2cffa6-4c03-46bb-b87d-6ba20d51b93f', '{"sub": "9d2cffa6-4c03-46bb-b87d-6ba20d51b93f", "email": "natasya@gmail.com", "full_name": "Natasya", "email_verified": true, "phone_verified": false}', 'email', '2026-05-21 06:55:21.351255+00', '2026-05-21 06:55:21.351299+00', '2026-05-21 06:55:21.351299+00', '6e9974b3-7e14-4219-aaa7-6bdbfd857dd9'),
	('3cd2ee31-f1db-4a30-a338-af2a44b3243d', '3cd2ee31-f1db-4a30-a338-af2a44b3243d', '{"sub": "3cd2ee31-f1db-4a30-a338-af2a44b3243d", "email": "mike@gmail.com", "full_name": "mike", "email_verified": false, "phone_verified": false}', 'email', '2026-05-21 07:16:36.493213+00', '2026-05-21 07:16:36.493262+00', '2026-05-21 07:16:36.493262+00', '105da8b8-cff0-41c8-9cfc-cd9064896150');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('1ffe16e9-b985-4d4c-8dfd-83695dca5b4b', '23552259-f516-4f73-a154-a15e526aaf09', '2026-05-20 01:56:11.901545+00', '2026-05-21 03:32:11.091948+00', NULL, 'aal1', NULL, '2026-05-21 03:32:11.091834', 'node', '182.10.97.2', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('1ffe16e9-b985-4d4c-8dfd-83695dca5b4b', '2026-05-20 01:56:11.904035+00', '2026-05-20 01:56:11.904035+00', 'password', '23ea9930-7120-4d19-ac99-4f92eecdcf6e');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('c2e2d7f9-3d4c-4bf7-a3e7-ed181a43e618', '3cd2ee31-f1db-4a30-a338-af2a44b3243d', 'confirmation_token', 'pkce_3c8a6ebc08b28b0b6c81b4e77772901c4f1b83d41ce61ae3beef0be3', 'mike@gmail.com', '2026-05-21 07:16:36.526107', '2026-05-21 07:16:36.526107');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 36, 'uyznqrj2oztb', '23552259-f516-4f73-a154-a15e526aaf09', true, '2026-05-20 01:56:11.902598+00', '2026-05-20 02:55:08.900816+00', NULL, '1ffe16e9-b985-4d4c-8dfd-83695dca5b4b'),
	('00000000-0000-0000-0000-000000000000', 37, 'cjhc5hne3pw4', '23552259-f516-4f73-a154-a15e526aaf09', true, '2026-05-20 02:55:08.926745+00', '2026-05-21 03:32:11.067174+00', 'uyznqrj2oztb', '1ffe16e9-b985-4d4c-8dfd-83695dca5b4b'),
	('00000000-0000-0000-0000-000000000000', 38, 'thxt3xlyrxdr', '23552259-f516-4f73-a154-a15e526aaf09', false, '2026-05-21 03:32:11.077751+00', '2026-05-21 03:32:11.077751+00', 'cjhc5hne3pw4', '1ffe16e9-b985-4d4c-8dfd-83695dca5b4b');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--



--
-- Data for Name: stores; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."stores" ("id", "name", "owner_id", "slug", "address", "phone_number", "logo_url", "banner_url", "join_code", "is_active", "created_at") VALUES
	('bf09e08b-1c50-48b9-a1b7-10f44ed51e44', 'Sejahtera abadi', '43dc8d44-00ae-445b-b8ac-bdce080ad3db', 'sejahtera-abadi', 'Sukabumi', '0892928334', NULL, NULL, 'WQN7N4P6Z', true, '2026-05-19 07:58:48.75615+00');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "avatar_url", "phone_number", "last_active_store_id", "updated_at", "created_at") VALUES
	('43dc8d44-00ae-445b-b8ac-bdce080ad3db', 'Lamaniaga', NULL, NULL, 'bf09e08b-1c50-48b9-a1b7-10f44ed51e44', '2026-05-19 07:58:48.75615+00', '2026-05-19 07:56:19.220301+00'),
	('23552259-f516-4f73-a154-a15e526aaf09', 'Reza', NULL, NULL, 'bf09e08b-1c50-48b9-a1b7-10f44ed51e44', '2026-05-19 10:17:59.68347+00', '2026-05-19 08:08:50.829637+00'),
	('9d2cffa6-4c03-46bb-b87d-6ba20d51b93f', 'Natasya', NULL, NULL, NULL, '2026-05-21 06:55:53.318846+00', '2026-05-21 06:55:53.318846+00');


--
-- Data for Name: store_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."store_members" ("id", "user_id", "store_id", "role", "status", "updated_at", "created_at") VALUES
	('6429917c-5bf9-4934-bb83-ab032833d6a0', '43dc8d44-00ae-445b-b8ac-bdce080ad3db', 'bf09e08b-1c50-48b9-a1b7-10f44ed51e44', 'owner', 'active', '2026-05-19 07:58:48.75615+00', '2026-05-19 07:58:48.75615+00'),
	('4e23d313-3813-486f-adac-9eae1f7967b3', '23552259-f516-4f73-a154-a15e526aaf09', 'bf09e08b-1c50-48b9-a1b7-10f44ed51e44', 'cashier', 'active', '2026-05-19 10:17:52.351+00', '2026-05-19 10:17:14.446682+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('stores', 'stores', NULL, '2026-05-18 03:06:12.475602+00', '2026-05-18 03:06:12.475602+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('public-assets', 'public-assets', NULL, '2026-05-21 07:05:37.619835+00', '2026-05-21 07:05:37.619835+00', true, false, 10485760, NULL, NULL, 'STANDARD'),
	('private-assets', 'private-assets', NULL, '2026-05-21 07:06:27.071351+00', '2026-05-21 07:06:27.071351+00', false, false, 10485760, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 39, true);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('"drizzle"."__drizzle_migrations_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

-- \unrestrict QgR8sbHGWXTCLiBPOJgeR3y2paac3ebDRAZpzQAUisI8baKiQ6w41Fy2lGNvNbJ

RESET ALL;
