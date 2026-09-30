import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DialogueSystem } from '../../game/systems/DialogueSystem.js'

const DIALOGUE = {
  npcId: 'shopkeeper',
  name: 'Shopkeeper',
  lines: [{
    text: 'Welcome! What can I get you?',
    choices: [
      { label: 'Buy Tea', action: 'completeMission', missionId: 'buyTea' },
      { label: 'Goodbye', action: 'closeDialogue' },
    ],
  }],
}

function makeOverlay() {
  const el = document.createElement('div')
  el.id = 'dialogue-overlay'
  document.body.appendChild(el)
  return el
}

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('DialogueSystem', () => {
  it('is closed initially', () => {
    const ds = new DialogueSystem(makeOverlay())
    expect(ds.isOpen()).toBe(false)
  })

  it('open sets isOpen to true', () => {
    const ds = new DialogueSystem(makeOverlay())
    ds.open(DIALOGUE, vi.fn())
    expect(ds.isOpen()).toBe(true)
  })

  it('renders NPC name in overlay', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(overlay.textContent).toContain('Shopkeeper')
  })

  it('renders dialogue text in overlay', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(overlay.textContent).toContain('Welcome! What can I get you?')
  })

  it('renders two choice buttons', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    const btns = overlay.querySelectorAll('button')
    expect(btns.length).toBe(2)
    expect(btns[0].textContent).toBe('Buy Tea')
    expect(btns[1].textContent).toBe('Goodbye')
  })

  it('selectChoice calls onChoice with the choice object', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    const onChoice = vi.fn()
    ds.open(DIALOGUE, onChoice)
    ds.selectChoice(0)
    expect(onChoice).toHaveBeenCalledWith({ label: 'Buy Tea', action: 'completeMission', missionId: 'buyTea' })
  })

  it('close sets isOpen to false', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    ds.close()
    expect(ds.isOpen()).toBe(false)
  })

  it('close clears overlay content', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    ds.close()
    expect(overlay.innerHTML).toBe('')
  })

  it('selectChoice with closeDialogue action does not throw', () => {
    const overlay = makeOverlay()
    const ds = new DialogueSystem(overlay)
    ds.open(DIALOGUE, vi.fn())
    expect(() => ds.selectChoice(1)).not.toThrow()
  })
})
