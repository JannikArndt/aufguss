# Botanical names this repository corrected

`latinFixed: true` in `src/data/`. Twenty-five of them. Read before adding one.

## Why there is such a thing at all

[`CLAUDE.md`](../CLAUDE.md) §9 says not to reconcile the suppliers' botanical
names with each other or with what you believe to be correct, and that still
holds for every judgement call: where two shops name two different species that
are both plausibly the oil in the bottle, the disagreement stands and Daten
prüfen lists it.

This file is for the other case — where a value is not a judgement call but an
error anybody can check. RBM filed its *Cedernholz chinesisch* under *Boswellia
carteri*, which is frankincense and not a cedar of any kind, and its
*Pfefferminze amerikanisch* under *Pycnanthemum pilosum*, which is mountain
mint and a different genus from peppermint. Leaving those in place was not
honesty, it was a broken search and a wrong grouping.

So: a value is corrected only when it is **wrong on its face** — a different
plant entirely, or a misspelling of the name the shop clearly meant. The
corrected entry carries `latinFixed: true`, the oil's page prints *(korrigiert)*
next to it, and the row below says what was there and why it changed. A
correction is never silent.

The owner asked for this on 11 September 2026, in those words: *"Yes, the
supplier is wrong. Fix the data based on your knowledge."*

## The corrections

### Wrong plant

| id | was | is | why |
|---|---|---|---|
| `rbm:Cedernholz-chinesisch` | *Boswellia carteri* | *Cupressus funebris* | Boswellia is frankincense. Chinese cedarwood oil is the weeping cypress. |
| `rbm:Cedernholz-Virginia` | *Cedrus atlantica* | *Juniperus virginiana* | Virginian cedarwood is a juniper, not a true cedar. |
| `rbm:Cedernholz-amerikanisch` | *Cedrus atlantica* | *Juniperus virginiana* | Same juniper, sold under the other name. |
| `rbm:Pfefferminze-amerikanisch` | *Pycnanthemum pilosum* | *Mentha × piperita* | Pycnanthemum is mountain mint, a different genus. |
| `rbm:Nelke` | *Dianthus* | *Syzygium aromaticum* | *Dianthus* is the carnation flower. Nelkenöl is clove. |
| `rbm:Kamille-blau` | *Anthemis nobilis* | *Matricaria chamomilla* | Blue chamomile is the German one; *Anthemis nobilis* is the Roman one, which RBM files separately and correctly. |
| `rbm:Citronella-Java` | *Cymbopogon nardus* | *Cymbopogon winterianus* | Java citronella is *winterianus*; *nardus* is the Ceylon type. |
| `rbm:Latschenkiefer-Tirol` | *Pinus montana* | *Pinus mugo* | *P. montana* is a superseded synonym. |
| `rbm:Lavandin-super` | *Lavandula hybrid* | *Lavandula × intermedia* | Lavandin is that named hybrid. |
| `rbm:Zimtblatter` | *Cinnamomum zeylancium* | *Cinnamomum verum* | Misspelt *zeylanicum*, which is a synonym of *verum*. |

### Misspelling or an incomplete name

| id | was | is |
|---|---|---|
| `rbm:Wacholderbeere` | *Uniperus communis* | *Juniperus communis* |
| `rbm:Sternanis` | *Illicum verum* | *Illicium verum* |
| `rbm:Edeltannennadel` | *Albies alba* | *Abies alba* |
| `rbm:Kiefernnadel` | *Pinus sylvestri* | *Pinus sylvestris* |
| `rbm:Rosmarin` | *Rosmarin officinalis* | *Salvia rosmarinus* |
| `rbm:Vetiver` | *Vetiveria zizanoides* | *Chrysopogon zizanioides* |
| `rbm:Niaouli` | *Melaleuka viridiflora gaertner* | *Melaleuca viridiflora* |
| `rbm:Cassia-chinesisch` | *cinnamomum aromaticum nees* | *Cinnamomum aromaticum* |
| `rbm:Palmarosa-ostindisch` | *Cymbopogon martini* | *Cymbopogon martinii* |
| `rbm:Cedernholz-Himalaya` | *Cedrus Deodara* | *Cedrus deodara* |
| `rbm:Amyris` | *Amyris Balsamifera* | *Amyris balsamifera* |

### The mints, spelled one way

The three mint species were written four ways between the two shops, which made
three plants look like six. The species are unchanged; only the spelling is.

| id | was | is |
|---|---|---|
| Aromen's two Pfefferminzen | *Mentha ×piperita* | *Mentha × piperita* |
| `rbm:Pfefferminze-indisch` | *Mentha piperita* | *Mentha × piperita* |
| `rbm:Minze-japanisch` | *Mentha canadensis* | *Mentha arvensis* |

*Mentha canadensis* and *Mentha arvensis* are treated as one species in the
trade and by most floras; the oils are sold interchangeably as cornmint. Filed
under *arvensis* because that is what the other four bottles of the same plant
say. See [`names.md`](names.md).

## What was left alone

- **Cajeput.** Aromen says *Melaleuca cajuputi*, RBM says *M. leucadendra*.
  Both names are in commercial use for cajeput oil. A judgement call, so the
  disagreement stands.
- **Melisse indicum.** RBM files it under *Cymbopogon winterianus*, which is
  citronella and not melissa — but "Melissenöl indicum" is itself a trade name
  for a citronella-type oil sold as a melissa substitute, so RBM may be
  describing exactly what is in the bottle. Left as it is, and listed in Daten
  prüfen.
- **A genus with no species.** Aromen's *Thuja*, *Monarda*, *Tilia* and
  *Cymbopogon*, and RBM's *Eucalyptus* and *Juniperus*, name a genus and stop.
  That is incomplete, not wrong, and filling in a species would be picking one.
