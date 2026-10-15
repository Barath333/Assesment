import React, { useEffect, useRef } from "react";
import CatSprite from "./CatSprite";
import { useStore } from "../store";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function PreviewArea() {
  const { sprites, scripts, runtimeScripts, updateSprite, activeSpriteId, setActiveSprite, addSprite, isRunning, setIsRunning, stopAndReset, initRuntimeScripts, swapRuntimeScripts } = useStore();
  const collisionLocks = useRef(new Set());
  const currentRunId = useRef(0);
  const activeThreads = useRef(0);
  const threadStatus = useRef({}); // Tracks whether a sprite's thread is currently alive

  // Background Collision Monitor
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      const currentSprites = useStore.getState().sprites;
      for (let i = 0; i < currentSprites.length; i++) {
        for (let j = i + 1; j < currentSprites.length; j++) {
          const s1 = currentSprites[i];
          const s2 = currentSprites[j];
          
          const isColliding = Math.abs(s1.x - s2.x) < 80 && Math.abs(s1.y - s2.y) < 80;
          const pairKey = `${s1.id}-${s2.id}`;

          if (isColliding && !collisionLocks.current.has(pairKey)) {
            swapRuntimeScripts(s1.id, s2.id);
            collisionLocks.current.add(pairKey);

            // Revive dead threads if they receive a new script mid-collision
            if (!threadStatus.current[s1.id]) {
              activeThreads.current += 1;
              executeScript(s1.id, currentRunId.current);
            }
            if (!threadStatus.current[s2.id]) {
              activeThreads.current += 1;
              executeScript(s2.id, currentRunId.current);
            }
          } else if (!isColliding) {
            collisionLocks.current.delete(pairKey);
          }
        }
      }
    }, 50);
    return () => clearInterval(interval);
  }, [isRunning, swapRuntimeScripts]);

  const executeScript = async (spriteId, runId) => {
    threadStatus.current[spriteId] = true; // Mark thread as active

    // Always read the *current* runtime script, because a collision can swap it at any moment
    const getLiveScript = () =>
      (useStore.getState().runtimeScripts[spriteId] || []).filter(b => !b.type.includes("EVENT"));

    while (true) {
      if (runId !== currentRunId.current || !useStore.getState().isRunning) break;
      
      if (getLiveScript().length === 0) break;

      // FIX: the loop bound is re-read every step (it used to be a stale copy of the script)
      for (let i = 0; i < getLiveScript().length; i++) {
        if (runId !== currentRunId.current || !useStore.getState().isRunning) return; 
        
        const block = getLiveScript()[i];
        if (!block) continue;

        let pauseDuration = 300; 
        const currentState = useStore.getState().sprites.find(s => s.id === spriteId);
        let { x, y, rotation } = currentState;

        const steps = block.params?.steps !== undefined ? Number(block.params.steps) : 10;
        const degrees = block.params?.degrees !== undefined ? Number(block.params.degrees) : 15;
        const seconds = block.params?.seconds !== undefined ? Number(block.params.seconds) : 2;
        const text = block.params?.text || (block.type === "SAY_MESSAGE" ? "Hello!" : "Hmm...");

        switch (block.type) {
          case "MOVE_STEPS":
            x += steps * Math.cos(rotation * Math.PI / 180);
            y += steps * Math.sin(rotation * Math.PI / 180);
            break;
          case "TURN_LEFT":
            rotation -= degrees;
            break;
          case "TURN_RIGHT":
            rotation += degrees;
            break;
          case "GOTO_XY":
            x = block.params?.x !== undefined ? Number(block.params.x) : 50;
            y = block.params?.y !== undefined ? Number(block.params.y) : 50;
            break;
          case "SAY_MESSAGE":
            updateSprite(spriteId, { message: text, messageType: "SAY" });
            pauseDuration = seconds * 1000; 
            break;
          case "THINK_MESSAGE":
            updateSprite(spriteId, { message: text, messageType: "THINK" });
            pauseDuration = seconds * 1000;
            break;
          case "REPEAT":
            i = -1;
            pauseDuration = 100;
            break;
          default: break;
        }

        // Clamp to stage limits (assuming ~1/3 width layout)
        x = Math.max(0, Math.min(x, 320));
        y = Math.max(0, Math.min(y, 500));
        
        updateSprite(spriteId, { x, y, rotation });
        
        await sleep(pauseDuration);
        if (runId !== currentRunId.current) return;
        if (block.type.includes("MESSAGE")) updateSprite(spriteId, { message: null, messageType: null });
      }
      
      // FIX: decide whether to loop using the *live* (possibly swapped) script
      if (!getLiveScript().some(b => b.type === "REPEAT")) break;
    }

    threadStatus.current[spriteId] = false; // Mark thread as dead
    activeThreads.current -= 1;
    if (activeThreads.current <= 0) {
      useStore.getState().setIsRunning(false);
    }
  };

  const handlePlay = () => {
    if (isRunning) return;
      stopAndReset();
    setIsRunning(true);
    initRuntimeScripts();
    collisionLocks.current.clear();
    
    currentRunId.current += 1;
    const runId = currentRunId.current;
    
    activeThreads.current = sprites.length;
    sprites.forEach(sprite => {
      executeScript(sprite.id, runId);
    });
  };

  const handleStop = () => {
    currentRunId.current += 1; 
    activeThreads.current = 0;
    stopAndReset();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <div className="flex-1 overflow-hidden relative border-b border-gray-200">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
         {!isRunning ? (
  <button onClick={handlePlay} className="px-4 py-2 bg-green-500 text-white rounded font-bold hover:bg-green-600">▶ Play</button>
) : (
  <button onClick={handleStop} className="px-4 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600">🛑 Stop</button>
)}
        </div>
        <div className="relative w-full h-full mt-16 ml-8">
          {sprites.map((sprite) => <CatSprite key={sprite.id} spriteState={sprite} />)}
        </div>
      </div>

      <div className="h-32 bg-gray-50 p-4 flex gap-4 overflow-x-auto items-center">
        {/* Add button is disabled mid-run */}
        <button 
          onClick={addSprite} 
          disabled={isRunning}
          className={`h-20 w-20 border-2 border-dashed border-blue-400 text-blue-500 rounded-xl flex flex-col items-center justify-center shrink-0 transition-opacity ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50'}`}
        >
          <span className="text-2xl font-bold">+</span>
        </button>
        
        {sprites.map((sprite) => (
          <div key={sprite.id} onClick={() => setActiveSprite(sprite.id)} className={`h-20 w-20 bg-white rounded-xl shadow-sm border-2 flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all ${activeSpriteId === sprite.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}>
            <div className="origin-center -mt-4 transform" style={{ transform: 'scale(0.4)' }}>
              <CatSprite spriteState={{...sprite, x: 0, y: 0, rotation: 0, message: null}} />
            </div>
            <span className="text-xs font-semibold mt-2">{sprite.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}