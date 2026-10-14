import React, { useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import Sidebar from "./components/Sidebar";
import MidArea from "./components/MidArea";
import PreviewArea from "./components/PreviewArea";
import { useStore } from "./store";

export default function App() {
  const { activeSpriteId, addBlockToScript } = useStore();
  const [activeDragItem, setActiveDragItem] = useState(null);

  const handleDragStart = (event) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && over.id === "mid-area") {
      const blockData = active.data.current; 
      
      if (blockData) {
        addBlockToScript(activeSpriteId, { 
          ...blockData, 
          id: `${blockData.type}-${Date.now()}` 
        });
      }
    }
    
    // Clear the overlay state when drag finishes
    setActiveDragItem(null);
  };

  return (
    <div className="bg-blue-100 pt-6 font-sans">
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="h-screen overflow-hidden flex flex-row">
          <div className="flex-1 h-screen overflow-hidden flex flex-row bg-white border-t border-r border-gray-200 rounded-tr-xl mr-2">
            <Sidebar /> 
            <MidArea />
          </div>
          <div className="w-1/3 h-screen overflow-hidden flex flex-row bg-white border-t border-l border-gray-200 rounded-tl-xl ml-2">
            <PreviewArea />
          </div>
        </div>

        {/* The DragOverlay renders completely above all overflow restrictions */}
        <DragOverlay>
          {activeDragItem ? (
            <div className={`flex flex-row items-center px-2 py-1 text-sm rounded ${activeDragItem.bgColor} text-white shadow-lg cursor-grabbing`}>
              {activeDragItem.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}