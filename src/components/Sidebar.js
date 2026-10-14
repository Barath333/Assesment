import React from "react";
import { useDraggable } from "@dnd-kit/core";
import Icon from "./Icon";

// Added 'icon' to the props and drag payload
const DraggableBlock = ({ id, type, label, icon, bgColor, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { type, label, icon, bgColor }, 
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    opacity: 0.5,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex flex-row flex-wrap items-center px-2 py-1 my-2 text-sm cursor-grab active:cursor-grabbing rounded ${bgColor} text-white`}
    >
      {/* If children are passed (like custom icons), render them, else render label */}
      {children || label}
    </div>
  );
};

export default function Sidebar() {
  return (
   <div className="w-60 flex-none h-full overflow-y-auto flex flex-col items-start p-2 pb-20 border-r border-gray-200">
      
      <div className="font-bold"> {"Events"} </div>
      <DraggableBlock id="event-flag" type="EVENT_FLAG" label="When flag clicked" icon="flag" bgColor="bg-yellow-500">
        {"When "}
        <Icon name="flag" size={15} className="text-green-600 mx-2" />
        {"clicked"}
      </DraggableBlock>
      <DraggableBlock id="event-sprite" type="EVENT_SPRITE" label="When this sprite clicked" bgColor="bg-yellow-500" />

      <div className="font-bold mt-4"> {"Motion"} </div>
      <DraggableBlock id="motion-move" type="MOVE_STEPS" label="Move 10 steps" bgColor="bg-blue-500" />
      
      {/* Turn blocks now pass the specific icon name */}
      <DraggableBlock id="motion-turn-left" type="TURN_LEFT" label="Turn 15 degrees" icon="undo" bgColor="bg-blue-500">
        {"Turn "}
        <Icon name="undo" size={15} className="text-white mx-2" />
        {"15 degrees"}
      </DraggableBlock>
      <DraggableBlock id="motion-turn-right" type="TURN_RIGHT" label="Turn 15 degrees" icon="redo" bgColor="bg-blue-500">
        {"Turn "}
        <Icon name="redo" size={15} className="text-white mx-2" />
        {"15 degrees"}
      </DraggableBlock>
      
      <DraggableBlock id="motion-goto" type="GOTO_XY" label="Go to x: 50 y: 50" bgColor="bg-blue-500" />

      <div className="font-bold mt-4"> {"Looks"} </div>
      <DraggableBlock id="looks-say" type="SAY_MESSAGE" label="Say Hello for 2 seconds" bgColor="bg-purple-500" />
      <DraggableBlock id="looks-think" type="THINK_MESSAGE" label="Think Hmm... for 2 seconds" bgColor="bg-purple-500" />

<div className="font-bold mt-4"> {"Control"} </div>
<DraggableBlock id="control-repeat" type="REPEAT" label="Repeat animation" bgColor="bg-red-500" />
    </div>
  );
}