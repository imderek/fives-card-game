import React from "react";

export const TableTop = (props) => {
  return (
    <div
      id="react-game-state"
      className="w-full py-2 flex flex-col items-center gap-3"
    >
      {props.children}

      <div className="w-full px-6">
        <a
          href="/"
          className="block text-center border border-slate-500/50 rounded-lg mb-10 px-4 py-3 text-sm text-gray-500 hover:text-gray-700 dark:text-white dark:hover:text-white/70"
        >
          Back to Lobby
        </a>
      </div>
    </div>
  );
};
