--
-- PostgreSQL database dump
--

\restrict 8h6kwCSJWcLmTUBrbp4dJwi7jlPXOv9IdqtsoD5mc5Kp2lS27PO0mcIFXGckYX6

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: protoxtap
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO protoxtap;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: protoxtap
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint,
    name text,
    applied_at timestamp with time zone DEFAULT now()
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO protoxtap;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: protoxtap
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO protoxtap;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: protoxtap
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: protoxtap
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    username text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_users OWNER TO protoxtap;

--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: protoxtap
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_users_id_seq OWNER TO protoxtap;

--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: protoxtap
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: businesses; Type: TABLE; Schema: public; Owner: protoxtap
--

CREATE TABLE public.businesses (
    id integer NOT NULL,
    business_name text NOT NULL,
    contact_name text,
    email text,
    phone text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.businesses OWNER TO protoxtap;

--
-- Name: businesses_id_seq; Type: SEQUENCE; Schema: public; Owner: protoxtap
--

CREATE SEQUENCE public.businesses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.businesses_id_seq OWNER TO protoxtap;

--
-- Name: businesses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: protoxtap
--

ALTER SEQUENCE public.businesses_id_seq OWNED BY public.businesses.id;


--
-- Name: card_events; Type: TABLE; Schema: public; Owner: protoxtap
--

CREATE TABLE public.card_events (
    id integer NOT NULL,
    card_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    event_type text
);


ALTER TABLE public.card_events OWNER TO protoxtap;

--
-- Name: card_events_id_seq; Type: SEQUENCE; Schema: public; Owner: protoxtap
--

CREATE SEQUENCE public.card_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.card_events_id_seq OWNER TO protoxtap;

--
-- Name: card_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: protoxtap
--

ALTER SEQUENCE public.card_events_id_seq OWNED BY public.card_events.id;


--
-- Name: cards; Type: TABLE; Schema: public; Owner: protoxtap
--

CREATE TABLE public.cards (
    id integer NOT NULL,
    card_code text NOT NULL,
    business_id integer,
    google_review_url text,
    status text DEFAULT 'unassigned'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    activated_at timestamp without time zone,
    deactivated_at timestamp without time zone
);


ALTER TABLE public.cards OWNER TO protoxtap;

--
-- Name: cards_id_seq; Type: SEQUENCE; Schema: public; Owner: protoxtap
--

CREATE SEQUENCE public.cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cards_id_seq OWNER TO protoxtap;

--
-- Name: cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: protoxtap
--

ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: protoxtap
--

CREATE TABLE public.sessions (
    id integer NOT NULL,
    token_hash text NOT NULL,
    admin_user_id integer NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO protoxtap;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: protoxtap
--

CREATE SEQUENCE public.sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessions_id_seq OWNER TO protoxtap;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: protoxtap
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: protoxtap
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: businesses id; Type: DEFAULT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.businesses ALTER COLUMN id SET DEFAULT nextval('public.businesses_id_seq'::regclass);


--
-- Name: card_events id; Type: DEFAULT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.card_events ALTER COLUMN id SET DEFAULT nextval('public.card_events_id_seq'::regclass);


--
-- Name: cards id; Type: DEFAULT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: protoxtap
--

COPY drizzle.__drizzle_migrations (id, hash, created_at, name, applied_at) FROM stdin;
1	7b7d2de3389a23c20d144552fd6bd0c53c317b859355d7c9b501cb42704eb07c	1790448951000	20260926185551_create_protoxtap_tables	2026-10-01 13:20:47.185697+00
2	26835ca541f5e0b8b74dd27edfd1da238d240f6555d3bee81acdfafdea0c3565	1790860050000	20261001130730_luxuriant_sasquatch	2026-10-01 13:21:09.475926+00
3	8339835501952202dd08836aab70c584cb0108d8ac168e0ee8a29cac77ff818f	1790863744000	20261001140904_rapid_miss_america	2026-10-01 14:09:11.740567+00
4	08538b3dc613bcabfba6c8d55cea30fc7a7ae2c41a61a30892b721ec425b0381	1790863993000	20261001141313_perpetual_bastion	2026-10-01 14:13:18.396372+00
5	46cbbe3ea2559d2bbb83ae39c10e5143c12f9fe66bc073a7b28f0ef6687a1b75	1790868594000	20261001152954_wise_romulus	2026-10-01 15:30:07.518633+00
\.


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: protoxtap
--

COPY public.admin_users (id, username, password_hash, created_at) FROM stdin;
1	Dozlex	b8a7b3401708697742ececd632133eed:fc5e6f49f396fa88bcc943db1c4c2564272aae54e17474e36b5beebda9e448eac1ac22379d4ee6bf8a3744634a15c30f0395acfe4480ec404a6826d7988b891e	2026-10-01 14:10:22.680467
\.


--
-- Data for Name: businesses; Type: TABLE DATA; Schema: public; Owner: protoxtap
--

COPY public.businesses (id, business_name, contact_name, email, phone, notes, created_at) FROM stdin;
1	The Picadilly Tavern	Danni	Danni@Gmail.com	07923910153	shes on holiday	2026-09-28 17:30:40.488036
2	Protox API Test	Test Person	test@protoxtap.com	01234567890	Created through the API	2026-10-01 13:40:49.350236
3	protox	kaizan	dozlexisking@gmail.com	07923910153	\N	2026-10-01 14:57:48.623477
\.


--
-- Data for Name: card_events; Type: TABLE DATA; Schema: public; Owner: protoxtap
--

COPY public.card_events (id, card_id, created_at, event_type) FROM stdin;
1	2	2026-10-01 13:47:12.635939	\N
2	2	2026-10-01 13:47:38.827061	\N
3	2	2026-10-01 13:48:02.463518	\N
4	2	2026-10-01 13:50:00.943425	\N
5	2	2026-10-01 13:50:03.697957	\N
6	2	2026-10-01 13:50:09.031889	\N
7	2	2026-10-01 14:06:30.211435	\N
8	1	2026-10-01 14:56:43.664513	\N
9	1	2026-10-01 14:56:49.04448	\N
10	1	2026-10-01 14:57:02.925184	\N
11	1	2026-10-01 14:57:05.27702	\N
12	2	2026-10-01 14:57:13.652513	\N
13	1	2026-10-01 14:57:14.918924	\N
14	4	2026-10-01 14:59:42.375063	\N
15	4	2026-10-01 14:59:44.694482	\N
16	4	2026-10-01 15:01:15.841905	\N
17	3	2026-10-01 15:01:47.134873	\N
18	3	2026-10-01 15:02:04.440008	\N
19	5	2026-10-01 15:49:57.379991	assigned
20	5	2026-10-01 15:50:03.393799	activated
21	5	2026-10-01 15:50:47.251558	tap
22	5	2026-10-01 15:50:54.046882	deactivated
\.


--
-- Data for Name: cards; Type: TABLE DATA; Schema: public; Owner: protoxtap
--

COPY public.cards (id, card_code, business_id, google_review_url, status, created_at, activated_at, deactivated_at) FROM stdin;
2	PT-TEST-01	1	https://example.com/picadilly-test	inactive	2026-10-01 13:46:42.130964	2026-10-01 14:06:30.195	2026-10-01 14:57:13.646
1	PT-0001	1	https://example.com/test-review	inactive	2026-09-28 17:30:40.49467	2026-10-01 14:57:02.915	2026-10-01 14:57:14.914
4	PT-0005	3	https://protox-webpages.com/	inactive	2026-10-01 14:57:58.388697	2026-10-01 14:59:42.37	2026-10-01 15:01:15.837
3	PT-TEST-02	2	https://search.google.com/local/writereview?placeid=ChIJ9waiM1rLvJURwgM5Oi-Zm5A	active	2026-10-01 14:06:52.461465	2026-10-01 15:01:47.131	\N
5	PT-TEST_CARD	2	https://protox-webpages.com/	inactive	2026-10-01 15:49:50.233418	2026-10-01 15:50:03.387	2026-10-01 15:50:54.043
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: protoxtap
--

COPY public.sessions (id, token_hash, admin_user_id, expires_at, created_at) FROM stdin;
1	b8f67fb2c1b0f2802f9dae042bc40f022462498490fa887dc86bb48b7d581835	1	2026-10-08 14:19:24.797	2026-10-01 14:19:24.799803
2	627707abbb69415c8c44b4663ed110b150d593df9e7346bfc613fc374fdc3205	1	2026-10-08 14:43:36.369	2026-10-01 14:43:36.372526
4	7a4e84a28ee40711962cca992ef2cb75cbd95e52dd4acddf5991c625c6e2ed67	1	2026-10-08 14:55:36.516	2026-10-01 14:55:36.517632
5	ba4465439c4d90e3c072f8ebced4100ccf304ed455ae89ec13a932df3650df6d	1	2026-10-08 14:56:09.954	2026-10-01 14:56:09.955203
7	a4a55d52844878c07cac632b24ac3a65a4ef6fe5ef2e6715540e8bd24e138222	1	2026-10-08 15:46:52.986	2026-10-01 15:46:52.989242
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: protoxtap
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 5, true);


--
-- Name: admin_users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: protoxtap
--

SELECT pg_catalog.setval('public.admin_users_id_seq', 1, true);


--
-- Name: businesses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: protoxtap
--

SELECT pg_catalog.setval('public.businesses_id_seq', 3, true);


--
-- Name: card_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: protoxtap
--

SELECT pg_catalog.setval('public.card_events_id_seq', 22, true);


--
-- Name: cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: protoxtap
--

SELECT pg_catalog.setval('public.cards_id_seq', 5, true);


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: protoxtap
--

SELECT pg_catalog.setval('public.sessions_id_seq', 7, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: protoxtap
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_username_key; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_username_key UNIQUE (username);


--
-- Name: businesses businesses_pkey; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.businesses
    ADD CONSTRAINT businesses_pkey PRIMARY KEY (id);


--
-- Name: card_events card_events_pkey; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.card_events
    ADD CONSTRAINT card_events_pkey PRIMARY KEY (id);


--
-- Name: cards cards_card_code_key; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_card_code_key UNIQUE (card_code);


--
-- Name: cards cards_pkey; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_hash_key UNIQUE (token_hash);


--
-- Name: card_events card_events_card_id_cards_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.card_events
    ADD CONSTRAINT card_events_card_id_cards_id_fkey FOREIGN KEY (card_id) REFERENCES public.cards(id);


--
-- Name: cards cards_business_id_businesses_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.cards
    ADD CONSTRAINT cards_business_id_businesses_id_fkey FOREIGN KEY (business_id) REFERENCES public.businesses(id);


--
-- Name: sessions sessions_admin_user_id_admin_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: protoxtap
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_admin_user_id_admin_users_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.admin_users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 8h6kwCSJWcLmTUBrbp4dJwi7jlPXOv9IdqtsoD5mc5Kp2lS27PO0mcIFXGckYX6

