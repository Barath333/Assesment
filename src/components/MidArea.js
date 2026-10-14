import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useStore } from "../store";
import Icon from "./Icon"; // Import the Icon component

export default function MidArea() {
  const { activeSpriteId, scripts } = useStore();
  const currentScript = scripts[activeSpriteId] || [];

  const { isOver, setNodeRef } = useDroppable({
    id: "mid-area",
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 h-full overflow-auto p-4 ${isOver ? 'bg-blue-50' : 'bg-white'}`}
    >
      <div className="font-bold mb-4">{"Mid Area (Drop Blocks Here)"}</div>
      
      <div className="flex flex-col gap-2 items-start">
        {currentScript.map((block) => (
          <div 
            key={block.id} 
            className={`flex flex-row items-center px-4 py-2 ${block.bgColor || 'bg-blue-500'} text-white rounded cursor-pointer w-max`}
          >
            {/* Custom rendering for Turn and Event blocks to show their icons */}
            {block.type === "TURN_LEFT" || block.type === "TURN_RIGHT" ? (
              <>
                {"Turn "}
                <Icon name={block.icon} size={15} className="text-white mx-2" />
                {"15 degrees"}
              </>
            ) : block.type === "EVENT_FLAG" ? (
              <>
                {"When "}
                <Icon name={block.icon} size={15} className="text-green-600 mx-2" />
                {"clicked"}
              </>
            ) : (
              block.label
            )}
          </div>
        ))}
      </div>
    </div>
  );
}