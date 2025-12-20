--
-- PostgreSQL database dump
--

\restrict Wzm4rJhHzWXcqKEZ1h94QpQa8h4b61Z9g2t4gdkJeCCDDZOcEF924XLejyAIDRs

-- Dumped from database version 18.1 (Postgres.app)
-- Dumped by pg_dump version 18.1 (Postgres.app)

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
-- Name: companycategory; Type: TYPE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TYPE public.companycategory AS ENUM (
    'PRODUCER',
    'DISTRIBUTOR',
    'BOTH'
);


ALTER TYPE public.companycategory OWNER TO "test-devscaffolding_user";

--
-- Name: movementtype; Type: TYPE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TYPE public.movementtype AS ENUM (
    'IN',
    'OUT',
    'ADJUST'
);


ALTER TYPE public.movementtype OWNER TO "test-devscaffolding_user";

--
-- Name: unitofmeasure; Type: TYPE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TYPE public.unitofmeasure AS ENUM (
    'BOTTLE',
    'PACKAGE'
);


ALTER TYPE public.unitofmeasure OWNER TO "test-devscaffolding_user";

--
-- Name: winetype; Type: TYPE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TYPE public.winetype AS ENUM (
    'RED',
    'WHITE',
    'ROSE',
    'SPARKLING',
    'DESSERT',
    'OTHER'
);


ALTER TYPE public.winetype OWNER TO "test-devscaffolding_user";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO "test-devscaffolding_user";

--
-- Name: companies; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.companies (
    id integer CONSTRAINT suppliers_id_not_null NOT NULL,
    name character varying CONSTRAINT suppliers_name_not_null NOT NULL,
    contact_email character varying,
    phone character varying,
    address text,
    vat_number character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now() CONSTRAINT suppliers_created_at_not_null NOT NULL,
    updated_at timestamp with time zone DEFAULT now() CONSTRAINT suppliers_updated_at_not_null NOT NULL,
    category public.companycategory DEFAULT 'BOTH'::public.companycategory NOT NULL
);


ALTER TABLE public.companies OWNER TO "test-devscaffolding_user";

--
-- Name: lots; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.lots (
    id integer NOT NULL,
    wine_id integer NOT NULL,
    quantity integer NOT NULL,
    received_date date NOT NULL,
    expiry_date date,
    order_id integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lots OWNER TO "test-devscaffolding_user";

--
-- Name: lots_id_seq; Type: SEQUENCE; Schema: public; Owner: test-devscaffolding_user
--

CREATE SEQUENCE public.lots_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lots_id_seq OWNER TO "test-devscaffolding_user";

--
-- Name: lots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: test-devscaffolding_user
--

ALTER SEQUENCE public.lots_id_seq OWNED BY public.lots.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    wine_id integer NOT NULL,
    lot_id integer,
    type public.movementtype NOT NULL,
    quantity integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
    note text,
    reference character varying,
    user_id integer,
    unit public.unitofmeasure DEFAULT 'BOTTLE'::public.unitofmeasure NOT NULL,
    quantity_in_unit integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO "test-devscaffolding_user";

--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: test-devscaffolding_user
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO "test-devscaffolding_user";

--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: test-devscaffolding_user
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: test-devscaffolding_user
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO "test-devscaffolding_user";

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: test-devscaffolding_user
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.companies.id;


--
-- Name: translations; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.translations (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    code character varying(100) NOT NULL,
    label_it character varying(255) NOT NULL,
    label_en character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.translations OWNER TO "test-devscaffolding_user";

--
-- Name: translations_id_seq; Type: SEQUENCE; Schema: public; Owner: test-devscaffolding_user
--

CREATE SEQUENCE public.translations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.translations_id_seq OWNER TO "test-devscaffolding_user";

--
-- Name: translations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: test-devscaffolding_user
--

ALTER SEQUENCE public.translations_id_seq OWNED BY public.translations.id;


--
-- Name: wines; Type: TABLE; Schema: public; Owner: test-devscaffolding_user
--

CREATE TABLE public.wines (
    id integer NOT NULL,
    name character varying NOT NULL,
    vintage integer NOT NULL,
    type public.winetype NOT NULL,
    denomination character varying,
    price numeric(10,2) NOT NULL,
    quantity integer NOT NULL,
    threshold integer,
    barcode character varying,
    supplier_id integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    bottles_per_package integer DEFAULT 6 NOT NULL,
    barcode_type character varying(20) DEFAULT 'EAN13'::character varying,
    producer_id integer
);


ALTER TABLE public.wines OWNER TO "test-devscaffolding_user";

--
-- Name: wines_id_seq; Type: SEQUENCE; Schema: public; Owner: test-devscaffolding_user
--

CREATE SEQUENCE public.wines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wines_id_seq OWNER TO "test-devscaffolding_user";

--
-- Name: wines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: test-devscaffolding_user
--

ALTER SEQUENCE public.wines_id_seq OWNED BY public.wines.id;


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: lots id; Type: DEFAULT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.lots ALTER COLUMN id SET DEFAULT nextval('public.lots_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: translations id; Type: DEFAULT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.translations ALTER COLUMN id SET DEFAULT nextval('public.translations_id_seq'::regclass);


--
-- Name: wines id; Type: DEFAULT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.wines ALTER COLUMN id SET DEFAULT nextval('public.wines_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.alembic_version (version_num) FROM stdin;
004_add_category_to_companies
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.companies (id, name, contact_email, phone, address, vat_number, notes, created_at, updated_at, category) FROM stdin;
3	Azienda Vinicola Gavi	info@gavi.it	\N	\N	\N	\N	2025-11-29 16:39:56.507319+01	2025-11-29 16:39:56.507319+01	BOTH
2	Tenuta di Montalcino 2	info@montalcino.it	+39 0577 654321	Località Montalcino, 53024 Montalcino (SI)	IT98765432109	\N	2025-11-29 16:39:56.507319+01	2025-11-30 17:58:02.807458+01	BOTH
4	Cantina Produttrice	info@produttore.it	\N	\N	\N	\N	2025-12-03 12:40:44.473826+01	2025-12-03 12:40:44.473826+01	PRODUCER
5	Distributore Vini SRL	ordini@distributore.it	\N	\N	\N	\N	2025-12-03 12:40:44.473826+01	2025-12-03 12:40:44.473826+01	DISTRIBUTOR
6	Azienda Vinicola Completa	info@completa.it	\N	\N	\N	\N	2025-12-03 12:40:44.473826+01	2025-12-03 12:40:44.473826+01	BOTH
1	Cantina Sociale di Alba	info@cantinaalba.it	+39 0173 123456	Via Roma 1, 12051 Alba (CN)	IT12345678901	\N	2025-11-29 16:39:56.507319+01	2025-12-03 15:27:12.731031+01	PRODUCER
\.


--
-- Data for Name: lots; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.lots (id, wine_id, quantity, received_date, expiry_date, order_id, notes, created_at) FROM stdin;
9	3	4	2025-11-30	\N	\N	\N	2025-11-30 18:05:38.922058+01
10	1	0	2025-12-03	\N	\N	\N	2025-12-03 12:01:22.372507+01
11	6	1	2025-12-03	\N	\N	\N	2025-12-03 12:29:51.235861+01
12	7	1	2025-12-05	\N	\N	\N	2025-12-05 18:23:08.861319+01
\.


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.stock_movements (id, wine_id, lot_id, type, quantity, "timestamp", note, reference, user_id, unit, quantity_in_unit) FROM stdin;
1	1	\N	IN	24	2025-10-30 16:39:56.507319+01	Carico iniziale	ORD-2024-001	\N	BOTTLE	24
2	2	\N	IN	12	2025-11-01 16:39:56.507319+01	Carico iniziale	ORD-2024-002	\N	BOTTLE	12
3	3	\N	IN	18	2025-11-04 16:39:56.507319+01	Carico iniziale	\N	\N	BOTTLE	18
4	4	\N	IN	36	2025-11-09 16:39:56.507319+01	Carico iniziale	\N	\N	BOTTLE	36
5	5	\N	IN	48	2025-11-11 16:39:56.507319+01	Carico iniziale	\N	\N	BOTTLE	48
6	6	\N	IN	30	2025-11-14 16:39:56.507319+01	Carico iniziale	\N	\N	BOTTLE	30
7	7	\N	IN	15	2025-11-17 16:39:56.507319+01	Carico iniziale	\N	\N	BOTTLE	15
8	1	\N	OUT	6	2025-11-19 16:39:56.507319+01	Vendita ristorante	\N	\N	BOTTLE	6
9	4	\N	OUT	12	2025-11-21 16:39:56.507319+01	Vendita enoteca	\N	\N	BOTTLE	12
10	5	\N	OUT	24	2025-11-24 16:39:56.507319+01	Grande ordine	\N	\N	BOTTLE	24
11	1	\N	OUT	3	2025-11-27 16:39:56.507319+01	Vendita al dettaglio	\N	\N	BOTTLE	3
12	2	\N	IN	6	2025-11-28 16:39:56.507319+01	Riassortimento	ORD-2024-010	\N	BOTTLE	6
13	3	\N	OUT	2	2025-11-29 16:39:56.507319+01	Degustazione evento	\N	\N	BOTTLE	2
14	3	9	IN	4	2025-11-30 18:05:38.922058+01	\N	\N	\N	BOTTLE	4
15	1	10	IN	1	2025-12-03 12:01:22.372507+01	\N	\N	\N	BOTTLE	1
16	1	10	OUT	1	2025-12-03 12:19:18.276843+01	\N	\N	\N	BOTTLE	1
17	6	11	IN	1	2025-12-03 12:29:51.235861+01	\N	\N	\N	BOTTLE	1
18	7	12	IN	1	2025-12-05 18:23:08.861319+01	\N	\N	\N	BOTTLE	1
\.


--
-- Data for Name: translations; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.translations (id, category, code, label_it, label_en, created_at, updated_at) FROM stdin;
1	wine_type	red	Rosso	Red	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
2	wine_type	white	Bianco	White	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
3	wine_type	rose	Rosato	Rosé	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
4	wine_type	sparkling	Spumante	Sparkling	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
5	wine_type	dessert	Passito	Dessert	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
6	wine_type	other	Altro	Other	2025-11-29 14:05:54.967333+01	2025-11-29 14:05:54.967333+01
\.


--
-- Data for Name: wines; Type: TABLE DATA; Schema: public; Owner: test-devscaffolding_user
--

COPY public.wines (id, name, vintage, type, denomination, price, quantity, threshold, barcode, supplier_id, notes, created_at, updated_at, bottles_per_package, barcode_type, producer_id) FROM stdin;
8	Vino Sotto Soglia	2021	RED	\N	20.00	3	15	\N	\N	\N	2025-11-29 16:39:56.507319+01	2025-11-29 16:39:56.507319+01	6	EAN13	\N
9	Vino Esaurito	2020	WHITE	\N	25.00	0	10	\N	\N	\N	2025-11-29 16:39:56.507319+01	2025-11-29 16:39:56.507319+01	6	EAN13	\N
10	prova dan	2023	RED	\N	12.00	0	10	\N	\N	\N	2025-11-30 10:53:50.260415+01	2025-11-30 10:53:50.260415+01	6	EAN13	\N
5	Vermentino di Gallura DOCG	2023	WHITE	DOCG	16.50	48	20	1234567890121	\N	\N	2025-11-29 16:39:56.507319+01	2025-12-03 11:27:16.169056+01	6	EAN13	\N
3	Barbaresco DOCG	2019	RED	DOCG	42.00	22	12	\N	1	\N	2025-11-29 16:39:56.507319+01	2025-11-30 18:05:38.922058+01	6	EAN13	1
2	Brunello di Montalcino DOCG	2017	RED	DOCG	55.00	12	8	1234567890123	2	\N	2025-11-29 16:39:56.507319+01	2025-12-03 11:17:10.749473+01	6	EAN13	2
4	Gavi DOCG	2022	WHITE	DOCG	18.00	36	15	1234567890122	3	\N	2025-11-29 16:39:56.507319+01	2025-12-03 11:25:38.107809+01	6	EAN13	3
1	Barolo DOCG Riserva	2018	RED	DOCG	45.50	24	10	1234567890125	1	Invecchiato 5 anni in botte	2025-11-29 16:39:56.507319+01	2025-12-03 12:19:18.276843+01	6	EAN13	1
6	Chiaretto DOC	2023	ROSE	DOC	12.50	31	18	1234567890126	\N	\N	2025-11-29 16:39:56.507319+01	2025-12-03 12:29:51.235861+01	6	EAN13	\N
13	Barolo DOCG	2020	OTHER	\N	45.00	100	10	\N	5	\N	2025-12-03 12:40:44.473826+01	2025-12-03 12:40:44.473826+01	6	EAN13	4
14	Chianti Classico	2021	OTHER	\N	25.00	50	10	\N	6	\N	2025-12-03 12:40:44.473826+01	2025-12-03 12:40:44.473826+01	6	EAN13	6
7	Franciacorta DOCG Brut	2020	SPARKLING	DOCG	28.00	16	10	1234567890127	\N	\N	2025-11-29 16:39:56.507319+01	2025-12-05 18:23:08.861319+01	6	EAN13	\N
\.


--
-- Name: lots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: test-devscaffolding_user
--

SELECT pg_catalog.setval('public.lots_id_seq', 12, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: test-devscaffolding_user
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 18, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: test-devscaffolding_user
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 6, true);


--
-- Name: translations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: test-devscaffolding_user
--

SELECT pg_catalog.setval('public.translations_id_seq', 6, true);


--
-- Name: wines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: test-devscaffolding_user
--

SELECT pg_catalog.setval('public.wines_id_seq', 14, true);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: lots lots_pkey; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.lots
    ADD CONSTRAINT lots_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: companies suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: translations translations_pkey; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT translations_pkey PRIMARY KEY (id);


--
-- Name: translations uq_translation_category_code; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.translations
    ADD CONSTRAINT uq_translation_category_code UNIQUE (category, code);


--
-- Name: wines wines_pkey; Type: CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.wines
    ADD CONSTRAINT wines_pkey PRIMARY KEY (id);


--
-- Name: ix_companies_category; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_companies_category ON public.companies USING btree (category);


--
-- Name: ix_companies_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_companies_id ON public.companies USING btree (id);


--
-- Name: ix_companies_name; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_companies_name ON public.companies USING btree (name);


--
-- Name: ix_companies_vat_number; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE UNIQUE INDEX ix_companies_vat_number ON public.companies USING btree (vat_number);


--
-- Name: ix_lots_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_lots_id ON public.lots USING btree (id);


--
-- Name: ix_lots_received_date; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_lots_received_date ON public.lots USING btree (received_date);


--
-- Name: ix_lots_wine_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_lots_wine_id ON public.lots USING btree (wine_id);


--
-- Name: ix_stock_movements_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_id ON public.stock_movements USING btree (id);


--
-- Name: ix_stock_movements_lot_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_lot_id ON public.stock_movements USING btree (lot_id);


--
-- Name: ix_stock_movements_reference; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_reference ON public.stock_movements USING btree (reference);


--
-- Name: ix_stock_movements_timestamp; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_timestamp ON public.stock_movements USING btree ("timestamp");


--
-- Name: ix_stock_movements_type; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_type ON public.stock_movements USING btree (type);


--
-- Name: ix_stock_movements_wine_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_stock_movements_wine_id ON public.stock_movements USING btree (wine_id);


--
-- Name: ix_translations_category; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_translations_category ON public.translations USING btree (category);


--
-- Name: ix_translations_code; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_translations_code ON public.translations USING btree (code);


--
-- Name: ix_wines_barcode; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE UNIQUE INDEX ix_wines_barcode ON public.wines USING btree (barcode);


--
-- Name: ix_wines_denomination; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_denomination ON public.wines USING btree (denomination);


--
-- Name: ix_wines_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_id ON public.wines USING btree (id);


--
-- Name: ix_wines_name; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_name ON public.wines USING btree (name);


--
-- Name: ix_wines_producer_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_producer_id ON public.wines USING btree (producer_id);


--
-- Name: ix_wines_supplier_id; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_supplier_id ON public.wines USING btree (supplier_id);


--
-- Name: ix_wines_type; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_type ON public.wines USING btree (type);


--
-- Name: ix_wines_vintage; Type: INDEX; Schema: public; Owner: test-devscaffolding_user
--

CREATE INDEX ix_wines_vintage ON public.wines USING btree (vintage);


--
-- Name: wines fk_wines_producer_id; Type: FK CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.wines
    ADD CONSTRAINT fk_wines_producer_id FOREIGN KEY (producer_id) REFERENCES public.companies(id);


--
-- Name: wines fk_wines_supplier_id; Type: FK CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.wines
    ADD CONSTRAINT fk_wines_supplier_id FOREIGN KEY (supplier_id) REFERENCES public.companies(id);


--
-- Name: lots lots_wine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.lots
    ADD CONSTRAINT lots_wine_id_fkey FOREIGN KEY (wine_id) REFERENCES public.wines(id);


--
-- Name: stock_movements stock_movements_lot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_lot_id_fkey FOREIGN KEY (lot_id) REFERENCES public.lots(id);


--
-- Name: stock_movements stock_movements_wine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test-devscaffolding_user
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_wine_id_fkey FOREIGN KEY (wine_id) REFERENCES public.wines(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Wzm4rJhHzWXcqKEZ1h94QpQa8h4b61Z9g2t4gdkJeCCDDZOcEF924XLejyAIDRs

