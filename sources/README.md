# sources

Everything the app claims about an oil, a theme or a blend was read somewhere,
on a day, at a URL. This folder is that record — one file per thing that was
looked up, with the address, the date, and what was actually found there as
opposed to what was hoped for.

The rule for this repository: **nothing about essential oils is written from
memory.** If a fact is not in one of these files with a URL next to it, it does
not belong in `src/data/`. Where a source is a shop or a sauna blog rather than
a standard — which is most of them, because this is a craft and not a science —
the file says so, and the app says so too.

| file | what it covers |
|---|---|
| [`oils.md`](oils.md) | the 133 single oils from Aromen, their families, notes and descriptions |
| [`oils-rbm.md`](oils-rbm.md) | the 81 single oils from RBM, and how a JavaScript shop was read |
| [`oils-purelia.md`](oils-purelia.md) | the 40 single oils and 7 Ölmischungen from Purelia professional, and the four things that range publishes nothing about |
| [`botanical-names.md`](botanical-names.md) | the Latin names of the Aromen oils, and which ones are a judgement call |
| [`aufgussplan.md`](aufgussplan.md) | the Aufguss themes, times and intensities |
| [`blending.md`](blending.md) | notes, ratios, mixing order, which families go together |
| [`open-questions.md`](open-questions.md) | what could not be settled, and what it would take |

Dates are when the page was fetched. Shops change their range and saunas change
their plan, so a fact here is true of that day and worth re-checking before it
is relied on. `tools/check-sources.mjs` re-fetches the pages and reports what
has moved.
