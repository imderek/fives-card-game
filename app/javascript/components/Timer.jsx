import React, { useState, useEffect } from "react";

const Timer = () => {
  const NUM_REPS = 10; // Total number of reps
  const DURATION_PER_SIDE = 4; // Seconds per side

  const [timeLeft, setTimeLeft] = useState(DURATION_PER_SIDE);
  const [currentRep, setCurrentRep] = useState(1);
  const [side, setSide] = useState("Left"); // Changed from "Right" to "Left"
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || currentRep > NUM_REPS) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          // We've reached 0, now switch sides
          if (side === "Left") {
            setSide("Right");
            return DURATION_PER_SIDE;
          } else {
            setSide("Left");
            setCurrentRep((prevRep) => prevRep + 1);
            return DURATION_PER_SIDE;
          }
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, side, currentRep]);

  const startTimer = () => {
    // Reset everything regardless of current state
    setRunning(true);
    setCurrentRep(1);
    setSide("Left"); // Changed from "Right" to "Left"
    setTimeLeft(DURATION_PER_SIDE);
  };

  return (
    <div className="p-4 px-8 h-screen flex flex-col justify-center items-center">
      {currentRep <= NUM_REPS ? (
        <>
          {running && (
            <>
              {/* Rep number */}
              <h2 className="mb-2 text-8xl tracking-tighter font-bold text-white">{currentRep} <span className="text-slate-700">/ {NUM_REPS}</span></h2>
              {/* Timer */}
              <div className="p-4 pb-3">
                <div className="mb-3.5 flex justify-center">
                    <div className="flex gap-4">
                    {[...Array(DURATION_PER_SIDE)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-6 h-6 rounded-full border-2 border-white ${i < timeLeft ? 'bg-white' : '!border-slate-700'}`}
                        ></div>
                    ))}
                    </div>
                </div>
                <div className="text-lg uppercase text-white tracking-[.25rem]">{side}</div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <button className="btn btn-primary mt-4" onClick={startTimer}>
            Restart Timer
          </button>
        </>
      )}
      {!running && currentRep <= NUM_REPS && (
        <button className="btn btn-primary" onClick={startTimer}>
          Start Timer
        </button>
      )}
    </div>
  );
};

export default Timer;