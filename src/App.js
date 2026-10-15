import React, { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  pointerWithin
} from "@dnd-kit/core";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { useStore } from "./store";

export default function App() {
  const { activeSpriteId } = useStore();
  const [activeDragData, setActiveDragData] = useState(null);

  // Require moving 5px before a drag starts. 
  // This prevents tiny mouse twitches from interrupting clicks on the input fields.
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragData(active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragData(null); 
    
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const store = useStore.getState();
    const currentScript = store.scripts[activeSpriteId] || [];

    // 1. Adding a new block from the Sidebar (inserted where it was dropped)
    if (active.data.current?.type && !activeId.startsWith("block-")) {
      if (overId === "mid-area" || overId.startsWith("block-")) {
        const payload = {
          ...active.data.current,
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
          params: {}
        };

        let index = currentScript.length; // default: end of the script
        const overIndex = currentScript.findIndex(b => b.id === overId);
        if (overIndex !== -1) {
          // Dropped on a block: insert before it, or after it if released on its lower half
          const moved = active.rect.current.translated;
          const below = moved && moved.top + moved.height / 2 > over.rect.top + over.rect.height / 2;
          index = overIndex + (below ? 1 : 0);
        }
        store.insertBlockAt(activeSpriteId, payload, index);
      }
      return;
    }

    // 2. Reordering blocks already inside the Mid Area
    if (activeId.startsWith("block-")) {
      const oldIndex = currentScript.findIndex(b => b.id === activeId);
      
      let newIndex = oldIndex;
      
      if (overId.startsWith("block-")) {
        // Dropped over another block
        newIndex = currentScript.findIndex(b => b.id === overId);
      } else if (overId === "mid-area") {
        // Dropped in the empty space at the bottom of the workspace
        newIndex = currentScript.length - 1;
      }
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        store.reorderScript(activeSpriteId, oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDragData(null)}
    >
      <div className="h-screen w-screen flex flex-row font-sans bg-gray-100 overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm z-10">
          <Sidebar />
        </div>
        
        <div className="flex-1 flex flex-col bg-white z-0">
          <MidArea />
        </div>
        
        <div className="w-1/3 bg-white border-l border-gray-200 shadow-sm z-10">
          <PreviewArea />
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragData ? (
          <div className={`px-4 py-2 ${activeDragData.bgColor || 'bg-blue-500'} text-white rounded w-max shadow-xl cursor-grabbing opacity-90`}>
            {activeDragData.type === "MOVE_STEPS" ? `Move ${activeDragData.params?.steps ?? 10} steps` : 
             activeDragData.type === "TURN_RIGHT" ? `Turn ↻ ${activeDragData.params?.degrees ?? 15} degrees` :
             activeDragData.type === "TURN_LEFT" ? `Turn ↺ ${activeDragData.params?.degrees ?? 15} degrees` :
             activeDragData.type === "SAY_MESSAGE" ? `Say ${activeDragData.params?.text ?? "Hello!"} for ${activeDragData.params?.seconds ?? 2} seconds` :
             activeDragData.type === "THINK_MESSAGE" ? `Think ${activeDragData.params?.text ?? "Hmm..."} for ${activeDragData.params?.seconds ?? 2} seconds` :
             activeDragData.label}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}