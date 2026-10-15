import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStore } from "../store";

// Custom component for individual draggable blocks in the workspace
function SortableBlock({ block, activeSpriteId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: block.id,
    data: block // Attach block data for the DragOverlay
  });
  const { updateBlockParam, removeBlock } = useStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Dims the original block leaving a placeholder
  };

  const handleInputChange = (e, param) => {
    updateBlockParam(activeSpriteId, block.id, param, e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-row items-center px-4 py-2 my-1 ${block.bgColor || 'bg-blue-500'} text-white rounded w-max gap-2 group cursor-grab active:cursor-grabbing shadow-sm`}
      {...attributes}
      {...listeners}
    >
      {/* Dynamic Editable Inputs based on Block Type */}
      {block.type === "MOVE_STEPS" && (
        <>Move <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-12 text-black px-1 rounded cursor-text" value={block.params?.steps ?? 10} onChange={(e) => handleInputChange(e, 'steps')} /> steps</>
      )}

      {(block.type === "TURN_RIGHT" || block.type === "TURN_LEFT") && (
        <>Turn {block.type === "TURN_RIGHT" ? '↻' : '↺'} <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-12 text-black px-1 rounded cursor-text" value={block.params?.degrees ?? 15} onChange={(e) => handleInputChange(e, 'degrees')} /> degrees</>
      )}

      {block.type === "GOTO_XY" && (
        <>Go to x: <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-12 text-black px-1 rounded cursor-text" value={block.params?.x ?? 50} onChange={(e) => handleInputChange(e, 'x')} /> y: <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-12 text-black px-1 rounded cursor-text" value={block.params?.y ?? 50} onChange={(e) => handleInputChange(e, 'y')} /></>
      )}

    {block.type === "SAY_MESSAGE" && (
  <>Say <input type="text" onPointerDown={(e) => e.stopPropagation()} className="w-16 text-black px-1 rounded cursor-text" value={block.params?.text ?? "Hello!"} onChange={(e) => handleInputChange(e, 'text')} /> for <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-10 text-black px-1 rounded cursor-text" value={block.params?.seconds ?? 2} onChange={(e) => handleInputChange(e, 'seconds')} /> s</>
)}

{block.type === "THINK_MESSAGE" && (
  <>Think <input type="text" onPointerDown={(e) => e.stopPropagation()} className="w-16 text-black px-1 rounded cursor-text" value={block.params?.text ?? "Hmm..."} onChange={(e) => handleInputChange(e, 'text')} /> for <input type="number" onPointerDown={(e) => e.stopPropagation()} className="w-10 text-black px-1 rounded cursor-text" value={block.params?.seconds ?? 2} onChange={(e) => handleInputChange(e, 'seconds')} /> s</>
)}

      {!["MOVE_STEPS", "TURN_RIGHT", "TURN_LEFT", "GOTO_XY", "SAY_MESSAGE", "THINK_MESSAGE"].includes(block.type) && block.label}
      
      {/* Delete Button (appears on hover) */}
      <button 
        onPointerDown={(e) => e.stopPropagation()} 
        onClick={() => removeBlock(activeSpriteId, block.id)}
        className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        ×
      </button>
    </div>
  );
}

export default function MidArea() {
  const { isOver, setNodeRef } = useDroppable({ id: "mid-area" });
  const { scripts, activeSpriteId } = useStore();
  const currentScript = scripts[activeSpriteId] || [];

  return (
    <div ref={setNodeRef} className={`flex-1 h-full p-4 overflow-y-auto ${isOver ? 'bg-blue-50' : ''}`}>
      <div className="font-bold mb-4">Mid Area (Workspace)</div>
      
      <SortableContext items={currentScript.map(b => b.id)} strategy={verticalListSortingStrategy}>
<div className="flex flex-col items-start" style={{ minHeight: '500px' }}>
          {currentScript.map((block) => (
            <SortableBlock key={block.id} block={block} activeSpriteId={activeSpriteId} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}