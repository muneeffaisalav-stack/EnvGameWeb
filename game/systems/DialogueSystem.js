export class DialogueSystem {
  constructor(overlayEl) {
    this._overlay = overlayEl
    this._open = false
    this._onChoice = null
    this._currentLine = null
  }

  isOpen() { return this._open }

  open(dialogue, onChoice) {
    this._open = true
    this._onChoice = onChoice
    this._render(dialogue.name, dialogue.lines[0])
  }

  close() {
    this._open = false
    this._onChoice = null
    this._currentLine = null
    this._overlay.innerHTML = ''
    this._overlay.style.display = 'none'
  }

  selectChoice(index) {
    if (!this._currentLine) return
    const choice = this._currentLine.choices[index]
    if (!choice) return
    const cb = this._onChoice
    this.close()
    cb?.(choice)
  }

  _render(npcName, line) {
    this._currentLine = line
    this._overlay.style.display = 'flex'
    this._overlay.innerHTML = `
      <div style="
        background:#1a1a2e; border:2px solid #eee; padding:24px 32px;
        max-width:600px; width:90%; font-family:'Courier New',monospace;
      ">
        <div style="font-size:18px;font-weight:bold;margin-bottom:12px;color:#f0c040;">
          ${npcName}
        </div>
        <div style="font-size:15px;margin-bottom:20px;color:#eee;line-height:1.5;">
          ${line.text}
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${line.choices.map((c, i) =>
            `<button class="btn" data-index="${i}">${c.label}</button>`
          ).join('')}
        </div>
      </div>
    `
    this._overlay.querySelectorAll('button[data-index]').forEach(btn => {
      btn.addEventListener('click', () => this.selectChoice(Number(btn.dataset.index)))
    })
  }
}
