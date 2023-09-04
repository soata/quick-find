# VSCode extension: Quick-Find And Jump

Quickly find and jump through matches in your code, similar to the default Find feature, without the need to press Escape to exit.
Easily navigate between next and previous matches for efficient code exploration.

![DEMO](https://raw.githubusercontent.com/soata/quick-find/master/demo/demo.gif)

## Installation

You can install the extension from the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items/soata.quick-find).

## Usage


Call `quickFind.find` command via Command Palette or shortcut. (default `Cmd+[BracketLeft]`)

- `Cmd` : `Ctrl` on Windows.
- `[BracketLeft]`: `[` on US Keyboard, `@` on JIS.


| Description                | Default Shortcut   | Command                  |
| -------------------------- | ------------------ | ------------------------ |
| Show QuickFind             | Cmd+[BracketLeft]  | `quickFind.find`         |
| Hide QuickFind             | Esc / Enter        | `quickFind.hide`         |
| Hide And Move Left         | Left               | `quickFind.hideAndLeft`  |
| Hide And Move Right        | Right              | `quickFind.hideAndRight` |
| Jump to the next match     | Down / Cmd+n / Tab | `quickFind.next`         |
| Jump to the previous match | Up / Cmd+Shift+n   | `quickFind.prev`         |
| Jump to the top match      | Cmd+Shift+Up       | `quickFind.goTop`        |
| Jump to the bottom match   | Cmd+Shift+Down     | `quickFind.goBottom`     |


**Note:** If you want to prevent exiting when pressing the Left or Right arrow keys, you can unbind the corresponding shortcuts.


## Configurations

| Configuration          | Description              | Default |
| ---------------------- | ------------------------ | ------- |
| `quickFind.ignoreCase` | Whether to ignore case   | false   |
| `quickFind.smartCase`  | Whether to use smartcase | true    |



## Decorations 

This extension uses the following theme colors:

- `editor.findMatchBackground`
- `editor.findMatchBorder`
- `editor.findMatchHighlightBackground`
