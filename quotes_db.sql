--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: author; Type: TABLE; Schema: public; Owner: aspen
--

CREATE TABLE author (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE author OWNER TO aspen;

--
-- Name: Authors_id_seq; Type: SEQUENCE; Schema: public; Owner: aspen
--

CREATE SEQUENCE "Authors_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Authors_id_seq" OWNER TO aspen;

--
-- Name: Authors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aspen
--

ALTER SEQUENCE "Authors_id_seq" OWNED BY author.id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: aspen
--

CREATE TABLE category (
    id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE category OWNER TO aspen;

--
-- Name: Categories_id_seq; Type: SEQUENCE; Schema: public; Owner: aspen
--

CREATE SEQUENCE "Categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Categories_id_seq" OWNER TO aspen;

--
-- Name: Categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aspen
--

ALTER SEQUENCE "Categories_id_seq" OWNED BY category.id;


--
-- Name: quotecategory; Type: TABLE; Schema: public; Owner: aspen
--

CREATE TABLE quotecategory (
    id integer NOT NULL,
    quote_id integer,
    category_id integer
);


ALTER TABLE quotecategory OWNER TO aspen;

--
-- Name: QuoteCategories_id_seq; Type: SEQUENCE; Schema: public; Owner: aspen
--

CREATE SEQUENCE "QuoteCategories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "QuoteCategories_id_seq" OWNER TO aspen;

--
-- Name: QuoteCategories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aspen
--

ALTER SEQUENCE "QuoteCategories_id_seq" OWNED BY quotecategory.id;


--
-- Name: quote; Type: TABLE; Schema: public; Owner: aspen
--

CREATE TABLE quote (
    id integer NOT NULL,
    text text NOT NULL,
    author_id integer
);


ALTER TABLE quote OWNER TO aspen;

--
-- Name: Quotes_id_seq; Type: SEQUENCE; Schema: public; Owner: aspen
--

CREATE SEQUENCE "Quotes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "Quotes_id_seq" OWNER TO aspen;

--
-- Name: Quotes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: aspen
--

ALTER SEQUENCE "Quotes_id_seq" OWNED BY quote.id;


--
-- Name: author id; Type: DEFAULT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY author ALTER COLUMN id SET DEFAULT nextval('"Authors_id_seq"'::regclass);


--
-- Name: category id; Type: DEFAULT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY category ALTER COLUMN id SET DEFAULT nextval('"Categories_id_seq"'::regclass);


--
-- Name: quote id; Type: DEFAULT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quote ALTER COLUMN id SET DEFAULT nextval('"Quotes_id_seq"'::regclass);


--
-- Name: quotecategory id; Type: DEFAULT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quotecategory ALTER COLUMN id SET DEFAULT nextval('"QuoteCategories_id_seq"'::regclass);


--
-- Name: Authors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aspen
--

SELECT pg_catalog.setval('"Authors_id_seq"', 57, true);


--
-- Name: Categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aspen
--

SELECT pg_catalog.setval('"Categories_id_seq"', 35, true);


--
-- Name: QuoteCategories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aspen
--

SELECT pg_catalog.setval('"QuoteCategories_id_seq"', 334, true);


--
-- Name: Quotes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: aspen
--

SELECT pg_catalog.setval('"Quotes_id_seq"', 100, true);


--
-- Data for Name: author; Type: TABLE DATA; Schema: public; Owner: aspen
--

COPY author (id, name) FROM stdin;
1	J.R.R. Tolkien
20	Suzy Kassem
21	Unknown
22	Bruce Lee
23	Albert Camus
24	Frank Herbert
25	Ayn Rand
26	Albert Einstein
27	Ray Bradbury
28	Orson Scott Card
29	Kurt Vonnegut
30	Gregory Benford
31	Robert Heinlein
32	Philip K. Dick
33	H.G. Wells
34	Isaac Asimov
35	Jules Verne
36	Dr. Seuss
37	Oscar Wilde
38	Martin Luther King, Jr.
39	John Green
40	William Shakespeare
41	Mark Twain
42	Neil Gaiman
43	Elie Wiesel
44	Haruki Murakami
45	George Bernard Shaw
46	Douglas Adams
47	Alfred Tennyson
48	Paul Bailey
49	Lao Tzu
50	Amelia Earhart
51	Earl Nightingale
52	Alice Walker
53	Zig Ziglar
54	Anais Nin
55	Anne Frank
56	Confucius
57	Maya Angelou
\.


--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: aspen
--

COPY category (id, name) FROM stdin;
1	motivation
2	sci fi
3	literature
4	love
5	work
6	learning
7	education
8	politics
9	philosophy
10	zen
11	technology
12	perseverance
13	hardship
14	movies
15	nsfw
16	happiness
17	friendship
18	humor
19	science
20	attitude
21	failure
29	advice
30	courage
31	tolerance
32	future
33	discipline
34	optimism
35	kindness
\.


--
-- Data for Name: quote; Type: TABLE DATA; Schema: public; Owner: aspen
--

COPY quote (id, text, author_id) FROM stdin;
35	And though in all lands love is now mingled with grief, it grows perhaps the greater.	1
36	Not all those who wander are lost.	1
37	From the ashes a fire shall be woken, A light from the shadows shall spring.	1
38	Seldom give unguarded advice, for advice is a dangerous gift, even from the wise to the wise, and all courses may run ill.	1
39	A man that flies from fear may find that he has only taken a short cut to meet it.	1
40	Deeds will not be less valiant because they are unpraised.	1
41	Many that live deserve death. And some that die deserve life. Can you give it to them? Then do not be too eager to deal out death in judgement.	1
42	It is not our part to master all the tides of the world, but to do what is in us for the succor of those years wherein we are set, uprooting the evil in the fields that we know, so that those who live after may have clean earth to till. What weather they shall have is not ours to rule.	1
43	Faithless is he that says farewell when the road darkens.	1
44	If more of us valued food and cheer and song above hoarded gold, it would be a merrier world.	1
45	When life hands you shit, turn it into fertilizer.	21
46	In the midst of winter, I found there was, within me, an invincible summer.\r\n	23
47	The choices you make today can improve all your tomorrows.	21
48	Seek freedom and become captive of your desires. Seek discipline and find your liberty.	24
49	The question isn't who is going to let me. It's who is going to stop me.	25
50	Don't let your struggle become your identity.	21
51	If you can't explain it to a six-year-old, you don't understand it yourself.	26
52	You can't have a million-dollar dream with a minimum-wage work ethic.	21
53	You don't have to become a monster to face one.	21
54	What would you do if you weren't afraid?	21
55	You don't have to burn books to destroy a culture. Just get people to stop reading.	27
56	There are times when the world is rearranging itself, and at times like that, the right words can change the world.	28
57	We are what we pretend to be, so we must be careful about what we pretend to be.	29
58	Under capitalism, man exploits man. Under communism, it is the reverse.	30
59	Women and cats will do as they please, and men and dogs should relax and get used to the idea.	31
60	If you think this universe is bad, you should see some of the others.	32
61	Absolute power does not corrupt absolutely, absolute power attracts the corruptible.	24
62	Looking at these stars suddenly dwarfed my own troubles and all the gravities of terrestrial life.	33
63	Violence is the last refuge of the incompetent.	34
64	Science, my lad, is made up of mistakes, but they are mistakes which it is useful to make, because they lead little by little to the truth.	35
65	You know you're in love when you can't fall asleep because reality is finally better than your dreams.	36
66	Always forgive your enemies; nothing annoys them so much.	37
67	Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.	38
68	As he read, I fell in love the way you fall asleep: slowly, and then all at once.	39
69	The fool doth think he is wise, but the wise man knows himself to be a fool.	40
70	Whenever you find yourself on the side of the majority, it is time to pause and reflect.	41
71	Fairy tales are more than true: not because they tell us that dragons exist, but because they tell us that dragons can be beaten.	42
72	The man who does not read has no advantage over the man who cannot read.	41
73	There may be times when we are powerless to prevent injustice, but there must never be a time when we fail to protest.	43
74	Love all, trust a few, do wrong to none.	40
75	My thoughts are stars I cannot fathom into constellations.	39
76	If you only read the books that everyone else is reading, you can only think what everyone else is thinking.	44
77	Life isn't about finding yourself. Life is about creating yourself.	45
78	In the beginning the Universe was created. This has made a lot of people very angry and been widely regarded as a bad move.	46
79	If I had a flower for every time I thought of you, I could walk through my garden forever.	47
80	Do something today that your future self will thank you for.	21
1	I do not love the bright sword for its sharpness, nor the arrow for its swiftness, nor the warrior for his glory. I love only that which they defend.	1
81	In programming, it's often okay to be wrong as long as you're consistent.	48
82	The supreme good is like water, which nourishes all things without trying, and is content with the low places that people disdain.	49
83	A river cuts through rock, not because of its power, but because of its persistence.	21
84	Don't watch the clock. Do what it does: Keep going.	21
85	A smooth sea never made a skilled sailor.	21
86	You didn't come this far to only come this far.	21
87	Expect problems and eat them for breakfast.	21
88	Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.	21
31	Doubt kills more dreams than failure ever will.	20
33	Some people develop a wishbone where their backbone should be.	21
34	I don't fear the man who has practiced 10,000 different kicks. I fear the man who has practiced one kick 10,000 times.	22
89	Living in the past is depression. Living in the future is anxiety. Living in the present is peace.	21
90	The most difficult thing is the decision to act, the rest is merely tenacity.	50
91	We become what we think about.	51
92	The most common way people give up their power is by thinking they don’t have any.	52
93	The most important day in your life is always today.	21
94	People often say that motivation doesn’t last. Well, neither does bathing.  That’s why we recommend it daily.	53
95	Life shrinks or expands in proportion to one's courage.	54
96	Never be afraid to say, 'I don't know.'	21
97	How wonderful it is that nobody need wait a single moment before starting to improve the world.	55
98	If the wind will not serve, take to the oars.	21
99	It does not matter how slowly you go as long as you do not stop.	56
100	You can’t use up creativity.  The more you use, the more you have.	57
\.


--
-- Data for Name: quotecategory; Type: TABLE DATA; Schema: public; Owner: aspen
--

COPY quotecategory (id, quote_id, category_id) FROM stdin;
1	1	3
2	1	9
3	1	4
12	33	20
13	33	18
14	33	12
15	33	5
16	34	20
17	34	7
18	34	6
19	34	12
20	34	5
21	35	13
22	35	3
23	35	4
24	36	3
25	36	9
26	37	21
27	37	3
28	37	12
29	38	3
30	38	29
31	39	29
32	39	6
33	39	30
34	40	20
35	40	3
36	40	5
37	41	29
38	41	3
39	41	9
40	41	31
41	42	29
42	42	3
43	42	9
44	42	32
45	43	29
46	43	20
47	43	30
48	43	17
49	43	3
50	43	13
51	43	12
52	44	29
53	44	20
54	44	3
55	45	29
56	45	20
57	45	21
58	45	13
59	45	16
60	45	6
61	45	1
62	45	15
63	45	9
64	45	5
65	45	12
66	46	20
67	46	30
68	46	13
69	46	3
70	46	12
71	46	1
72	47	29
73	47	7
74	47	32
75	47	6
76	47	1
77	47	12
78	47	5
79	47	33
80	48	29
81	48	20
82	48	16
83	48	33
84	48	1
85	48	3
86	48	5
87	48	2
88	48	10
89	49	29
90	49	20
91	49	30
92	49	1
93	49	16
94	49	5
95	50	29
96	50	20
97	50	13
98	50	12
99	50	34
100	51	7
101	51	18
102	51	6
103	51	19
104	52	29
105	52	20
106	52	33
107	52	18
108	52	1
109	52	12
110	52	5
111	53	29
112	53	20
113	53	30
114	53	34
115	53	35
116	54	29
117	54	20
118	54	30
119	54	1
120	55	7
121	55	6
122	55	3
123	56	7
124	56	3
125	56	2
126	57	29
127	57	20
128	57	3
129	57	1
130	57	9
131	58	18
132	58	8
133	58	2
134	59	29
135	59	20
136	59	18
137	59	2
138	59	31
139	60	18
140	60	2
141	61	3
142	61	9
143	61	2
144	62	20
145	62	2
146	62	19
147	63	3
148	63	2
149	64	20
150	64	7
151	64	6
153	64	19
152	64	2
154	65	4
155	66	29
156	66	18
157	66	31
158	67	29
159	67	35
160	67	4
161	67	34
162	67	31
163	68	3
164	68	4
165	69	7
166	69	6
167	69	3
168	70	29
169	70	6
170	70	8
171	70	31
172	71	3
173	71	34
174	72	29
175	72	33
176	72	7
177	72	6
178	72	3
179	73	29
180	73	20
181	73	30
182	73	34
183	73	12
184	73	8
185	73	31
186	74	29
187	74	20
188	74	16
189	74	3
190	74	4
191	74	35
192	74	31
193	75	3
194	76	29
195	76	7
196	76	6
197	76	3
198	77	29
199	77	20
200	77	32
201	77	6
202	77	1
203	78	18
204	78	3
205	78	2
206	79	3
207	79	4
208	80	29
209	80	33
210	80	16
211	80	32
212	80	1
213	80	12
214	80	5
215	81	1
216	81	1
217	82	20
218	82	9
219	82	10
220	83	29
221	83	20
222	83	33
223	83	1
224	83	13
225	83	34
226	83	12
227	83	5
228	84	29
229	84	20
230	84	33
231	84	32
232	84	12
233	84	1
234	84	5
235	85	29
236	85	20
237	85	30
238	85	13
239	85	6
240	85	1
241	85	34
242	85	12
243	85	5
244	86	29
245	86	20
246	86	33
247	86	32
248	86	13
249	86	1
250	86	12
251	86	5
252	87	29
253	87	20
254	87	30
255	87	32
256	87	33
257	87	21
258	87	16
259	87	13
260	87	1
261	87	6
262	87	34
263	87	12
264	87	5
265	88	9
266	88	10
267	89	29
268	89	20
269	89	16
270	89	34
271	89	10
272	90	29
273	90	30
274	90	32
275	90	1
276	91	29
277	91	20
278	91	7
279	91	32
280	91	34
281	91	6
282	91	9
283	92	29
284	92	20
285	92	30
286	92	1
287	92	34
288	92	5
289	92	12
290	93	29
291	93	1
292	93	5
293	94	29
294	94	20
295	94	1
296	94	12
297	95	29
299	95	12
300	95	30
298	95	20
301	95	1
302	95	5
303	96	29
304	96	20
305	96	30
306	96	7
307	96	6
308	97	20
309	97	32
310	97	35
311	97	1
312	97	34
313	98	29
314	98	20
315	98	33
316	98	13
317	98	1
318	98	12
319	98	5
320	99	29
321	99	20
322	99	33
323	99	32
324	99	13
325	99	6
326	99	12
327	99	1
328	99	5
329	100	29
330	100	20
331	100	7
332	100	6
333	100	3
334	100	1
\.


--
-- Name: author Authors_pkey; Type: CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY author
    ADD CONSTRAINT "Authors_pkey" PRIMARY KEY (id);


--
-- Name: category Categories_pkey; Type: CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY category
    ADD CONSTRAINT "Categories_pkey" PRIMARY KEY (id);


--
-- Name: quotecategory QuoteCategories_pkey; Type: CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quotecategory
    ADD CONSTRAINT "QuoteCategories_pkey" PRIMARY KEY (id);


--
-- Name: quote Quotes_pkey; Type: CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quote
    ADD CONSTRAINT "Quotes_pkey" PRIMARY KEY (id);


--
-- Name: quotecategory QuoteCategories_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quotecategory
    ADD CONSTRAINT "QuoteCategories_category_id_fkey" FOREIGN KEY (category_id) REFERENCES category(id);


--
-- Name: quotecategory QuoteCategories_quote_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quotecategory
    ADD CONSTRAINT "QuoteCategories_quote_id_fkey" FOREIGN KEY (quote_id) REFERENCES quote(id);


--
-- Name: quote Quotes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: aspen
--

ALTER TABLE ONLY quote
    ADD CONSTRAINT "Quotes_author_id_fkey" FOREIGN KEY (author_id) REFERENCES author(id);


--
-- PostgreSQL database dump complete
--

