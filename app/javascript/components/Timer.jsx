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
            <div className="flex flex-col items-center gap-6">
              {/* Remaining reps */}
              <h2 className="text-9xl tracking-tighter font-medium text-white">{NUM_REPS - currentRep + 1}</h2>
              {/* Timer */}
              <div className="flex justify-center gap-3">
                {[...Array(DURATION_PER_SIDE)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`
                        w-12 h-6 rounded-full border-2
                        ${side === "Left" ? 'border-red-500' : 'border-blue-500'} 
                        ${i < timeLeft ? (side === "Left" ? 'bg-red-500' : 'bg-blue-500') : (side === "Left" ? '!border-red-500' : '!border-blue-500')}
                      `}
                    ></div>
                ))}
              </div>
              <div className={`text-lg uppercase ${timeLeft === 0 ? 'text-white' : (side === "Left" ? 'text-red-500' : 'text-blue-500')} tracking-[.25rem]`}>
                {timeLeft === 0 ? 'Switch' : side}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button className="btn btn-primary py-5 text-xl rounded-full !bg-none border-0 bg-red-500 hover:!bg-transparent hover:border-red-500 hover:border-2" onClick={startTimer}>
            Start Again
          </button>
        </>
      )}
      {!running && currentRep <= NUM_REPS && (
        <button className="btn btn-primary py-5 text-xl rounded-full !bg-none border-0 bg-red-500 hover:!bg-transparent hover:border-red-500 hover:border-2" onClick={startTimer}>
          Begin
        </button>
      )}
    </div>
  );
};

export default Timer;