--
-- PostgreSQL database dump
--

\restrict IgQB2ue7wofo0MZ7gbPMXTffnDC9DFGaDkE7wos0Q7gqIJijpw0gh9SDIycxBu6

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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
-- Name: IngredientCategory; Type: TYPE; Schema: public; Owner: cooking_user
--

CREATE TYPE public."IngredientCategory" AS ENUM (
    'FECULENTS',
    'PROTEINES',
    'LEGUMES',
    'FRUITS',
    'PRODUITS_LAITIERS',
    'MATIERES_GRASSES',
    'CEREALES',
    'OLEAGINEUX',
    'PRODUITS_SUCRES',
    'PRODUITS_SALES',
    'BOISSONS',
    'EPICES_CONDIMENTS'
);


ALTER TYPE public."IngredientCategory" OWNER TO cooking_user;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: cooking_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO cooking_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO cooking_user;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    nom character varying(255) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    categorie public."IngredientCategory"
);


ALTER TABLE public.ingredients OWNER TO cooking_user;

--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ingredients_id_seq OWNER TO cooking_user;

--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: meal_plan; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.meal_plan (
    id integer NOT NULL,
    date date NOT NULL,
    moment character varying(50) NOT NULL,
    recipe_id integer,
    note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT meal_plan_moment_check CHECK (((moment)::text = ANY ((ARRAY['petit_dejeuner'::character varying, 'dejeuner'::character varying, 'diner'::character varying, 'collation'::character varying])::text[])))
);


ALTER TABLE public.meal_plan OWNER TO cooking_user;

--
-- Name: TABLE meal_plan; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON TABLE public.meal_plan IS 'Plan des repas : associe une recette à une date et un moment de la journée';


--
-- Name: COLUMN meal_plan.date; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.meal_plan.date IS 'Date du repas';


--
-- Name: COLUMN meal_plan.moment; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.meal_plan.moment IS 'Moment de la journée : petit_dejeuner, dejeuner, diner, collation';


--
-- Name: COLUMN meal_plan.recipe_id; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.meal_plan.recipe_id IS 'NULL si pas de recette (ex: resto, leftovers)';


--
-- Name: COLUMN meal_plan.note; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.meal_plan.note IS 'Notes libres (ex: invités, leftovers, etc.)';


--
-- Name: meal_plan_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.meal_plan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.meal_plan_id_seq OWNER TO cooking_user;

--
-- Name: meal_plan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.meal_plan_id_seq OWNED BY public.meal_plan.id;


--
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.recipe_ingredients (
    id integer NOT NULL,
    recipe_id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantite character varying(100),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recipe_ingredients OWNER TO cooking_user;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.recipe_ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipe_ingredients_id_seq OWNER TO cooking_user;

--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.recipe_ingredients_id_seq OWNED BY public.recipe_ingredients.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    titre character varying(255) NOT NULL,
    description text NOT NULL,
    temps_preparation integer,
    image_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_favorite boolean DEFAULT false
);


ALTER TABLE public.recipes OWNER TO cooking_user;

--
-- Name: TABLE recipes; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON TABLE public.recipes IS 'Stocke les recettes avec leurs informations de base';


--
-- Name: COLUMN recipes.description; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.recipes.description IS 'Texte libre avec ingrédients + étapes (peut être en markdown)';


--
-- Name: COLUMN recipes.temps_preparation; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.recipes.temps_preparation IS 'Temps en minutes';


--
-- Name: COLUMN recipes.image_url; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.recipes.image_url IS 'URL de l''image (optionnel)';


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recipes_id_seq OWNER TO cooking_user;

--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: shopping_items; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.shopping_items (
    id integer NOT NULL,
    nom character varying(255) NOT NULL,
    quantite character varying(100),
    coche boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.shopping_items OWNER TO cooking_user;

--
-- Name: TABLE shopping_items; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON TABLE public.shopping_items IS 'Liste de courses très simple';


--
-- Name: COLUMN shopping_items.nom; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.shopping_items.nom IS 'Nom de l''ingrédient (ex: "tomates", "pâtes")';


--
-- Name: COLUMN shopping_items.quantite; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.shopping_items.quantite IS 'Quantité en texte libre (ex: "3", "500 g", "1 kg")';


--
-- Name: COLUMN shopping_items.coche; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.shopping_items.coche IS 'Acheté ou non';


--
-- Name: shopping_items_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.shopping_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shopping_items_id_seq OWNER TO cooking_user;

--
-- Name: shopping_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.shopping_items_id_seq OWNED BY public.shopping_items.id;


--
-- Name: stock; Type: TABLE; Schema: public; Owner: cooking_user
--

CREATE TABLE public.stock (
    id integer NOT NULL,
    ingredient_id integer NOT NULL,
    quantite character varying(100),
    date_ajout timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    date_peremption date,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock OWNER TO cooking_user;

--
-- Name: TABLE stock; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON TABLE public.stock IS 'Stock des ingrédients disponibles dans les placards';


--
-- Name: COLUMN stock.ingredient_id; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.stock.ingredient_id IS 'Référence à l''ingrédient';


--
-- Name: COLUMN stock.quantite; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.stock.quantite IS 'Quantité disponible (ex: 500g, 1L, 3 pièces)';


--
-- Name: COLUMN stock.date_ajout; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.stock.date_ajout IS 'Date d''ajout au stock';


--
-- Name: COLUMN stock.date_peremption; Type: COMMENT; Schema: public; Owner: cooking_user
--

COMMENT ON COLUMN public.stock.date_peremption IS 'Date de péremption (optionnel)';


--
-- Name: stock_id_seq; Type: SEQUENCE; Schema: public; Owner: cooking_user
--

CREATE SEQUENCE public.stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_id_seq OWNER TO cooking_user;

--
-- Name: stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cooking_user
--

ALTER SEQUENCE public.stock_id_seq OWNED BY public.stock.id;


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: meal_plan id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.meal_plan ALTER COLUMN id SET DEFAULT nextval('public.meal_plan_id_seq'::regclass);


--
-- Name: recipe_ingredients id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipe_ingredients ALTER COLUMN id SET DEFAULT nextval('public.recipe_ingredients_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: shopping_items id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.shopping_items ALTER COLUMN id SET DEFAULT nextval('public.shopping_items_id_seq'::regclass);


--
-- Name: stock id; Type: DEFAULT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.stock ALTER COLUMN id SET DEFAULT nextval('public.stock_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
5a13ee1d-fe0b-4464-b195-0d05f2f827c3	e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855	2026-01-02 22:45:00.023817+00	0_init		\N	2026-01-02 22:45:00.023817+00	0
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.ingredients (id, nom, created_at, updated_at, categorie) FROM stdin;
1	Lardons	2026-01-11 17:10:55.921	2026-01-25 16:11:18.344	PROTEINES
7	Chorizo	2026-01-25 15:19:16.645	2026-01-25 16:11:37.201	PROTEINES
6	Crème fraîche	2026-01-25 15:10:12.199	2026-01-25 16:11:58.222	PRODUITS_LAITIERS
9	Oignons	2026-01-25 15:27:04.407	2026-01-25 16:12:08.338	LEGUMES
8	Poivrons	2026-01-25 15:25:30.433	2026-01-25 16:12:18.298	LEGUMES
10	Pâtes	2026-01-25 15:50:28.763	2026-01-25 16:20:21.409	FECULENTS
\.


--
-- Data for Name: meal_plan; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.meal_plan (id, date, moment, recipe_id, note, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.recipe_ingredients (id, recipe_id, ingredient_id, quantite, created_at) FROM stdin;
8	3	1	200g	2026-01-25 20:58:57.672
9	3	6	50cl	2026-01-25 20:58:57.672
10	3	9	1 pièce	2026-01-25 20:58:57.672
11	3	10	500g	2026-01-25 20:58:57.672
12	5	7	2	2026-01-26 17:19:57.401
13	5	6	50	2026-01-26 17:19:57.401
14	5	8	1	2026-01-26 17:19:57.401
15	5	10	500	2026-01-26 17:19:57.401
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.recipes (id, titre, description, temps_preparation, image_url, created_at, updated_at, is_favorite) FROM stdin;
5	Pâtes Chorizo	y	20	\N	2026-01-26 17:19:57.198	2026-01-26 17:19:57.198	f
3	Pâtes Carbonara	Étape 1\r\n\r\nCuire les pâtes dans un grand volume d'eau bouillante salée.\r\n\r\nÉtape 2\r\n\r\nEmincer les oignons et les faire revenir à la poêle. Dès qu'ils ont bien dorés, y ajouter les lardons.\r\n\r\nÉtape 3\r\n\r\nPréparer dans un saladier la crème fraîche, le sel, le poivre et mélanger.\r\n\r\nÉtape 4\r\n\r\nRetirer les lardons du feu dès qu'ils sont dorés et les ajouter à la crème.\r\n\r\nÉtape 5\r\n\r\nUne fois les pâtes cuite al dente, les égoutter et y incorporer la crème. Remettre sur le feu si le plat a refroidi.\r\n\r\nÉtape 6\r\nServir et bon appétit ! Vous pouvez également agrémenter votre plat avec des champignons.	20	\N	2026-01-25 20:04:31.598	2026-01-25 20:58:57.643234	f
\.


--
-- Data for Name: shopping_items; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.shopping_items (id, nom, quantite, coche, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: cooking_user
--

COPY public.stock (id, ingredient_id, quantite, date_ajout, date_peremption, created_at, updated_at) FROM stdin;
\.


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 10, true);


--
-- Name: meal_plan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.meal_plan_id_seq', 34, true);


--
-- Name: recipe_ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.recipe_ingredients_id_seq', 15, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.recipes_id_seq', 5, true);


--
-- Name: shopping_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.shopping_items_id_seq', 114, true);


--
-- Name: stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cooking_user
--

SELECT pg_catalog.setval('public.stock_id_seq', 8, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: meal_plan meal_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.meal_plan
    ADD CONSTRAINT meal_plan_pkey PRIMARY KEY (id);


--
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: shopping_items shopping_items_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.shopping_items
    ADD CONSTRAINT shopping_items_pkey PRIMARY KEY (id);


--
-- Name: stock stock_pkey; Type: CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pkey PRIMARY KEY (id);


--
-- Name: idx_ingredients_categorie; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_ingredients_categorie ON public.ingredients USING btree (categorie);


--
-- Name: idx_ingredients_nom; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_ingredients_nom ON public.ingredients USING btree (nom);


--
-- Name: idx_meal_plan_date; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_meal_plan_date ON public.meal_plan USING btree (date);


--
-- Name: idx_meal_plan_date_moment; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_meal_plan_date_moment ON public.meal_plan USING btree (date, moment);


--
-- Name: idx_meal_plan_recipe_id; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_meal_plan_recipe_id ON public.meal_plan USING btree (recipe_id);


--
-- Name: idx_recipe_ingredient_ingredient; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_recipe_ingredient_ingredient ON public.recipe_ingredients USING btree (ingredient_id);


--
-- Name: idx_recipe_ingredient_recipe; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_recipe_ingredient_recipe ON public.recipe_ingredients USING btree (recipe_id);


--
-- Name: idx_recipes_created_at; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_recipes_created_at ON public.recipes USING btree (created_at);


--
-- Name: idx_recipes_is_favorite; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_recipes_is_favorite ON public.recipes USING btree (is_favorite);


--
-- Name: idx_recipes_titre; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_recipes_titre ON public.recipes USING btree (titre);


--
-- Name: idx_shopping_items_coche; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_shopping_items_coche ON public.shopping_items USING btree (coche);


--
-- Name: idx_shopping_items_nom; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_shopping_items_nom ON public.shopping_items USING btree (nom);


--
-- Name: idx_stock_ingredient; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE INDEX idx_stock_ingredient ON public.stock USING btree (ingredient_id);


--
-- Name: uq_recipe_ingredient; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE UNIQUE INDEX uq_recipe_ingredient ON public.recipe_ingredients USING btree (recipe_id, ingredient_id);


--
-- Name: uq_stock_ingredient; Type: INDEX; Schema: public; Owner: cooking_user
--

CREATE UNIQUE INDEX uq_stock_ingredient ON public.stock USING btree (ingredient_id);


--
-- Name: meal_plan update_meal_plan_updated_at; Type: TRIGGER; Schema: public; Owner: cooking_user
--

CREATE TRIGGER update_meal_plan_updated_at BEFORE UPDATE ON public.meal_plan FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: recipes update_recipes_updated_at; Type: TRIGGER; Schema: public; Owner: cooking_user
--

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: shopping_items update_shopping_items_updated_at; Type: TRIGGER; Schema: public; Owner: cooking_user
--

CREATE TRIGGER update_shopping_items_updated_at BEFORE UPDATE ON public.shopping_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meal_plan meal_plan_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.meal_plan
    ADD CONSTRAINT meal_plan_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- Name: recipe_ingredients recipe_ingredients_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: recipe_ingredients recipe_ingredients_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: stock stock_ingredient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cooking_user
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES public.ingredients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict IgQB2ue7wofo0MZ7gbPMXTffnDC9DFGaDkE7wos0Q7gqIJijpw0gh9SDIycxBu6

