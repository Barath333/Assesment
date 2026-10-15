# Scratch Clone Engine - ReactJS Visual Coding Assessment

A web-based visual programming environment built with React that allows users to write asynchronous, multi-threaded scripts for multiple sprites using drag-and-drop blocks.

## 🚀 Live Demo
[Insert your Vercel Link Here]

## 🏗️ Core Architecture & Features
* **Multi-Threaded Execution Engine:** Implemented an asynchronous loop that gives every sprite its own independent execution thread. A sprite pausing for a 2-second "Say" block does not block the movement or execution of other active sprites.
* **The "Hero" Feature (Collision Script Swapping):** Engineered a background interval that constantly polls bounding-box intersections. When two sprites collide, the engine dynamically swaps their `runtimeScripts` arrays in memory without destroying the user's authored workspace code. Dead threads are safely revived to execute the newly stolen logic.
* **Complex Global State:** Utilized **Zustand** to decouple the physics engine, script arrays, and drag-and-drop context from the visual React tree, eliminating prop-drilling and unnecessary re-renders.
* **Advanced Drag-and-Drop:** Integrated `@dnd-kit/sortable` with an absolute `<DragOverlay>` to allow inserting, reordering, and deleting blocks seamlessly.

## 🛠️ Tech Stack
* **Framework:** React 17
* **State Management:** Zustand
* **Drag and Drop:** @dnd-kit (core, sortable, utilities)
* **Styling:** Tailwind CSS

## 💻 Run Locally
1. Clone the repository
2. Run `npm install`
3. Run `npm start`
4. Open [http://localhost:3000](http://localhost:3000)