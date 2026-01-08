--
-- PostgreSQL database dump
--

\restrict 9z4ufaPSelGsyz0alcekrbIs5kVaeneKcpflbfPcbCXjJgE1FZDLULsxNVPr1XE

-- Dumped from database version 15.4 (Debian 15.4-2.pgdg120+1)
-- Dumped by pg_dump version 18.0

-- Started on 2026-01-08 18:57:00

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
-- TOC entry 3 (class 3079 OID 16488)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3671 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 2 (class 3079 OID 16385)
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- TOC entry 3672 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


--
-- TOC entry 898 (class 1247 OID 16500)
-- Name: alert_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.alert_status AS ENUM (
    'OPEN',
    'ACKNOWLEDGED',
    'RESOLVED',
    'DISMISSED'
);


ALTER TYPE public.alert_status OWNER TO safecity;

--
-- TOC entry 901 (class 1247 OID 16510)
-- Name: alert_type; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.alert_type AS ENUM (
    'CCTV_MATCH',
    'CASE_UPDATE',
    'SYSTEM'
);


ALTER TYPE public.alert_type OWNER TO safecity;

--
-- TOC entry 904 (class 1247 OID 16518)
-- Name: camera_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.camera_status AS ENUM (
    'ACTIVE',
    'DISABLED',
    'MAINTENANCE'
);


ALTER TYPE public.camera_status OWNER TO safecity;

--
-- TOC entry 907 (class 1247 OID 16526)
-- Name: camera_type; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.camera_type AS ENUM (
    'FIXED',
    'PTZ',
    'MOBILE',
    'DRONE'
);


ALTER TYPE public.camera_type OWNER TO safecity;

--
-- TOC entry 910 (class 1247 OID 16536)
-- Name: case_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.case_status AS ENUM (
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'WITHDRAWN',
    'CLOSED'
);


ALTER TYPE public.case_status OWNER TO safecity;

--
-- TOC entry 913 (class 1247 OID 16550)
-- Name: case_type; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.case_type AS ENUM (
    'MISSING',
    'WANTED'
);


ALTER TYPE public.case_type OWNER TO safecity;

--
-- TOC entry 916 (class 1247 OID 16556)
-- Name: detection_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.detection_status AS ENUM (
    'UNKNOWN',
    'POSSIBLE',
    'CONFIRMED',
    'FALSE_POSITIVE',
    'REVIEWED'
);


ALTER TYPE public.detection_status OWNER TO safecity;

--
-- TOC entry 919 (class 1247 OID 16568)
-- Name: embedding_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.embedding_status AS ENUM (
    'ACTIVE',
    'REVOKED',
    'DEPRECATED'
);


ALTER TYPE public.embedding_status OWNER TO safecity;

--
-- TOC entry 967 (class 1247 OID 16880)
-- Name: image_type; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.image_type AS ENUM (
    'PHOTO',
    'SKETCH'
);


ALTER TYPE public.image_type OWNER TO safecity;

--
-- TOC entry 922 (class 1247 OID 16576)
-- Name: person_category; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.person_category AS ENUM (
    'MISSING',
    'WANTED'
);


ALTER TYPE public.person_category OWNER TO safecity;

--
-- TOC entry 925 (class 1247 OID 16582)
-- Name: person_gender; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.person_gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER',
    'UNKNOWN'
);


ALTER TYPE public.person_gender OWNER TO safecity;

--
-- TOC entry 928 (class 1247 OID 16592)
-- Name: person_type; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.person_type AS ENUM (
    'MISSING',
    'WANTED'
);


ALTER TYPE public.person_type OWNER TO safecity;

--
-- TOC entry 931 (class 1247 OID 16598)
-- Name: photo_source; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.photo_source AS ENUM (
    'USER_UPLOAD',
    'ADMIN_UPLOAD',
    'CCTV_FRAME',
    'SYSTEM_GENERATED'
);


ALTER TYPE public.photo_source OWNER TO safecity;

--
-- TOC entry 934 (class 1247 OID 16608)
-- Name: photo_status; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.photo_status AS ENUM (
    'UPLOADED',
    'APPROVED',
    'REJECTED',
    'ARCHIVED'
);


ALTER TYPE public.photo_status OWNER TO safecity;

--
-- TOC entry 937 (class 1247 OID 16618)
-- Name: user_role; Type: TYPE; Schema: public; Owner: safecity
--

CREATE TYPE public.user_role AS ENUM (
    'USER',
    'ADMIN',
    'SUPER_ADMIN'
);


ALTER TYPE public.user_role OWNER TO safecity;

--
-- TOC entry 271 (class 1255 OID 16625)
-- Name: enforce_admin_assignment(); Type: FUNCTION; Schema: public; Owner: safecity
--

CREATE FUNCTION public.enforce_admin_assignment() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    admin_role user_role;
BEGIN
    IF NEW.assigned_admin IS NOT NULL THEN
        SELECT role INTO admin_role FROM users WHERE id = NEW.assigned_admin;

        IF admin_role NOT IN ('ADMIN', 'SUPER_ADMIN') THEN
            RAISE EXCEPTION 'Assigned user is not an admin';
        END IF;

        NEW.assigned_at = now();
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.enforce_admin_assignment() OWNER TO safecity;

--
-- TOC entry 272 (class 1255 OID 16626)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: safecity
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO safecity;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 216 (class 1259 OID 16627)
-- Name: alerts; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.alerts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    alert_type public.alert_type NOT NULL,
    status public.alert_status DEFAULT 'OPEN'::public.alert_status NOT NULL,
    case_id uuid,
    person_id uuid,
    cctv_log_id uuid,
    camera_id uuid,
    confidence real,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    acknowledged_by uuid,
    acknowledged_at timestamp with time zone,
    resolved_by uuid,
    resolved_at timestamp with time zone,
    CONSTRAINT alerts_confidence_check CHECK (((confidence >= (0)::double precision) AND (confidence <= (1)::double precision)))
);


ALTER TABLE public.alerts OWNER TO safecity;

--
-- TOC entry 217 (class 1259 OID 16636)
-- Name: case_person; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.case_person (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    case_id uuid NOT NULL,
    category public.person_category NOT NULL,
    full_name text,
    alias text,
    gender public.person_gender DEFAULT 'UNKNOWN'::public.person_gender,
    age integer,
    height_cm integer,
    weight_kg integer,
    skin_tone text,
    eye_color text,
    hair_color text,
    last_known_clothing text,
    distinguishing_marks text,
    description text,
    is_primary boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT case_person_age_check CHECK ((age >= 0)),
    CONSTRAINT case_person_height_cm_check CHECK ((height_cm > 0)),
    CONSTRAINT case_person_weight_kg_check CHECK ((weight_kg > 0))
);


ALTER TABLE public.case_person OWNER TO safecity;

--
-- TOC entry 218 (class 1259 OID 16649)
-- Name: case_person_photos; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.case_person_photos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    case_person_id uuid NOT NULL,
    uploaded_by uuid,
    source public.photo_source NOT NULL,
    file_path text NOT NULL,
    file_hash text,
    status public.photo_status DEFAULT 'UPLOADED'::public.photo_status NOT NULL,
    is_primary boolean DEFAULT false,
    face_detected boolean DEFAULT false,
    face_quality_score real,
    embedding_generated boolean DEFAULT false,
    approved_by uuid,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    image_type public.image_type DEFAULT 'PHOTO'::public.image_type NOT NULL,
    CONSTRAINT case_person_photos_face_quality_score_check CHECK (((face_quality_score >= (0)::double precision) AND (face_quality_score <= (1)::double precision))),
    CONSTRAINT sketch_not_cctv CHECK ((NOT ((image_type = 'SKETCH'::public.image_type) AND (source = 'CCTV_FRAME'::public.photo_source)))),
    CONSTRAINT sketch_not_primary CHECK ((NOT ((image_type = 'SKETCH'::public.image_type) AND (is_primary = true))))
);


ALTER TABLE public.case_person_photos OWNER TO safecity;

--
-- TOC entry 219 (class 1259 OID 16662)
-- Name: cases; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.cases (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    case_number text NOT NULL,
    case_type public.case_type NOT NULL,
    status public.case_status DEFAULT 'SUBMITTED'::public.case_status NOT NULL,
    title text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    assigned_admin uuid,
    assigned_at timestamp with time zone,
    last_seen_location text,
    last_seen_time timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    rejection_reason text
);


ALTER TABLE public.cases OWNER TO safecity;

--
-- TOC entry 220 (class 1259 OID 16672)
-- Name: cctv_cameras; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.cctv_cameras (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    camera_code text NOT NULL,
    camera_name text,
    camera_type public.camera_type DEFAULT 'FIXED'::public.camera_type NOT NULL,
    status public.camera_status DEFAULT 'ACTIVE'::public.camera_status NOT NULL,
    location_description text,
    latitude double precision,
    longitude double precision,
    ip_address text,
    stream_url text,
    installed_by uuid,
    installed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cctv_cameras OWNER TO safecity;

--
-- TOC entry 221 (class 1259 OID 16682)
-- Name: cctv_logs; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.cctv_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    camera_id uuid NOT NULL,
    detected_person_id uuid,
    detection_status public.detection_status NOT NULL,
    confidence real,
    bbox_x1 integer NOT NULL,
    bbox_y1 integer NOT NULL,
    bbox_x2 integer NOT NULL,
    bbox_y2 integer NOT NULL,
    snapshot_path text,
    model_name text NOT NULL,
    model_version text NOT NULL,
    detected_at timestamp with time zone DEFAULT now() NOT NULL,
    reviewed_by uuid,
    reviewed_at timestamp with time zone,
    notes text,
    CONSTRAINT cctv_logs_confidence_check CHECK (((confidence >= (0)::double precision) AND (confidence <= (1)::double precision)))
);


ALTER TABLE public.cctv_logs OWNER TO safecity;

--
-- TOC entry 222 (class 1259 OID 16690)
-- Name: face_embeddings; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.face_embeddings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    case_person_id uuid NOT NULL,
    photo_id uuid NOT NULL,
    embedding public.vector(512) NOT NULL,
    model_name text NOT NULL,
    model_version text NOT NULL,
    embedding_status public.embedding_status DEFAULT 'ACTIVE'::public.embedding_status NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.face_embeddings OWNER TO safecity;

--
-- TOC entry 224 (class 1259 OID 16861)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO safecity;

--
-- TOC entry 225 (class 1259 OID 16888)
-- Name: sketch_searches; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.sketch_searches (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    sketch_photo_id uuid NOT NULL,
    candidate_person_id uuid NOT NULL,
    candidate_photo_id uuid NOT NULL,
    similarity_score real NOT NULL,
    decision public.detection_status NOT NULL,
    performed_by uuid NOT NULL,
    case_id uuid NOT NULL,
    model_name text NOT NULL,
    model_version text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT sketch_searches_similarity_score_check CHECK (((similarity_score >= (0)::double precision) AND (similarity_score <= (1)::double precision)))
);


ALTER TABLE public.sketch_searches OWNER TO safecity;

--
-- TOC entry 223 (class 1259 OID 16698)
-- Name: users; Type: TABLE; Schema: public; Owner: safecity
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    role public.user_role DEFAULT 'USER'::public.user_role NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO safecity;

--
-- TOC entry 3656 (class 0 OID 16627)
-- Dependencies: 216
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.alerts (id, alert_type, status, case_id, person_id, cctv_log_id, camera_id, confidence, message, created_at, acknowledged_by, acknowledged_at, resolved_by, resolved_at) FROM stdin;
\.


--
-- TOC entry 3657 (class 0 OID 16636)
-- Dependencies: 217
-- Data for Name: case_person; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.case_person (id, case_id, category, full_name, alias, gender, age, height_cm, weight_kg, skin_tone, eye_color, hair_color, last_known_clothing, distinguishing_marks, description, is_primary, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3658 (class 0 OID 16649)
-- Dependencies: 218
-- Data for Name: case_person_photos; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.case_person_photos (id, case_person_id, uploaded_by, source, file_path, file_hash, status, is_primary, face_detected, face_quality_score, embedding_generated, approved_by, approved_at, created_at, updated_at, image_type) FROM stdin;
\.


--
-- TOC entry 3659 (class 0 OID 16662)
-- Dependencies: 219
-- Data for Name: cases; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.cases (id, case_number, case_type, status, title, description, created_by, assigned_admin, assigned_at, last_seen_location, last_seen_time, is_active, created_at, updated_at, rejection_reason) FROM stdin;
0ba85d10-63f4-4124-a5f1-c388da04fb86	WANT-18358791	WANTED	SUBMITTED	WANtED person	Last seen near bus stand	67387601-321a-406e-8a54-a8ccd93b29ba	\N	\N	Panaji Bus Stand	2025-01-12 18:30:00+00	t	2026-01-03 12:20:18.376+00	2026-01-03 12:20:18.376+00	\N
55f4fa2e-2e09-433b-8f49-a3786750bedc	MISS-40134660	MISSING	UNDER_REVIEW	Missing person in Panaji	Last seen near bus stand	8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	67387601-321a-406e-8a54-a8ccd93b29ba	2026-01-08 12:23:25.623833+00	Panaji Bus Stand	2025-01-12 18:30:00+00	t	2026-01-02 11:57:20.14+00	2026-01-08 12:23:25.623833+00	not proper
b680dc81-6a34-4034-8d18-c7a6f488c8ab	WANT-96936986	WANTED	UNDER_REVIEW	WANtED person 2	Last seen near bus stand	67387601-321a-406e-8a54-a8ccd93b29ba	67387601-321a-406e-8a54-a8ccd93b29ba	2026-01-08 13:16:36.979978+00	mapusa Bus Stand	2025-01-12 18:30:00+00	t	2026-01-08 13:16:36.939+00	2026-01-08 13:16:36.939+00	\N
6371e109-571a-4291-90e1-4cc620e4eea1	MISS-30717605	MISSING	SUBMITTED	MIssing person 3	Last seen near bus stand	67387601-321a-406e-8a54-a8ccd93b29ba	\N	\N	mapusa Bus Stand	2025-01-12 18:30:00+00	t	2026-01-08 13:17:10.718+00	2026-01-08 13:17:10.718+00	\N
\.


--
-- TOC entry 3660 (class 0 OID 16672)
-- Dependencies: 220
-- Data for Name: cctv_cameras; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.cctv_cameras (id, camera_code, camera_name, camera_type, status, location_description, latitude, longitude, ip_address, stream_url, installed_by, installed_at, created_at, updated_at) FROM stdin;
4c4cdd5b-dfcf-4917-9c6a-ef93fdd36ca0	CAM_TEST_001	Main Road Junction	FIXED	ACTIVE	Near city bus stand	15.2993	74.124	\N	\N	\N	\N	2025-12-26 14:44:27.413569+00	2025-12-26 14:44:27.413569+00
\.


--
-- TOC entry 3661 (class 0 OID 16682)
-- Dependencies: 221
-- Data for Name: cctv_logs; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.cctv_logs (id, camera_id, detected_person_id, detection_status, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, snapshot_path, model_name, model_version, detected_at, reviewed_by, reviewed_at, notes) FROM stdin;
\.


--
-- TOC entry 3662 (class 0 OID 16690)
-- Dependencies: 222
-- Data for Name: face_embeddings; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.face_embeddings (id, case_person_id, photo_id, embedding, model_name, model_version, embedding_status, created_at) FROM stdin;
\.


--
-- TOC entry 3664 (class 0 OID 16861)
-- Dependencies: 224
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked, created_at) FROM stdin;
32a21821-5c03-475f-987d-140334081b41	8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	35c207ba5ae497503edb04f2f32e6f2db499b45cc2a6bc7edae0fcd854136ecb	2026-01-07 10:40:17.543+00	t	2025-12-31 10:40:17.558+00
d68737df-47cf-406c-bb22-06dc4624f517	8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	5e22a8c799ac3d8ce7b15dbb8d2b55b6910c57fc2ecdd7d2d4374f4d33210fe9	2026-01-09 10:42:41.321+00	f	2026-01-02 10:42:41.327+00
c095e3a3-236c-4bcd-9f59-913e1443ff91	8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	7271d8e63e4e9696908cff67d30413ce67258a868ec11ac381e4a570634e9669	2026-01-09 11:01:16.358+00	f	2026-01-02 11:01:16.363+00
48a66a9b-e818-462c-9643-2d0851c80b95	67387601-321a-406e-8a54-a8ccd93b29ba	98dae10be2e37e475e946b10899c6aa5fae7d180730a9609e78efd626b48fa37	2026-01-10 11:45:36.99+00	f	2026-01-03 11:45:36.994+00
db53eab1-092b-43ba-9b52-5dbf8b34069b	8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	639e784cd5532c69faa6888aec2359586b83302e9f63a45e9b292f695452e4a3	2026-01-10 12:21:20.26+00	f	2026-01-03 12:21:20.262+00
0dc2e0b1-b08c-487e-acef-c37495385ded	67387601-321a-406e-8a54-a8ccd93b29ba	719ec01c28e4cc16fd75634070b139d39ffbdce716e8ec1ee15df8b3752beb91	2026-01-10 13:09:42.418+00	f	2026-01-03 13:09:42.423+00
effa1857-f49c-4b54-9b97-c4c00e7170bc	67387601-321a-406e-8a54-a8ccd93b29ba	5c22de88b9378cffc3f48dc1c5b570e27257937b49f909a3efc4bca07e5fc14c	2026-01-14 15:12:29.812+00	f	2026-01-07 15:12:29.818+00
1e685c0d-a46f-4003-88b7-f5d75dc994d4	87871141-c0aa-4a64-8a94-3a2ddb387cc2	287f5117df976f3508b8e630c4e4949526253164be5feab1fce80b838f5cb4e0	2026-01-14 15:13:50.916+00	f	2026-01-07 15:13:50.917+00
68db86cd-2616-40f3-bfe4-aa8a3915227f	67387601-321a-406e-8a54-a8ccd93b29ba	00c69143b96e9e50fde7beb0da22b721c0d69615906e932212693e7a043b8172	2026-01-15 13:15:22.306+00	f	2026-01-08 13:15:22.315+00
\.


--
-- TOC entry 3665 (class 0 OID 16888)
-- Dependencies: 225
-- Data for Name: sketch_searches; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.sketch_searches (id, sketch_photo_id, candidate_person_id, candidate_photo_id, similarity_score, decision, performed_by, case_id, model_name, model_version, created_at) FROM stdin;
\.


--
-- TOC entry 3663 (class 0 OID 16698)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: safecity
--

COPY public.users (id, role, full_name, email, phone, password_hash, is_active, is_verified, created_at, updated_at) FROM stdin;
67387601-321a-406e-8a54-a8ccd93b29ba	ADMIN	ADMIN	admin@safecity.ai	\N	$2b$12$4EQeE8KPYPtCJEqit/wYZugiB2POjZfNlLCeFEo2pJxauswqjxwpO	t	f	2025-12-30 12:38:20.321+00	2025-12-30 12:38:20.321+00
8b76a5af-2c5f-44fb-a7d9-5e0c434daae9	USER	Aditya Gaonkar	aditya@gmail.com	\N	$2b$12$8yp2ihn4Ma0ueP2OtCArVObUlMIOR323Op/f2XHiXlhU.61qYNX7W	t	f	2025-12-30 12:40:20.366+00	2025-12-30 12:40:20.366+00
87871141-c0aa-4a64-8a94-3a2ddb387cc2	SUPER_ADMIN	SUPER ADMIN	superadmin@safecity.ai	\N	$2b$12$iEFAZ8D9EMOgZ2QXqZymROtAKVkye9ib06yNzrQyqKIju9rxauMyO	t	f	2025-12-30 12:43:08.45+00	2025-12-30 12:43:08.45+00
\.


--
-- TOC entry 3419 (class 2606 OID 16710)
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- TOC entry 3431 (class 2606 OID 16714)
-- Name: case_person_photos case_person_photos_file_hash_key; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person_photos
    ADD CONSTRAINT case_person_photos_file_hash_key UNIQUE (file_hash);


--
-- TOC entry 3433 (class 2606 OID 16716)
-- Name: case_person_photos case_person_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person_photos
    ADD CONSTRAINT case_person_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 3426 (class 2606 OID 16718)
-- Name: case_person case_person_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person
    ADD CONSTRAINT case_person_pkey PRIMARY KEY (id);


--
-- TOC entry 3441 (class 2606 OID 16720)
-- Name: cases cases_case_number_key; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_case_number_key UNIQUE (case_number);


--
-- TOC entry 3443 (class 2606 OID 16722)
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- TOC entry 3449 (class 2606 OID 16724)
-- Name: cctv_cameras cctv_cameras_camera_code_key; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_cameras
    ADD CONSTRAINT cctv_cameras_camera_code_key UNIQUE (camera_code);


--
-- TOC entry 3451 (class 2606 OID 16726)
-- Name: cctv_cameras cctv_cameras_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_cameras
    ADD CONSTRAINT cctv_cameras_pkey PRIMARY KEY (id);


--
-- TOC entry 3455 (class 2606 OID 16728)
-- Name: cctv_logs cctv_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_logs
    ADD CONSTRAINT cctv_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 3461 (class 2606 OID 16730)
-- Name: face_embeddings face_embeddings_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.face_embeddings
    ADD CONSTRAINT face_embeddings_pkey PRIMARY KEY (id);


--
-- TOC entry 3477 (class 2606 OID 16870)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 16897)
-- Name: sketch_searches sketch_searches_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT sketch_searches_pkey PRIMARY KEY (id);


--
-- TOC entry 3469 (class 2606 OID 16732)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3471 (class 2606 OID 16734)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 3473 (class 2606 OID 16736)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3462 (class 1259 OID 16737)
-- Name: face_embeddings_vector_idx; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX face_embeddings_vector_idx ON public.face_embeddings USING ivfflat (embedding public.vector_cosine_ops) WITH (lists='100');


--
-- TOC entry 3420 (class 1259 OID 16738)
-- Name: idx_alerts_case; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_alerts_case ON public.alerts USING btree (case_id);


--
-- TOC entry 3421 (class 1259 OID 16739)
-- Name: idx_alerts_created; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_alerts_created ON public.alerts USING btree (created_at DESC);


--
-- TOC entry 3422 (class 1259 OID 16740)
-- Name: idx_alerts_person; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_alerts_person ON public.alerts USING btree (person_id);


--
-- TOC entry 3423 (class 1259 OID 16741)
-- Name: idx_alerts_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_alerts_status ON public.alerts USING btree (status);


--
-- TOC entry 3424 (class 1259 OID 16742)
-- Name: idx_alerts_type; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_alerts_type ON public.alerts USING btree (alert_type);


--
-- TOC entry 3427 (class 1259 OID 16743)
-- Name: idx_case_person_case; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_case_person_case ON public.case_person USING btree (case_id);


--
-- TOC entry 3428 (class 1259 OID 16744)
-- Name: idx_case_person_category; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_case_person_category ON public.case_person USING btree (category);


--
-- TOC entry 3434 (class 1259 OID 16745)
-- Name: idx_case_person_photos_embedding; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_case_person_photos_embedding ON public.case_person_photos USING btree (embedding_generated);


--
-- TOC entry 3435 (class 1259 OID 16746)
-- Name: idx_case_person_photos_person; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_case_person_photos_person ON public.case_person_photos USING btree (case_person_id);


--
-- TOC entry 3436 (class 1259 OID 16747)
-- Name: idx_case_person_photos_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_case_person_photos_status ON public.case_person_photos USING btree (status);


--
-- TOC entry 3444 (class 1259 OID 16748)
-- Name: idx_cases_assigned_admin; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cases_assigned_admin ON public.cases USING btree (assigned_admin);


--
-- TOC entry 3445 (class 1259 OID 16749)
-- Name: idx_cases_created_by; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cases_created_by ON public.cases USING btree (created_by);


--
-- TOC entry 3446 (class 1259 OID 16750)
-- Name: idx_cases_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cases_status ON public.cases USING btree (status);


--
-- TOC entry 3447 (class 1259 OID 16751)
-- Name: idx_cases_type; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cases_type ON public.cases USING btree (case_type);


--
-- TOC entry 3452 (class 1259 OID 16752)
-- Name: idx_cctv_location; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_location ON public.cctv_cameras USING btree (latitude, longitude);


--
-- TOC entry 3456 (class 1259 OID 16753)
-- Name: idx_cctv_logs_camera; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_logs_camera ON public.cctv_logs USING btree (camera_id);


--
-- TOC entry 3457 (class 1259 OID 16754)
-- Name: idx_cctv_logs_person; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_logs_person ON public.cctv_logs USING btree (detected_person_id);


--
-- TOC entry 3458 (class 1259 OID 16755)
-- Name: idx_cctv_logs_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_logs_status ON public.cctv_logs USING btree (detection_status);


--
-- TOC entry 3459 (class 1259 OID 16756)
-- Name: idx_cctv_logs_time; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_logs_time ON public.cctv_logs USING btree (detected_at DESC);


--
-- TOC entry 3453 (class 1259 OID 16757)
-- Name: idx_cctv_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_cctv_status ON public.cctv_cameras USING btree (status);


--
-- TOC entry 3463 (class 1259 OID 16758)
-- Name: idx_face_embeddings_person; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_face_embeddings_person ON public.face_embeddings USING btree (case_person_id);


--
-- TOC entry 3464 (class 1259 OID 16759)
-- Name: idx_face_embeddings_status; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_face_embeddings_status ON public.face_embeddings USING btree (embedding_status);


--
-- TOC entry 3437 (class 1259 OID 16924)
-- Name: idx_photo_candidates_only; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_photo_candidates_only ON public.case_person_photos USING btree (id) WHERE (image_type = 'PHOTO'::public.image_type);


--
-- TOC entry 3474 (class 1259 OID 16877)
-- Name: idx_refresh_tokens_token_hash; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_refresh_tokens_token_hash ON public.refresh_tokens USING btree (token_hash);


--
-- TOC entry 3475 (class 1259 OID 16876)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 3438 (class 1259 OID 16923)
-- Name: idx_sketch_photos_only; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_sketch_photos_only ON public.case_person_photos USING btree (id) WHERE (image_type = 'SKETCH'::public.image_type);


--
-- TOC entry 3478 (class 1259 OID 16925)
-- Name: idx_sketch_searches_case; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_sketch_searches_case ON public.sketch_searches USING btree (case_id);


--
-- TOC entry 3479 (class 1259 OID 16927)
-- Name: idx_sketch_searches_decision; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_sketch_searches_decision ON public.sketch_searches USING btree (decision);


--
-- TOC entry 3480 (class 1259 OID 16926)
-- Name: idx_sketch_searches_sketch; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_sketch_searches_sketch ON public.sketch_searches USING btree (sketch_photo_id);


--
-- TOC entry 3481 (class 1259 OID 16928)
-- Name: idx_sketch_searches_time; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_sketch_searches_time ON public.sketch_searches USING btree (created_at DESC);


--
-- TOC entry 3466 (class 1259 OID 16760)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 3467 (class 1259 OID 16761)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: safecity
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 3429 (class 1259 OID 16860)
-- Name: one_primary_person_per_case; Type: INDEX; Schema: public; Owner: safecity
--

CREATE UNIQUE INDEX one_primary_person_per_case ON public.case_person USING btree (case_id) WHERE (is_primary = true);


--
-- TOC entry 3439 (class 1259 OID 16762)
-- Name: one_primary_photo_per_person; Type: INDEX; Schema: public; Owner: safecity
--

CREATE UNIQUE INDEX one_primary_photo_per_person ON public.case_person_photos USING btree (case_person_id) WHERE (is_primary = true);


--
-- TOC entry 3465 (class 1259 OID 16763)
-- Name: unique_embedding_per_photo_model; Type: INDEX; Schema: public; Owner: safecity
--

CREATE UNIQUE INDEX unique_embedding_per_photo_model ON public.face_embeddings USING btree (photo_id, model_name, model_version);


--
-- TOC entry 3510 (class 2620 OID 16764)
-- Name: cases trg_case_admin_check; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_case_admin_check BEFORE INSERT OR UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.enforce_admin_assignment();


--
-- TOC entry 3509 (class 2620 OID 16765)
-- Name: case_person_photos trg_case_person_photos_updated; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_case_person_photos_updated BEFORE UPDATE ON public.case_person_photos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3508 (class 2620 OID 16766)
-- Name: case_person trg_case_person_updated; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_case_person_updated BEFORE UPDATE ON public.case_person FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3511 (class 2620 OID 16767)
-- Name: cases trg_cases_updated; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3512 (class 2620 OID 16768)
-- Name: cctv_cameras trg_cctv_cameras_updated; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_cctv_cameras_updated BEFORE UPDATE ON public.cctv_cameras FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3513 (class 2620 OID 16769)
-- Name: users trg_users_updated; Type: TRIGGER; Schema: public; Owner: safecity
--

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 3484 (class 2606 OID 16770)
-- Name: alerts alerts_acknowledged_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_acknowledged_by_fkey FOREIGN KEY (acknowledged_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3485 (class 2606 OID 16775)
-- Name: alerts alerts_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cctv_cameras(id) ON DELETE SET NULL;


--
-- TOC entry 3486 (class 2606 OID 16780)
-- Name: alerts alerts_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;


--
-- TOC entry 3487 (class 2606 OID 16785)
-- Name: alerts alerts_cctv_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_cctv_log_id_fkey FOREIGN KEY (cctv_log_id) REFERENCES public.cctv_logs(id) ON DELETE SET NULL;


--
-- TOC entry 3488 (class 2606 OID 16790)
-- Name: alerts alerts_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_person_id_fkey FOREIGN KEY (person_id) REFERENCES public.case_person(id) ON DELETE SET NULL;


--
-- TOC entry 3489 (class 2606 OID 16795)
-- Name: alerts alerts_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3490 (class 2606 OID 16800)
-- Name: case_person case_person_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person
    ADD CONSTRAINT case_person_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- TOC entry 3491 (class 2606 OID 16805)
-- Name: case_person_photos case_person_photos_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person_photos
    ADD CONSTRAINT case_person_photos_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3492 (class 2606 OID 16810)
-- Name: case_person_photos case_person_photos_case_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person_photos
    ADD CONSTRAINT case_person_photos_case_person_id_fkey FOREIGN KEY (case_person_id) REFERENCES public.case_person(id) ON DELETE CASCADE;


--
-- TOC entry 3493 (class 2606 OID 16815)
-- Name: case_person_photos case_person_photos_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.case_person_photos
    ADD CONSTRAINT case_person_photos_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3494 (class 2606 OID 16820)
-- Name: cases cases_assigned_admin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_assigned_admin_fkey FOREIGN KEY (assigned_admin) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3495 (class 2606 OID 16825)
-- Name: cases cases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3496 (class 2606 OID 16830)
-- Name: cctv_cameras cctv_cameras_installed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_cameras
    ADD CONSTRAINT cctv_cameras_installed_by_fkey FOREIGN KEY (installed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3497 (class 2606 OID 16835)
-- Name: cctv_logs cctv_logs_camera_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_logs
    ADD CONSTRAINT cctv_logs_camera_id_fkey FOREIGN KEY (camera_id) REFERENCES public.cctv_cameras(id) ON DELETE CASCADE;


--
-- TOC entry 3498 (class 2606 OID 16840)
-- Name: cctv_logs cctv_logs_detected_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_logs
    ADD CONSTRAINT cctv_logs_detected_person_id_fkey FOREIGN KEY (detected_person_id) REFERENCES public.case_person(id) ON DELETE SET NULL;


--
-- TOC entry 3499 (class 2606 OID 16845)
-- Name: cctv_logs cctv_logs_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.cctv_logs
    ADD CONSTRAINT cctv_logs_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3500 (class 2606 OID 16850)
-- Name: face_embeddings face_embeddings_case_person_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.face_embeddings
    ADD CONSTRAINT face_embeddings_case_person_id_fkey FOREIGN KEY (case_person_id) REFERENCES public.case_person(id) ON DELETE CASCADE;


--
-- TOC entry 3501 (class 2606 OID 16855)
-- Name: face_embeddings face_embeddings_photo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.face_embeddings
    ADD CONSTRAINT face_embeddings_photo_id_fkey FOREIGN KEY (photo_id) REFERENCES public.case_person_photos(id) ON DELETE CASCADE;


--
-- TOC entry 3503 (class 2606 OID 16903)
-- Name: sketch_searches fk_candidate_person; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT fk_candidate_person FOREIGN KEY (candidate_person_id) REFERENCES public.case_person(id) ON DELETE CASCADE;


--
-- TOC entry 3504 (class 2606 OID 16908)
-- Name: sketch_searches fk_candidate_photo; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT fk_candidate_photo FOREIGN KEY (candidate_photo_id) REFERENCES public.case_person_photos(id) ON DELETE CASCADE;


--
-- TOC entry 3505 (class 2606 OID 16898)
-- Name: sketch_searches fk_sketch_photo; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT fk_sketch_photo FOREIGN KEY (sketch_photo_id) REFERENCES public.case_person_photos(id) ON DELETE CASCADE;


--
-- TOC entry 3506 (class 2606 OID 16918)
-- Name: sketch_searches fk_sketch_search_case; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT fk_sketch_search_case FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- TOC entry 3507 (class 2606 OID 16913)
-- Name: sketch_searches fk_sketch_search_user; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.sketch_searches
    ADD CONSTRAINT fk_sketch_search_user FOREIGN KEY (performed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 3502 (class 2606 OID 16871)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: safecity
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-01-08 18:57:01

--
-- PostgreSQL database dump complete
--

\unrestrict 9z4ufaPSelGsyz0alcekrbIs5kVaeneKcpflbfPcbCXjJgE1FZDLULsxNVPr1XE

