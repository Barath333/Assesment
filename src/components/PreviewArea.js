import React from "react";
import CatSprite from "./CatSprite";
import { useStore } from "../store";

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default function PreviewArea() {
  const { sprites, scripts, updateSprite, activeSpriteId, setActiveSprite, addSprite, swapScripts } = useStore();

const handlePlay = async () => {
    const unrolledScripts = {};
    sprites.forEach(sprite => {
      const s = scripts[sprite.id] || [];
      const hasRepeat = s.some(b => b.type === "REPEAT");
      const executable = s.filter(b => b.type !== "REPEAT");
      unrolledScripts[sprite.id] = hasRepeat ? [...executable, ...executable, ...executable] : executable;
    });

    const maxSteps = Math.max(...Object.values(unrolledScripts).map(s => s.length));
    const swappedPairs = new Set(); 

    console.log("▶️ --- PLAYBACK STARTED ---");

    for (let step = 0; step < maxSteps; step++) {
      let pauseDuration = 300; 
      
      console.log(`\n🎬 Executing Step ${step + 1} of ${maxSteps}`);

      for (const sprite of sprites) {
        const block = unrolledScripts[sprite.id]?.[step];
        if (!block) continue;

        const currentState = useStore.getState().sprites.find(s => s.id === sprite.id);
        let { x, y, rotation } = currentState;

        console.log(`   🏃 ${sprite.id} executing: ${block.type}`);

        switch (block.type) {
          case "MOVE_STEPS":
            const steps = 30; 
            x += steps * Math.cos(rotation * Math.PI / 180);
            y += steps * Math.sin(rotation * Math.PI / 180);
            updateSprite(sprite.id, { x, y });
            break;
          case "TURN_LEFT":
            updateSprite(sprite.id, { rotation: rotation - 15 });
            break;
          case "TURN_RIGHT":
            updateSprite(sprite.id, { rotation: rotation + 15 });
            break;
          case "GOTO_XY":
            updateSprite(sprite.id, { x: 50, y: 50 });
            break;
          case "SAY_MESSAGE":
            updateSprite(sprite.id, { message: "Hello!", messageType: "SAY" });
            pauseDuration = 2000; 
            break;
          case "THINK_MESSAGE":
            updateSprite(sprite.id, { message: "Hmm...", messageType: "THINK" });
            pauseDuration = 2000;
            break;
          default:
            break;
        }
      }

      await sleep(pauseDuration);
      sprites.forEach(s => updateSprite(s.id, { message: null, messageType: null }));

      // Collision Detection
      const currentSprites = useStore.getState().sprites;
      for (let i = 0; i < currentSprites.length; i++) {
        for (let j = i + 1; j < currentSprites.length; j++) {
          const s1 = currentSprites[i];
          const s2 = currentSprites[j];
          
          const xDiff = Math.abs(s1.x - s2.x);
          const yDiff = Math.abs(s1.y - s2.y);
          
          console.log(`   📏 Checking distance between ${s1.id} (x:${s1.x}) and ${s2.id} (x:${s2.x}) -> X-Diff: ${xDiff}`);

          if (xDiff < 80 && yDiff < 80) {
            const pairKey = `${s1.id}-${s2.id}`;
            
            if (!swappedPairs.has(pairKey)) {
              console.log(`   💥 COLLISION CONFIRMED! Swapping scripts for ${s1.id} and ${s2.id}.`);
              
              swapScripts(s1.id, s2.id);
              
              const temp = unrolledScripts[s1.id];
              unrolledScripts[s1.id] = unrolledScripts[s2.id];
              unrolledScripts[s2.id] = temp;
              
              swappedPairs.add(pairKey);
            } else {
              console.log(`   🔒 Overlap detected, but ${s1.id} and ${s2.id} already swapped this run.`);
            }
          }
        }
      }
    }
    console.log("⏹️ --- PLAYBACK FINISHED ---");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Playground Area */}
      <div className="flex-1 overflow-hidden relative border-b border-gray-200">
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button 
            onClick={handlePlay}
            className="px-4 py-2 bg-green-500 text-white rounded font-bold shadow hover:bg-green-600 flex items-center gap-2"
          >
            ▶ Play
          </button>
        </div>

        {/* RESTORED: Main area mapping over all sprites */}
        <div className="relative w-full h-full mt-16 ml-16">
          {sprites.map((sprite) => (
            <CatSprite key={sprite.id} spriteState={sprite} />
          ))}
        </div>
      </div>

      {/* Sprite Management UI */}
      <div className="h-32 bg-gray-50 p-4 flex gap-4 overflow-x-auto items-center">
        <button 
          onClick={addSprite}
          className="h-20 w-20 border-2 border-dashed border-blue-400 text-blue-500 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 transition-colors shrink-0"
        >
          <span className="text-2xl font-bold">+</span>
          <span className="text-xs">Add Sprite</span>
        </button>

        {sprites.map((sprite) => (
          <div 
            key={sprite.id}
            onClick={() => setActiveSprite(sprite.id)}
            className={`h-20 w-20 bg-white rounded-xl shadow-sm border-2 flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all ${activeSpriteId === sprite.id ? 'border-blue-500 shadow-md ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
          >
            {/* CORRECTED: Inline style transform applied here */}
            <div className="origin-center -mt-4 transform" style={{ transform: 'scale(0.4)' }}>
              <CatSprite spriteState={{...sprite, message: null}} />
            </div>
            <span className="text-xs font-semibold text-gray-700 mt-2">{sprite.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
}