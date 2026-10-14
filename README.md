# Werewolf game

A single-page moderator board for running an in-person game of
[Werewolf](https://en.wikipedia.org/wiki/Mafia_(party_game)) (also known as
Mafia). The moderator keeps track of who is playing, what role each player
has, who has died, and any status effects in play. You can do it all from a
laptop or a phone.

**▶ Play it now: <https://feaxr.github.io/Werewolf-game/>**

There is no server, account, or build step. It is one HTML file and one
stylesheet.

## Features

- **Player list**: add as many players as you need, each with a name, a
  role, an alive/dead toggle, and any number of status effects.
- **Live summary**: the header counts players, living players, and dead
  players. Below the toolbar, a tally shows how many of each role are still
  alive (for example `Werewolf × 2`).
- **Custom roles and status effects**: add or remove them in the *Roles* and
  *Status effects* panels at the bottom of the page. If you remove one, it is
  also cleared from every player who had it.
- **Autosave**: every change is saved in your browser, so refreshing or
  closing the tab doesn't lose the game.
- **Share links**: *Copy share link* copies a URL that contains the whole
  game. Open it on another device to pick up where you left off.
- **Hide roles**: blurs every role (and the role tally) so players looking
  over your shoulder can't see them. Hover over a player, or focus their
  role dropdown, to see that player's role.
- **New round**: keeps everyone's name but clears roles, deaths, and
  effects, so the same group can play again.
- **Undo**: removing a player, role, or effect, or starting a new round,
  shows a message with an *Undo* button for a few seconds.
- **Keyboard friendly**: press <kbd>Enter</kbd> in a name field to move to the
  next player. On the last player, it adds a new player.
- **Responsive, light and dark**: on narrow screens each player becomes a
  card. The page follows your system's light or dark setting.

## Getting started

### Use the hosted version

The board is published with GitHub Pages at
<https://feaxr.github.io/Werewolf-game/>. Open it on whichever device you're
moderating from. Nothing needs to be installed.

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

1. Add a player for each person at the table and type in their names.
2. Open **Roles** and set the role list for this game. Defaults are provided.
3. Give each player a role. Turn on **Hide roles** if people can see your
   screen.
4. As the game goes on, tap **Alive** to mark a player as dead, and toggle
   status effect chips (such as *Has Vacuum*) as they come up.
5. Keep an eye on the role tally to see which teams are still in the game.
6. When the game ends, press **New round** to deal again with the same
   players.

### Default roles and effects

| Roles | Status effects |
| --- | --- |
| Werewolf, Villager, Seer, Bodyguard, Chupakabra, Vacuum salesman | Has Vacuum |

You can change both lists in the page itself. To change the defaults for
every new game, edit `DEFAULT_ROLES` and `DEFAULT_EFFECTS` near the top of the
script in `index.html`.

## How data is stored

- The current game is saved in your browser's `localStorage` under the key
  `werewolf-game`. The *Hide roles* setting is saved under `werewolf-prefs`.
  Nothing is sent anywhere.
- A share link holds the game as JSON in a `?game=` parameter. When you open
  it, the game loads, is saved locally, and the parameter is removed from the
  address bar, so refreshing the page won't undo later changes.
- Links saved by the earlier version of the page (with `playerData`,
  `roleData`, and `statusData` parameters) still load.

> **Note:** a share link contains every role. Only send it to people who are
> allowed to know them.

## Project structure

```
index.html   Page markup and all game logic (plain JavaScript, no dependencies)
style.css    Theme, layout, and responsive styles
LICENSE      MIT license
```

The script keeps the whole game in one `state` object
(`{ roles, effects, players }`) and redraws the page from it after each
change. Name fields are the exception: they update `state` as you type and
don't redraw, so the text cursor stays where it is.

## Contributing

Issues and pull requests are welcome. Please keep the project dependency-free
so it can still run by opening `index.html` directly.

## License

[MIT](LICENSE) © 2025 FeaXR
