import { create } from 'zustand';

export const useStore = create((set) => ({
  sprites: [
    { id: 'sprite-1', x: 0, y: 0, rotation: 0, active: true, message: null, messageType: null } 
  ],
  activeSpriteId: 'sprite-1',
  scripts: {
    'sprite-1': [] 
  },

  setActiveSprite: (id) => set({ activeSpriteId: id }),
  
  // Adds a new sprite to the playground
  addSprite: () => set((state) => {
    const newId = `sprite-${state.sprites.length + 1}`;
    // Offset new sprites slightly so they don't stack perfectly on top of each other
    const startX = state.sprites.length * 50; 
    return {
      sprites: [...state.sprites, { id: newId, x: startX, y: 0, rotation: 0, active: true, message: null, messageType: null }],
      activeSpriteId: newId,
      scripts: { ...state.scripts, [newId]: [] }
    };
  }),

  // Swaps the script arrays of two colliding sprites (The Hero Feature)
  swapScripts: (id1, id2) => set((state) => {
    const newScripts = { ...state.scripts };
    const temp = newScripts[id1];
    newScripts[id1] = newScripts[id2];
    newScripts[id2] = temp;
    return { scripts: newScripts };
  }),

  addBlockToScript: (spriteId, block) => set((state) => ({
    scripts: {
      ...state.scripts,
      [spriteId]: [...(state.scripts[spriteId] || []), block]
    }
  })),

  updateSprite: (spriteId, updates) => set((state) => ({
    sprites: state.sprites.map(sprite => 
      sprite.id === spriteId ? { ...sprite, ...updates } : sprite
    )
  }))
}));