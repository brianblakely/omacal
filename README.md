# Omacal

Omacal is a configurable Omarchy clock with a mini calendar, ISO week number, moon phase, locale-aware week start, and horizontal and vertical display formats.

![Omacal screenshot](images/omacal.png)

## Install

Review the source at [github.com/brianblakely/omacal](https://github.com/brianblakely/omacal), then add the plugin:

```bash
omarchy plugin add https://github.com/brianblakely/omacal.git
```

Accept the prompt to enable Omacal, then move it to the center section:

```bash
omarchy bar plugin move b.omacal --section center
```

To replace the default clock, remove it:

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

Configure each Omacal setting from the command line:

Start calendar weeks on Monday:

```bash
omarchy bar plugin set b.omacal mondayFirstDayofWeek true --json
```

The default is `false`, which uses the locale's first day of the week. Replace `true` with `false` to restore it.

Set the calendar title format:

```bash
omarchy bar plugin set b.omacal titleFormat "d MMMM 'W'ww yyyy"
```

The default is `d MMMM 'W'ww yyyy`. Formats use Qt date/time tokens; `ww` displays the ISO week number.

Set the clock format for horizontal bars:

```bash
omarchy bar plugin set b.omacal horizontalClockFormat "dddd HH:mm"
```

The default is `dddd HH:mm`.

Set the clock format for vertical bars:

```bash
omarchy bar plugin set b.omacal verticalClockFormat '"HH\n—\nmm"' --json
```

The default is three rows containing the hour, an em dash, and the minute. Use `\n` in the JSON string to create rows.

Set how many seconds the `flash` command keeps the calendar open:

```bash
omarchy bar plugin set b.omacal flashDurationSeconds 2 --json
```

The default is `2`; the supported range is `1` to `60`.

## Optional shortcuts

Global keybindings remain user-owned. Add any of these to your Hyprland bindings:

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
