# Omacal

Omacal is a drop-in replacement for the default Omarchy clock that adds a mini calendar. The calendar supports keyboard controls (including vim bindings) for browsing month and year.

![Omacal screenshot](images/omacal.png)

## Install

```bash
omarchy plugin add https://github.com/brianblakely/omacal.git
```

Accept the prompt to enable Omacal, then move it to the center section:

```bash
omarchy bar plugin move b.omacal --section center
```

To replace the default clock, remove it (you can always add it back later, if you want):

```bash
omarchy bar plugin remove omarchy.clock
```

Then set `"centerAnchor": "b.omacal"` in the `bar` object in `~/.config/omarchy/shell.json`.

## Usage

Click the clock to toggle the calendar. Right-click it to open Omarchy's timezone menu.

Inside the calendar:

* Use the arrow keys or `HJKL` to browse months and years.
* Press `Enter` to return to today.
* Press `Escape` to close the calendar.

## Configuration

Configure each Omacal setting from the command line.

Start calendar weeks on Monday:

```bash
omarchy-shell b.omacal mondayFirst true
```

The default is `false`, which uses the locale's first day of the week. Replace `true` with `false` to restore it.

Set the calendar title format:

```bash
omarchy-shell b.omacal titleFormat "d MMMM 'W'ww yyyy"
```

The default is `d MMMM 'W'ww yyyy`. Formats use [Qt date/time tokens](https://chatgpt.com/share/6a66735e-2c80-83ea-892a-a6a823337217). You can replace this with the current time if you like to keep the Omarchy bar hidden:

```bash
omarchy-shell b.omacal titleFormat "d MMMM 'W'ww yyyy"
```

Set the clock format for horizontal bars:

```bash
omarchy-shell b.omacal hFormat "dddd HH:mm"
```

The default is `dddd HH:mm`.

Set the clock format for vertical bars:

```bash
omarchy-shell b.omacal vFormat $'HH\n—\nmm'
```

The default is three rows containing the hour, an em dash, and the minute. The `$'…'` quoting passes each `\n` as a newline.

Set how many milliseconds the `flash` command keeps the calendar open:

```bash
omarchy-shell b.omacal flashDuration 2000
```

The default is `2000`; the supported range is `1000` to `60000`.

## Shortcuts

```lua
hl.unbind("SUPER + CTRL + ALT + T")
o.bind("SUPER + CTRL + ALT + T", "Flash mini calendar", "omarchy-shell b.omacal flash")
o.bind("SUPER + F9", "Toggle mini calendar", "omarchy-shell shell toggle b.omacal")
o.bind("SUPER + ALT + F9", "Open mini calendar", "omarchy-shell shell summon b.omacal")
o.bind("SUPER + CTRL + F9", "Close mini calendar", "omarchy-shell shell hide b.omacal")
```

## Update

```bash
omarchy plugin update b.omacal
```
