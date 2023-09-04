import { Range, TextEditor, InputBox, TextEditorDecorationType, window, OverviewRulerLane, commands, Selection, workspace, ThemeColor, Disposable } from "vscode"

const SET_CONTEXT = "setContext"
const IS_ACTIVE_CONTEXT = 'quickFind.isActive'
const FIND_LIMIT = 20000

interface MatchItem {
  value: string
  range: Range
}

interface QuickFindConfig {
  ignoreCase: boolean
  smartCase: boolean
}

export class QuickFind {
  index: number = 0
  editor?: TextEditor
  matches: MatchItem[] = []
  inputBox?: InputBox
  matchDecorationType!: TextEditorDecorationType
  activeMatchDecorationType!: TextEditorDecorationType
  config!: QuickFindConfig
  configSubscription: Disposable

  constructor() {
    this.configSubscription = workspace.onDidChangeConfiguration(() => {
      this.loadConfig()
    })

    this.loadConfig()
    this.reset()
  }

  private loadConfig() {
    const config = workspace.getConfiguration("quickFind")
    this.config = {
      ignoreCase: config.get("ignoreCase") || false,
      smartCase: config.get("smartCase") || true,
    }

    const findMatchBackground = new ThemeColor("editor.findMatchBackground")
    const findMatchBorder = new ThemeColor("editor.findMatchBorder")
    const findMatchHighlightBackground = new ThemeColor("editor.findMatchHighlightBackground")

    this.matchDecorationType?.dispose()
    this.matchDecorationType = window.createTextEditorDecorationType({
      backgroundColor: findMatchHighlightBackground,
      overviewRulerLane: OverviewRulerLane.Full,
      overviewRulerColor: findMatchHighlightBackground
    })

    this.activeMatchDecorationType?.dispose()
    this.activeMatchDecorationType = window.createTextEditorDecorationType({
      backgroundColor: findMatchBackground,
      border: `2px solid ${findMatchBorder}`,
    })
  }

  hide(cursorPosition: 'left' | 'right' | undefined = undefined) {
    this.inputBox?.dispose()

    if (this.editor && cursorPosition) {
      const pos = cursorPosition === 'left' ? this.editor.selections[0].start : this.editor.selections[0].end
      this.editor.selections = [new Selection(pos, pos)]
    }
  }

  onHide() {
    commands.executeCommand(SET_CONTEXT, IS_ACTIVE_CONTEXT, false)
    this.reset()
  }

  dispose() {
    this.inputBox?.dispose()
    this.matchDecorationType?.dispose()
    this.activeMatchDecorationType?.dispose()
    this.configSubscription?.dispose()
  }

  reset() {
    this.index = 0
    this.matches = []
    this.editor?.setDecorations(this.matchDecorationType, [])
    this.editor?.setDecorations(this.activeMatchDecorationType, [])
  }

  private setMatches(matches: MatchItem[]) {
    this.matches = matches

    // set decorations
    const ranges = matches.map((match) => match.range)
    this.editor?.setDecorations(this.matchDecorationType, ranges)

    if (!matches.length) {
      this.setIndex(0)
      return
    }

    // setIndex after cursor position
    const activeRange = this.editor?.selections[0]
    const index = activeRange ? matches.findIndex((match) => match.range.start.isAfterOrEqual(activeRange.start)) : 0
    this.setIndex(index)
  }

  private setIndex(value: number) {
    if (!this.inputBox) return

    this.index = (value + this.matches.length) % this.matches.length
    this.update()
  }

  goTop() { this.matches.length && this.setIndex(0) }
  goBottom() { this.matches.length && this.setIndex(-1) }
  next() { this.matches.length && this.setIndex(this.index + 1) }
  prev() { this.matches.length && this.setIndex(this.index - 1) }

  update() {
    if (!this.inputBox || !this.editor) return

    if (this.matches.length === 0) {
      this.editor?.setDecorations(this.activeMatchDecorationType, [])
      this.inputBox.prompt = this.inputBox.value ? 'No results' : ''
      return
    }

    const current = this.matches[this.index]
    const limitSuffix = this.matches.length >= FIND_LIMIT ? '+' : ''
    this.inputBox.prompt = this.index + 1 + ' of ' + this.matches.length + limitSuffix

    const selection = new Selection(current.range.start, current.range.end)
    this.setSelections([selection])

    this.editor?.setDecorations(this.activeMatchDecorationType, [current.range])
  }

  quickFind() {
    const editor = window.activeTextEditor
    if (!editor) return

    this.editor = editor
    this.inputBox = this.createInputBox()
    this.inputBox.show()
    commands.executeCommand(SET_CONTEXT, IS_ACTIVE_CONTEXT, true)
  }

  private createInputBox(): InputBox {
    const inputBox = window.createInputBox()

    inputBox.placeholder = 'Quick Find'
    inputBox.onDidChangeValue((input) => {
      const matches = input ? this.find(input) : []
      this.setMatches(matches)
    })

    inputBox.onDidAccept(() => {
      inputBox.hide()
    })

    inputBox.onDidHide(() => {
      this.onHide()
    })
    return inputBox
  }

  find(text: string): MatchItem[] {
    if (!this.editor) return []

    const caseSensitive = (this.config.smartCase && /[A-Z]/.test(text)) || !this.config.ignoreCase

    const regex = new RegExp(text, caseSensitive ? 'g' : 'gi')
    const documentText = this.editor.document.getText()

    const matches: MatchItem[] = []
    let i = 0

    while (++i <= FIND_LIMIT) {
      const match = regex.exec(documentText)
      if (!match) break

      const value = match[0]
      const range = new Range(
        this.editor.document.positionAt(match.index),
        this.editor.document.positionAt(match.index + value.length)
      )

      matches.push({
        value,
        range
      })

    }

    return matches
  }

  private setSelections(selections: readonly Selection[]) {
    if (!this.editor) return
    this.editor.selections = selections
    this.editor.revealRange(this.editor.selections[0])
  }

}
