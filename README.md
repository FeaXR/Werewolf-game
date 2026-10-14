# Werewolf game

A single-page moderator board for running an in-person game of
[Werewolf](https://en.wikipedia.org/wiki/Mafia_(party_game)) (also known as
Mafia). The moderator keeps track of who is playing, what role each player
has, who has died, which status effects are active, and which turn it is.
You can do it all from a laptop or a phone.

**▶ Play it now: <https://feaxr.github.io/Werewolf-game/>**

There is no server, account, build step, or dependency. It's a static page:
one HTML file, one stylesheet, and a few plain JavaScript files.

## Features

- **Player list**: add as many players as you need, each with a name, a
  role, an alive/dead toggle, and any number of status effects.
- **Reorder players**: drag a player's number (⋮⋮ 1) to move them, using a
  mouse or touch. You can also focus the number and press <kbd>↑</kbd> /
  <kbd>↓</kbd>. This makes it easy to match the order people sit around the
  table.
- **Turns and effect durations**: each status effect lasts either **1 turn**
  (the default for new effects) or the **whole game**. **Next turn** moves
  the turn counter forward and removes every one-turn effect from every
  player. Whole-game effects such as *Has Vacuum* stay. One-turn effects have
  a dashed outline.
- **Live summary**: the header shows the current turn and counts players,
  living players, and dead players. Below the toolbar, a tally shows how many
  of each role are still alive (for example `Werewolf × 2`).
- **Custom roles and status effects**: add or remove them in the *Roles* and
  *Status effects* panels at the bottom of the page. To switch an effect
  between one turn and the whole game, click its duration tag (`1 turn` /
  `game`). If you remove a role or effect, it is also cleared from every
  player who had it.
- **Autosave**: every change is saved in your browser, so refreshing or
  closing the tab doesn't lose the game.
- **Share links**: *Copy share link* copies a URL that contains the whole
  game. Open it on another device to pick up where you left off.
- **Hide roles**: blurs every role (and the role tally) so players looking
  over your shoulder can't see them. Hover over a player, or focus their
  role dropdown, to see that player's role.
- **Keep screen on**: stops your phone from dimming or locking mid-game. It
  uses the browser's Screen Wake Lock, and the button only appears in browsers
  that support it. The setting is remembered on that device.
- **New game**: keeps everyone's name but clears roles, deaths, and effects
  and resets the turn counter, so the same group can play again.
- **Undo**: removing a player, role, or effect, advancing the turn, or
  starting a new game shows a message with an *Undo* button for a few
  seconds.
- **Keyboard friendly**: press <kbd>Enter</kbd> in a name field to move to the
  next player. On the last player, it adds a new player.
- **Installable and offline**: add it to your home screen to use it like an
  app. After the first visit it works without a connection (see
  [Install it as an app](#install-it-as-an-app-optional)).
- **Responsive, light and dark**: on narrow screens each player becomes a
  card. The page follows your system's light or dark setting.

## Getting started

### Use the hosted version

The board is published with GitHub Pages at
<https://feaxr.github.io/Werewolf-game/>. Open it on whichever device you're
moderating from. Nothing needs to be installed.

### Install it as an app (optional)

Installing puts an icon on your home screen. The board then opens
full-screen and works without a connection.

- **iPhone / iPad:** open the site in Safari (or Chrome, Edge, or Firefox on
  iOS 16.4+), tap **Share**, then **Add to Home Screen**. iOS doesn't let
  websites prompt for this, so the page shows these steps as a hint
  instead.
- **Android, and Chrome / Edge on desktop:** use the **Install** button in
  the banner at the top of the page, or *Install app* in the browser menu.

On iPhone, the installed app keeps its own saved data, separate from Safari.
To move a game in progress between them, use **Copy share link**.

### Run it locally

Download or clone the repository and open `index.html` in any modern browser:

```bash
git clone https://github.com/FeaXR/Werewolf-game.git
```

### Run a local server (optional)

Some browsers limit storage and clipboard access for pages opened as
`file://`. If autosave or *Copy share link* doesn't work, serve the folder
instead:

```bash
python -m http.server 8123
```

Then visit <http://localhost:8123>.

### Hosting

The [hosted version](https://feaxr.github.io/Werewolf-game/) is deployed by
GitHub Pages from the `main` branch, so changes go live a minute or two
after they're merged. If you fork the repository, enable **Settings → Pages**
on the `main` branch to get your own copy at
`https://<user>.github.io/Werewolf-game/`. Because it's a static site, any
other static host (Netlify, a plain web server, and so on) works too.

## How to run a game

1. Add a player for each person at the table and type in their names. Drag
   them into seating order if that helps you.
2. Open **Roles** and **Status effects** to set the lists for this game.
   Defaults are provided.
3. Give each player a role. Turn on **Hide roles** if people can see your
   screen.
4. During a turn, tap **Alive** to mark a player as dead, and toggle effect
   chips (such as *Protected* or *Has Vacuum*) as they come up.
5. At the end of each turn, press **Next turn**. One-turn effects are cleared
   and whole-game effects stay.
6. Keep an eye on the role tally to see which teams are still in the game.
7. When the game ends, press **New game** to deal again with the same
   players.

### Default roles and effects

| Roles | Status effects |
| --- | --- |
| Werewolf, Villager, Seer, Bodyguard, Chupakabra, Vacuum salesman, Spellcaster | Has Vacuum *(whole game)*, Protected *(1 turn)*, Muted *(1 turn)* |

You can change both lists in the page itself. To change the defaults for
every new game, edit `DEFAULT_ROLES` and `DEFAULT_EFFECTS` at the top of
`js/state.js`. The defaults only apply when there is no saved game.
**New game** keeps your current lists, so to see changed defaults, clear the
site's data or open the page in a private window.

## How data is stored

- The current game is saved in your browser's `localStorage` under the key
  `werewolf-game`. The *Hide roles* setting is saved under `werewolf-prefs`.
  Nothing is sent anywhere.
- A share link holds the game as JSON in a `?game=` parameter. When you open
  it, the game loads, is saved locally, and the parameter is removed from the
  address bar, so refreshing the page won't undo later changes.
- Links from the very first version of the page (with `playerData`,
  `roleData`, and `statusData` parameters) are no longer supported.

> **Note:** a share link contains every role. Only send it to people who are
> allowed to know them.

## Project structure

```
index.html       Page markup; loads the stylesheet and scripts
style.css        Theme, layout, and responsive styles
manifest.webmanifest   App name, icons, and colours used when installed
sw.js            Service worker: offline support (network first, cache as fallback)
icons/           App icons, Apple touch icon, and favicon
js/
  state.js       Defaults, the game state, loading (share link / localStorage) and saving
  ui.js          DOM helpers and the undo toast
  render.js      Draws the summary, tally, player list, and manager lists from state
  players.js     Adding, editing, and removing players; toggling their effects
  reorder.js     Drag-and-drop and arrow-key reordering of players
  toolbar.js     Next turn, New game, Copy share link, Hide roles
  wakelock.js    Keep screen on (Screen Wake Lock)
  install.js     Registers the service worker; shows the install hint
  managers.js    The Roles and Status effects panels
  main.js        Start-up
LICENSE          MIT license
```

### How the code fits together

- The whole game lives in one `state` object:
  `{ turn, roles, effects, players }`. Each effect is `{ name, duration }`,
  where `duration` is `"turn"` or `"game"`. Each player is
  `{ name, role, dead, effects }`, where `effects` holds effect names.
- After every change, `commit()` saves `state` and redraws the page from it.
  Name fields are the exception: they update `state` as you type and don't
  redraw, so the text cursor stays where it is.
- The scripts are plain `<script defer>` files, not ES modules, because
  browsers block modules on pages opened from `file://`. They share global
  variables and run in the order `index.html` lists them, so a new script
  must go after any script it depends on. Keep `main.js` last.
- **When you add a file**, also add it to `FILES` in `sw.js` and increase the
  `CACHE` version (`werewolf-v1` → `werewolf-v2`). Otherwise the new file
  won't be available offline. Edits to existing files don't need this, since
  the service worker always tries the network first.

## Contributing

Issues and pull requests are welcome. Please keep the project dependency-free
and build-free, so it still runs on GitHub Pages and by opening `index.html`
directly.

## License

[MIT](LICENSE) © 2025 FeaXR
