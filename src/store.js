import { create } from 'zustand';

// Helper function to calculate grid positions for sprites
const getStartPos = (index) => ({
  x: (index % 2) * 200,                  // Alternates between X: 0 and X: 200
  y: 50 + Math.floor(index / 2) * 100    // Pushes Y down by 100px every 2 sprites
});

const initialSprites = [
  { id: 'sprite-1', ...getStartPos(0), rotation: 0, active: true, message: null, messageType: null } 
];

export const useStore = create((set) => ({
  sprites: initialSprites,
  activeSpriteId: 'sprite-1',
  scripts: { 'sprite-1': [] },
  runtimeScripts: {}, // Holds the execution copy for swapping mid-play without destroying authored code
  isRunning: false,

  setIsRunning: (running) => set({ isRunning: running }),
  setActiveSprite: (id) => set({ activeSpriteId: id }),
  
  // Proper spacing for unlimited sprites using the grid helper
  addSprite: () => set((state) => {
    const newId = `sprite-${state.sprites.length + 1}`;
    const pos = getStartPos(state.sprites.length);
    return {
      sprites: [...state.sprites, { id: newId, ...pos, rotation: 0, active: true, message: null, messageType: null }],
      activeSpriteId: newId,
      scripts: { ...state.scripts, [newId]: [] }
    };
  }),

  // Init runtime scripts on Play so authored code is safely duplicated, not modified
  initRuntimeScripts: () => set((state) => ({ 
    runtimeScripts: { ...state.scripts } 
  })),

  // True Script Swap on Runtime Copies for the Hero Feature
  swapRuntimeScripts: (id1, id2) => set((state) => {
    const temp = state.runtimeScripts[id1] || [];
    return {
      runtimeScripts: {
        ...state.runtimeScripts,
        [id1]: state.runtimeScripts[id2] || [],
        [id2]: temp
      }
    };
  }),

  // Resets physics back to start and kills the runtime environment
  stopAndReset: () => set((state) => ({
    isRunning: false,
    runtimeScripts: {}, 
    sprites: state.sprites.map((s, index) => ({
      ...s,
      ...getStartPos(index),
      rotation: 0,
      message: null,
      messageType: null
    }))
  })),

  // Drag and drop mechanics
  addBlockToScript: (spriteId, block) => set((state) => ({
    scripts: {
      ...state.scripts,
      [spriteId]: [...(state.scripts[spriteId] || []), { ...block, params: block.params || {} }]
    }
  })),

  // Insert a block at a given position (dropping a palette block into the middle of a script)
  insertBlockAt: (spriteId, block, index) => set((state) => {
    const list = [...(state.scripts[spriteId] || [])];
    const at = Math.max(0, Math.min(index, list.length));
    list.splice(at, 0, { ...block, params: block.params || {} });
    return { scripts: { ...state.scripts, [spriteId]: list } };
  }),

  updateBlockParam: (spriteId, blockId, param, value) => set((state) => ({
    scripts: {
      ...state.scripts,
      [spriteId]: state.scripts[spriteId].map(b => 
        b.id === blockId ? { ...b, params: { ...b.params, [param]: value } } : b
      )
    }
  })),

  removeBlock: (spriteId, blockId) => set((state) => ({
    scripts: {
      ...state.scripts,
      [spriteId]: state.scripts[spriteId].filter(b => b.id !== blockId)
    }
  })),

  reorderScript: (spriteId, oldIndex, newIndex) => set((state) => {
    const script = [...(state.scripts[spriteId] || [])];
    const [movedBlock] = script.splice(oldIndex, 1);
    script.splice(newIndex, 0, movedBlock);
    return { scripts: { ...state.scripts, [spriteId]: script } };
  }),

  // Physics updates
  updateSprite: (spriteId, updates) => set((state) => ({
    sprites: state.sprites.map(sprite => 
      sprite.id === spriteId ? { ...sprite, ...updates } : sprite
    )
  }))
}));