# Connections (Customizable)

A clean, self-contained clone of the New York Times **Connections** puzzle that you can fully customize and host for free on GitHub Pages.

## Features

- Classic 4×4 board with 4 categories of 4 words each
- Select words → Submit
- “One away” feedback
- 4 mistakes allowed
- Solved groups lock in with color (Yellow → Green → Blue → Purple)
- Shuffle & Deselect
- **In-browser puzzle editor** — define your own categories and words
- Puzzle saved in `localStorage` so your custom set persists
- Pure HTML / CSS / vanilla JavaScript — no build step, no dependencies

## Quick start (local)

1. Download or clone this folder.
2. Open `index.html` in any modern browser.

That’s it.

## Define your own puzzle

### Option A — In-app editor (easiest)

1. Open the game.
2. Click **Edit this puzzle** at the bottom.
3. Paste or edit the JSON.
4. Click **Save & Play**.

Example format:

```json
{
  "title": "My Custom Puzzle",
  "groups": [
    {
      "title": "TYPES OF FISH",
      "words": ["BASS", "FLOUNDER", "SALMON", "TROUT"]
    },
    {
      "title": "FIRE ___",
      "words": ["ANT", "DRILL", "HYDRANT", "TRUCK"]
    },
    {
      "title": "THINGS THAT ARE ROUND",
      "words": ["BALL", "CIRCLE", "RING", "WHEEL"]
    },
    {
      "title": "WORDS AFTER \"FIRE\"",
      "words": ["FIGHTER", "FLY", "PLACE", "WORK"]
    }
  ]
}
```

Rules the editor enforces:

- Exactly 4 groups
- Each group has a `title` and exactly 4 `words`
- All 16 words must be unique

### Option B — Edit the source

Open `script.js` and change the `DEFAULT_PUZZLE` object at the top.  
This becomes the default when someone visits with a clear `localStorage`.

## Host on GitHub Pages (free)

1. Create a new GitHub repository (public).
2. Upload the three files:
   - `index.html`
   - `style.css`
   - `script.js`
   (and this `README.md` if you want)
3. Go to the repo **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Select branch `main` (or `master`) and folder `/ (root)`.
6. Click Save.

After a minute your game will be live at:

```
https://YOUR_USERNAME.github.io/REPO_NAME/
```

### Optional: custom domain

In the same Pages settings you can add a custom domain.

## Sharing a specific puzzle

Because the puzzle lives in the browser’s `localStorage`, each visitor gets their own copy.  

If you want everyone to see *your* custom puzzle by default:

1. Edit `DEFAULT_PUZZLE` in `script.js` with your categories/words.
2. Commit and push.
3. Anyone who opens the site (or clears their localStorage) will get your version.

## Tips for making good puzzles

- Put the easiest category first (it becomes yellow) and the trickiest last (purple).
- Avoid overlapping words that could fit multiple categories too cleanly.
- Mix concrete and more abstract connections.
- Test the “one away” cases yourself.

## License

MIT — do whatever you want with it.
