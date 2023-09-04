import { ExtensionContext, commands } from 'vscode';
import { QuickFind } from './quickFind';

const quickFind = new QuickFind()

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('quickFind.find', () => quickFind.quickFind()),
    commands.registerCommand('quickFind.next', () => quickFind.next()),
    commands.registerCommand('quickFind.prev', () => quickFind.prev()),
    commands.registerCommand('quickFind.goTop', () => quickFind.goTop()),
    commands.registerCommand('quickFind.goBottom', () => quickFind.goBottom()),
    commands.registerCommand('quickFind.hide', () => quickFind.hide()),
    commands.registerCommand('quickFind.hideAndLeft', () => quickFind.hide('left')),
    commands.registerCommand('quickFind.hideAndRight', () => quickFind.hide('right'))
  )
}

export function deactivate() {
  quickFind.dispose()
}
