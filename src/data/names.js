/* The other names a plant answers to.

   A shop prints one name on a bottle. A person standing in front of the shelf
   has a different one in their head — Spearmint, Grüne Minze, Mentha spicata
   and Krauseminze are one plant, and typing any of them should find it. So
   this is a search index and nothing else: none of it is a fact about how an
   oil smells, none of it ever appears as a claim, and the name on the bottle
   is still whatever `de` says in src/data/.

   Where it comes from is different from everything else in src/data/, and that
   is worth saying plainly. The suppliers publish none of it. These are the
   plant's common names in German and English plus its botanical synonyms,
   supplied by this repository from general knowledge, at the owner's explicit
   request and for search only. sources/names.md says so and says how to check
   one. That is a lower bar than §1 sets for anything about a scent, and it is
   deliberately confined to this file: a wrong synonym costs a search hit; a
   wrong note costs an Aufguss.

   Keyed by the `plant` slug in the data files. A plant with nothing to add
   simply is not here.

   The three mints are why this file exists. They are three different species
   sold under a dozen names between them, and the split between them is the
   botanical name, not the word on the label:

     Mentha × piperita   Pfefferminze
     Mentha spicata      Krauseminze, Grüne Minze, Spearmint
     Mentha arvensis     the plain "Minze" both shops sell, cornmint

   Nothing here merges them. Each keeps its own names. */

export const PLANT_NAMES = {
  /* ── the mints ──────────────────────────────────────────────────────── */
  pfefferminze: ['Pfefferminze', 'Peppermint', 'Mentha × piperita', 'Mentha piperita',
    'Menthe poivrée', 'Edelminze'],
  krauseminze: ['Krauseminze', 'Krause Minze', 'Grüne Minze', 'Speer-Minze', 'Speerminze',
    'Ährige Minze', 'Spearmint', 'Green mint', 'Garden mint', 'Common mint',
    'Lamb mint', 'Mackerel mint', 'Mentha spicata', 'Mentha viridis'],
  minze: ['Minze', 'Ackerminze', 'Feldminze', 'Japanische Minze', 'Japanminze',
    'Cornmint', 'Corn mint', 'Field mint', 'Japanese mint', 'Wild mint',
    'Mentha arvensis', 'Mentha canadensis'],
  bergamottminze: ['Bergamottminze', 'Bergamotte-Minze', 'Zitronenminze', 'Bergamot mint',
    'Eau de cologne mint', 'Lemon mint', 'Mentha citrata', 'Mentha aquatica var. citrata'],

  /* ── the ones two shops spell differently, or an English name finds ─── */
  zedernholz: ['Zedernholz', 'Zederholz', 'Cedernholz', 'Cederholz', 'Zeder', 'Cedar',
    'Cedarwood', 'Cedernholzöl'],
  zitrone: ['Zitrone', 'Lemon', 'Zitronenöl', 'Limone', 'Citrus limon'],
  limette: ['Limette', 'Lime', 'Limone', 'Citrus aurantifolia'],
  orange: ['Orange', 'Apfelsine', 'Sweet orange', 'Bitterorange', 'Bitter orange',
    'Pomeranze', 'Citrus sinensis', 'Citrus aurantium'],
  blutorange: ['Blutorange', 'Blood orange', 'Sanguinello'],
  mandarine: ['Mandarine', 'Mandarin', 'Tangerine', 'Citrus reticulata'],
  grapefruit: ['Grapefruit', 'Pampelmuse', 'Citrus paradisi'],
  bergamotte: ['Bergamotte', 'Bergamot', 'Citrus bergamia'],
  eukalyptus: ['Eukalyptus', 'Eucalyptus', 'Blaugummibaum', 'Fieberbaum'],
  kiefer: ['Kiefer', 'Kiefernnadel', 'Föhre', 'Waldkiefer', 'Pine', 'Pine needle',
    'Scots pine', 'Pinus sylvestris'],
  latschenkiefer: ['Latschenkiefer', 'Latsche', 'Bergkiefer', 'Krummholzkiefer',
    'Dwarf pine', 'Mountain pine', 'Pinus mugo'],
  zirbelkiefer: ['Zirbelkiefer', 'Zirbe', 'Arve', 'Zirbelkiefernöl', 'Swiss stone pine',
    'Arolla pine', 'Pinus cembra'],
  fichte: ['Fichte', 'Fichtennadel', 'Rottanne', 'Spruce', 'Norway spruce', 'Picea abies'],
  edeltanne: ['Edeltanne', 'Edeltannennadel', 'Weißtanne', 'Silbertanne', 'Silver fir',
    'Abies alba'],
  wacholder: ['Wacholder', 'Wacholderbeere', 'Wacholderholz', 'Machandel', 'Kranewitt',
    'Juniper', 'Juniper berry', 'Juniperus communis'],
  zypresse: ['Zypresse', 'Cypresse', 'Cypress', 'Cupressus sempervirens'],
  teebaum: ['Teebaum', 'Tea tree', 'Melaleuca', 'Melaleuca alternifolia'],
  lavendel: ['Lavendel', 'Lavender', 'Echter Lavendel', 'Lavandula angustifolia'],
  lavandin: ['Lavandin', 'Lavandula × intermedia', 'Lavandula hybrida'],
  rosmarin: ['Rosmarin', 'Rosemary', 'Rosmarinus officinalis', 'Salvia rosmarinus'],
  salbei: ['Salbei', 'Sage', 'Echter Salbei', 'Salvia officinalis'],
  thymian: ['Thymian', 'Thyme', 'Thymus vulgaris'],
  basilikum: ['Basilikum', 'Basil', 'Basilienkraut', 'Ocimum basilicum'],
  'heiliger-basilikum': ['Heiliger Basilikum', 'Heiliges Basilikum', 'Tulsi', 'Holy basil',
    'Indisches Basilikum', 'Ocimum tenuiflorum', 'Ocimum sanctum'],
  fenchel: ['Fenchel', 'Fennel', 'Foeniculum vulgare'],
  ingwer: ['Ingwer', 'Ginger', 'Zingiber officinale'],
  kampfer: ['Kampfer', 'Campher', 'Kampher', 'Camphor', 'Camphora', 'Kampferbaum',
    'Cinnamomum camphora'],
  nelke: ['Nelke', 'Gewürznelke', 'Nelkenblüte', 'Nelkenknospe', 'Clove', 'Clove bud',
    'Syzygium aromaticum', 'Eugenia caryophyllata'],
  zimt: ['Zimt', 'Cinnamon', 'Zimtrinde', 'Zimtblätter', 'Cassia', 'Cinnamomum verum',
    'Cinnamomum zeylanicum'],
  cassia: ['Cassia', 'Zimtcassia', 'Chinesischer Zimt', 'Cassia cinnamon',
    'Cinnamomum aromaticum', 'Cinnamomum cassia'],
  sternanis: ['Sternanis', 'Steranis', 'Star anise', 'Badian', 'Illicium verum'],
  patchouli: ['Patchouli', 'Patchuli', 'Patschuli', 'Pogostemon cablin'],
  vetiver: ['Vetiver', 'Vetivergras', 'Khus', 'Chrysopogon zizanioides',
    'Vetiveria zizanioides'],
  lemongras: ['Lemongras', 'Lemongrass', 'Zitronengras', 'Zitronegras', 'Citronella',
    'Cymbopogon citratus', 'Cymbopogon flexuosus'],
  citronella: ['Citronella', 'Citronellgras', 'Citronella grass', 'Cymbopogon winterianus',
    'Cymbopogon nardus'],
  palmarosa: ['Palmarosa', 'Rosengras', 'Indisches Geraniumöl', 'Cymbopogon martinii'],
  melisse: ['Melisse', 'Zitronenmelisse', 'Melissa', 'Lemon balm', 'Melissa officinalis'],
  geranie: ['Geranie', 'Geranium', 'Rosengeranie', 'Pelargonie', 'Pelargonium graveolens'],
  kamille: ['Kamille', 'Chamomile', 'Camomile', 'Echte Kamille', 'Römische Kamille',
    'Blaue Kamille', 'Matricaria chamomilla', 'Chamaemelum nobile', 'Anthemis nobilis'],
  weihrauch: ['Weihrauch', 'Olibanum', 'Frankincense', 'Boswellia'],
  litsea: ['Litsea', 'Litsea cubeba', 'Litsea Cubea', 'May Chang', 'Bergpfeffer'],
  rosenholz: ['Rosenholz', 'Rosewood', 'Bois de rose', 'Aniba rosaeodora'],
  pfeffer: ['Pfeffer', 'Schwarzer Pfeffer', 'Black pepper', 'Piper nigrum'],
  kardamom: ['Kardamom', 'Cardamom', 'Kardamome', 'Elettaria cardamomum'],
  kurkuma: ['Kurkuma', 'Curcuma', 'Gelbwurz', 'Turmeric', 'Curcuma longa'],
  dill: ['Dill', 'Dillkraut', 'Gurkenkraut', 'Anethum graveolens'],
  petitgrain: ['Petitgrain', 'Petit grain', 'Blätteröl'],
  jasmin: ['Jasmin', 'Jasmine', 'Jasminum grandiflorum'],
  'ylang-ylang': ['Ylang Ylang', 'Ylang-Ylang', 'Cananga', 'Cananga odorata'],
  niaouli: ['Niaouli', 'Melaleuca viridiflora', 'Melaleuca quinquenervia'],
  amyris: ['Amyris', 'Westindisches Sandelholz', 'Amyris balsamifera'],
  thuja: ['Thuja', 'Lebensbaum', 'Zeder', 'White cedar', 'Thuja occidentalis'],
  lorbeerblatt: ['Lorbeerblatt', 'Lorbeer', 'Bay laurel', 'Laurus nobilis'],
  hinoki: ['Hinoki', 'Japanische Zypresse', 'Hinoki cypress', 'Chamaecyparis obtusa'],
  tangerine: ['Tangerine', 'Mandarine', 'Citrus tangerina'],
  wintergruen: ['Wintergrün', 'Wintergreen', 'Gaultheria procumbens'],
  elemi: ['Elemi', 'Manila-Elemi', 'Canarium luzonicum'],
  cajeput: ['Cajeput', 'Cajeputbaum', 'Weißer Teebaum', 'Melaleuca cajuputi',
    'Melaleuca leucadendra'],
};
