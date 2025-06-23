import React, { useState, useEffect, useRef } from 'react';

// Define initial dirty clothes with new image URLs
const initialDirtyClothes = [
  { id: 'sock', name: 'Sock', src: 'https://media.istockphoto.com/id/500928541/photo/used-socks-isolated-on-the-white-background.jpg?s=1024x1024&w=is&k=20&c=FRMoQ4YmW4PlBY0LNiDiy_gIwvVqsCI9EvsnWJDWjss=', cleanSrc: 'https://www.realsimple.com/thmb/MJxE3dA-tCjKYkpSZmAhjXjdDpE=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/how-to-keep-socks-white-GettyImages-1324849113-f651168435de4b748d99b5fc8a56760d.jpg' },
  { id: 'tshirt', name: 'T-Shirt', src: 'https://media.istockphoto.com/id/451359305/photo/white-shirt-soiled-with-different-stains-against-white-back.jpg?s=612x612&w=0&k=20&c=hTW34Cv-vpJ3oF-BdDOW-YTZu8F_wwDa6Fngu7kR_CQ=', cleanSrc: 'https://kidstribe.com.au/cdn/shop/products/SunSandSurfTeewhiteback_grande.jpg?v=1631766444' },
  { id: 'pants', name: 'Pants', src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW2WKrnMXstg7AApnMtrZpAojm2quIucsbfQ&s', cleanSrc: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJgiLpilb6hSTSBfyN8TocfobP-8MV__vPSQ&s' },
  { id: 'towel', name: 'Towel', src: 'https://t4.ftcdn.net/jpg/05/58/48/93/360_F_558489381_08SUvwV8D7ij11I0fTEP1vIlHWb7k2cf.jpg', cleanSrc: 'https://m.media-amazon.com/images/I/71ZXDHi6QnL.jpg' },
];

// Features to display as bubbles during washing
// Updated according to product highlights: Gentle Wave, Stain Expert, Steam Wash
const washFeatures = ['Gentle Wave', 'Stain Expert', 'Steam Wash', 'Spin', 'Rinse'];
const initialBubbles = ['Fully Automatic!', 'Gentle on Clothes!', 'Tough on Stains!', 'Steam Power!', 'Hassle-Free Laundry!']; // Updated bubbles for initial screen

const App = () => {
  // Game state
  const [dirtyClothes, setDirtyClothes] = useState(initialDirtyClothes);
  const [clothesInMachine, setClothesInMachine] = useState([]);
  const [washMode, setWashMode] = useState(null); // 'Quick', 'Eco', 'Heavy'
  const [isWashing, setIsWashing] = useState(false);
  const [isClean, setIsClean] = useState(false);
  const [message, setMessage] = useState("Drag clothes into the washing machine!");
  const [washProgress, setWashProgress] = useState(0);
  const [gameStep, setGameStep] = useState(1); // 1: Load Clothes, 2: Select Mode & Wash, 3: Clean Clothes
  const [appState, setAppState] = useState('initial'); // 'initial', 'playing'

  // Refs for drag and drop
  const washingMachineRef = useRef(null);

  // Handle drag start
  const handleDragStart = (e, clothId) => {
    e.dataTransfer.setData('clothId', clothId);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('dragging-cloth');
  };

  // Handle drag end (clean up class)
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging-cloth');
  };

  // Handle drag over the washing machine
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.add('wash-machine-drag-over');
    }
  };

  // Handle drag leave the washing machine
  const handleDragLeave = () => {
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.remove('wash-machine-drag-over');
    }
  };

  // Handle drop on the washing machine
  const handleDrop = (e) => {
    e.preventDefault();
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.remove('wash-machine-drag-over');
    }

    const clothId = e.dataTransfer.getData('clothId');
    const droppedCloth = dirtyClothes.find(cloth => cloth.id === clothId);

    if (droppedCloth) {
      setDirtyClothes(prev => prev.filter(cloth => cloth.id !== clothId));
      setClothesInMachine(prev => {
        const updatedClothesInMachine = [...prev, { ...droppedCloth, isInMachine: true }];
        setMessage("Clothes are in! Now select a wash mode.");
        setIsClean(false);
        setWashMode(null);
        setWashProgress(0);

        // Move to step 2 if clothes are in the machine
        if (updatedClothesInMachine.length > 0 && gameStep === 1) {
             setGameStep(2); // Ensure we are in step 2 for controls
        }
        return updatedClothesInMachine;
      });
    }
  };

  // Handle wash mode selection
  const selectWashMode = (mode) => {
    setWashMode(mode);
    setMessage(`"${mode}" mode selected. Click "Wash" when ready!`);
  };

  // Handle washing animation and process
  const startWashing = () => {
    if (clothesInMachine.length === 0) {
      setMessage("No clothes in the machine! Drag some in first.");
      return;
    }
    if (!washMode) {
      setMessage("Please select a wash mode first (Quick, Eco, or Heavy).");
      return;
    }

    setIsWashing(true);
    setMessage("Washing in progress...");
    setWashProgress(0);

    const durationMap = {
      'Quick': 2000,
      'Eco': 4000,
      'Heavy': 6000,
      'Gentle Wave': 3000, // Assign duration for new modes
      'Stain Expert': 5000,
      'Steam Wash': 4500,
    };
    const duration = durationMap[washMode];
    let startTime = null;

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      setWashProgress(Math.min(progress * 100, 100));

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        setIsWashing(false);
        setIsClean(true);
        setMessage("Clothes are clean! ✨ Time to dry!");
        setClothesInMachine(prev => prev.map(cloth => ({ ...cloth, isClean: true })));
        setGameStep(3);
      }
    };

    requestAnimationFrame(animateProgress);
  };

  // Reset the game
  const resetGame = () => {
    setDirtyClothes(initialDirtyClothes);
    setClothesInMachine([]);
    setWashMode(null);
    setIsWashing(false);
    setIsClean(false);
    setMessage("Game reset! Drag clothes into the washing machine.");
    setWashProgress(0);
    setGameStep(1);
    setAppState('initial'); // Reset to initial screen
  };

  const startGame = () => {
    setAppState('playing');
    setMessage("Drag clothes into the washing machine!");
  };

  const exploreVoltasBeko = () => {
    // This function would typically navigate to the Voltas Beko website
    // For this Canvas environment, we'll just log a message or open a placeholder link
    console.log("Exploring Voltas Beko Washing Machines!");
    // Example: window.open('https://www.voltasbeko.com', '_blank');
    alert("Redirecting to Voltas Beko website for more info!"); // Using alert for demo purpose
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-2 font-inter">
      {/* Main game container, simulating a 400px width and adaptive height */}
      <div className="bg-white rounded-[25px] shadow-2xl p-4 w-[400px] h-[580px] flex flex-col items-center space-y-4 border-4 border-purple-300 relative overflow-y-auto">
        {/* Voltas Logo */}
        <img
          src="https://pimwp.s3-accelerate.amazonaws.com/2023/11/Untitled-design-64.png"
          alt="Voltas Beko Logo"
          className="absolute w-20 h-8 top-3 right-3 z-50 rounded-md shadow-sm"
          // Fallback in case the image fails to load
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x40/003366/ffffff?text=VOLTAS+BEKO'; }}
        />

        <p className="text-xl font-semibold text-gray-600 text-center mt-8 mb-2">Wash Day! 🧺</p>

        {/* Message area */}
        <div className="bg-blue-50 text-blue-800 p-2 rounded-xl shadow-md text-center font-semibold text-sm animate-fade-in w-full border border-blue-200">
          {message}
        </div>

        {/* Initial Screen */}
        {appState === 'initial' && (
          <div className="flex flex-col items-center justify-center flex-grow space-y-6 animate-fade-in relative w-full h-full">
            <h1 className="text-xl font-extrabold text-gray-800 text-center drop-shadow-lg">
               Discover Voltas Beko Washing Machines!
            </h1>

            {/* Pulsating Washing Machine Icon */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-300 rounded-full flex items-center justify-center opacity-70 animate-pulse-slow">
                <span className="text-6xl">🧺</span> {/* Washing machine emoji */}
              </div>
              {/* Initial Bubbles */}
              {initialBubbles.map((text, index) => (
                <div
                  key={text}
                  className="initial-bubble absolute bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full shadow-md animate-initial-float-pop"
                  style={{
                    animationDelay: `${index * 0.4}s`,
                    top: `${20 + index * 15}%`,
                    left: `${10 + (index % 2 === 0 ? 0 : 70)}%`,
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  {text}
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              className="action-button bg-green-500 hover:bg-green-600 text-white text-lg animate-bounce-subtle"
            >
              Start Washing!
            </button>
          </div>
        )}

        {/* Main Game UI (when playing) */}
        {appState === 'playing' && (
          <div className="flex flex-col w-full flex-grow items-center space-y-4">
            {/* Dirty Clothes Area - Step 1 & 2 (while not washing) */}
            {((gameStep === 1 || (gameStep === 2 && !isWashing)) && dirtyClothes.length > 0) && (
              <div className="flex flex-col items-center bg-amber-50 p-3 rounded-xl shadow-md border border-amber-200 w-full flex-grow">
                <h2 className="text-xl font-bold text-gray-700 mb-3 border-b border-amber-300 pb-1">Dirty Clothes</h2>
                {/* Clothes will wrap vertically */}
                <div className="flex flex-wrap justify-center gap-2 pb-2">
                  {dirtyClothes.map(cloth => (
                    <div
                      key={cloth.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, cloth.id)}
                      onDragEnd={handleDragEnd}
                      className="cloth-item flex-shrink-0 cursor-grab bg-amber-100 p-2 rounded-lg shadow-sm hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center transform hover:rotate-3 active:cursor-grabbing border border-amber-200"
                      // Increased size of cloth image area
                      style={{ width: '90px', height: '90px' }}
                    >
                      {/* Removed cloth.name display */}
                      <img
                        src={cloth.src}
                        alt={cloth.name}
                        className="w-full h-full object-contain drop-shadow" // Image fills card
                        // Fallback in case the image fails to load
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/333333?text=🚫'; }}
                      />
                    </div>
                  ))}
                </div>
                {dirtyClothes.length === 0 && (
                  <p className="text-gray-500 mt-4 text-sm animate-pulse">All clothes are loaded!</p>
                )}
              </div>
            )}

            {/* Washing Machine Area - Replaced with image */}
            <div
              ref={washingMachineRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative bg-cover bg-center rounded-xl shadow-lg border-2 border-blue-700 flex flex-col items-center justify-center w-full h-[180px] transition-all duration-300 transform hover:scale-[1.01] overflow-hidden`}
              style={{ backgroundImage: `url('https://oxygendigitalshop.com/pub/media/catalog/product/1/9/1923_1.jpg')` }}
              // Fallback for washing machine image
              onError={(e) => { e.target.onerror = null; e.target.style.backgroundImage = `url('https://placehold.co/280x180/4299e1/ffffff?text=Washing+Machine')`; }}
            >
              <div className="absolute inset-0 bg-blue-800 opacity-20 rounded-xl pointer-events-none z-0"></div>
              {/* Removed "Machine" title to make way for the image */}
              {/* <h2 className="text-2xl font-extrabold text-white mb-3 drop-shadow-md z-10">Machine</h2> */}

              {/* Clothes and animations remain on top of the image */}
              <div className="relative w-32 h-32 flex items-center justify-center z-10">
                {/* Washing Machine Drum (conceptual, clothes will render over image's drum area) */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isWashing ? 'opacity-100' : 'opacity-0'}`}>
                  {/* Visual for spinning water, not a full drum image */}
                  <div className="w-full h-full rounded-full border-2 border-solid border-blue-400 animate-spin-fast opacity-80"></div>
                  <div className="absolute text-4xl animate-pulse text-blue-500">💧</div>
                  <div className="absolute text-xl text-gray-700 font-bold opacity-90 drop-shadow-lg">
                    {Math.round(washProgress)}%
                  </div>
                  <div className="absolute flex flex-wrap justify-center items-center gap-1 p-1 transform rotate-animation">
                    {clothesInMachine.map((cloth, index) => (
                      <img
                        key={`wash-${cloth.id}-${index}`}
                        src={cloth.src} // Still dirty during wash
                        alt={cloth.name}
                        className="w-8 h-8 object-contain rounded-md transform scale-90"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Clothes in machine when not washing */}
                {!isWashing && (
                  <div className="flex flex-wrap justify-center items-center gap-2 p-2 transition-all duration-500">
                    {clothesInMachine.length > 0 ? (
                      clothesInMachine.map(cloth => (
                        <img
                          key={`static-${cloth.id}`}
                          src={isClean ? cloth.cleanSrc : cloth.src}
                          alt={cloth.name}
                          className={`w-10 h-10 object-contain rounded-md transition-all duration-500 ${isClean ? 'animate-sparkle' : ''} shadow-sm`}
                        />
                      ))
                    ) : (
                      <span className="text-white text-center text-lg font-bold">Drop clothes here</span>
                    )}
                  </div>
                )}
              </div>

              {/* Wash mode buttons - Visible in step 2 */}
              {gameStep === 2 && !isWashing && clothesInMachine.length > 0 && (
                <div className="absolute bottom-3 flex space-x-2 z-20 animate-fade-in-up">
                  <button
                    onClick={() => selectWashMode('Gentle Wave')}
                    className={`wash-mode-btn text-xs ${washMode === 'Gentle Wave' ? 'bg-purple-600 text-white shadow-md scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                  >
                    Gentle Wave

                  </button>
                  <button
                    onClick={() => selectWashMode('Stain Expert')}
                    className={`wash-mode-btn text-xs ${washMode === 'Stain Expert' ? 'bg-purple-600 text-white shadow-md scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                  >
                    Stain Expert
                  </button>
                  <button
                    onClick={() => selectWashMode('Steam Wash')}
                    className={`wash-mode-btn text-xs ${washMode === 'Steam Wash' ? 'bg-purple-600 text-white shadow-md scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                  >
                    Steam Wash
                  </button>
                </div>
              )}

              {/* Wash Feature Bubbles - Visible when washing */}
              {isWashing && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
                  {washFeatures.map((feature, index) => (
                    <div
                      key={feature}
                      className="wash-feature-bubble absolute bg-purple-200 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full shadow-md animate-float-pop"
                      style={{
                        animationDelay: `${index * 0.3}s`,
                        // Adjusting positions for a machine image background
                        top: `${20 + index * 10}%`, // More vertical spread
                        left: `${10 + (index % 2 === 0 ? 0 : 70)}%`, // Spread left/right
                        transform: `translate(-50%, -50%)`,
                      }}
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Control Panel / Clean Clothes Area - Conditional visibility based on steps */}
            {(gameStep === 2 || gameStep === 3) && (
              <div className="flex flex-col items-center bg-teal-50 p-3 rounded-xl shadow-md border border-teal-200 w-full flex-grow">
                {/* <h2 className="text-xl font-bold text-gray-700 mb-3 border-b border-teal-300 pb-1">Controls / Clean Clothes</h2> */}
                <div className="flex flex-col space-y-3 w-full items-center">
                  {/* Wash button - Visible in step 2, disabled during wash */}
                  {gameStep === 2 && !isWashing && clothesInMachine.length > 0 && (
                    <button
                      onClick={startWashing}
                      disabled={!washMode}
                      className="action-button bg-green-500 hover:bg-green-600 text-white text-md"
                    >
                      Wash!
                    </button>
                  )}
                  {isWashing && (
                    <button
                      disabled
                      className="action-button bg-green-500 text-white text-md cursor-not-allowed opacity-70"
                    >
                      Washing...
                    </button>
                  )}

                  {/* Clean clothes display - Visible in step 3 */}
                  {gameStep === 3 && isClean && clothesInMachine.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-2 animate-fade-in">
                      {clothesInMachine.map(cloth => (
                        <div
                          key={`clean-${cloth.id}`}
                          className="clean-cloth-item bg-teal-100 p-2 rounded-lg shadow-sm flex flex-col items-center justify-center animate-pop-in border border-teal-200"
                          style={{ width: '90px', height: '90px' }} // Increased size for clean clothes too
                        >
                          <img
                            src={cloth.cleanSrc}
                            alt={`Clean ${cloth.name}`}
                            className="w-full h-full object-contain animate-sparkle-loop drop-shadow-md"
                            // Fallback for clean clothes image
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/a7f3d0/374151?text=✨'; }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reset and Explore buttons - Visible in step 3 */}
                  {gameStep === 3 && (
                    <>
                      <button
                        onClick={resetGame}
                        className="action-button bg-red-500 hover:bg-red-600 text-white text-md mt-4"
                      >
                        Reset Game
                      </button>
                      <button
                        onClick={exploreVoltasBeko}
                        className="action-button bg-blue-500 hover:bg-blue-600 text-white text-md"
                      >
                        Explore Voltas Beko
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom CSS for enhanced aesthetics and animations */}
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }

          /* General Button Styles */
          .action-button {
            width: 100%;
            max-width: 200px;
            font-weight: 600;
            padding: 0.75rem 1rem;
            border-radius: 9999px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            font-size: 1rem;
            transition: all 0.3s ease-in-out;
            transform: scale(1);
            border-bottom: 4px solid rgba(0,0,0,0.2);
            background-image: linear-gradient(to right, var(--tw-gradient-from), var(--tw-gradient-to));
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
          }
          .action-button:hover { transform: scale(1.05); }
          .action-button:active { transform: scale(0.95); }
          .action-button:disabled { opacity: 0.5; cursor: not-allowed; }

          .action-button.bg-green-500 { --tw-gradient-from: #10B981; --tw-gradient-to: #059669; border-color: #047857; }
          .action-button.bg-red-500 { --tw-gradient-from: #EF4444; --tw-gradient-to: #DC2626; border-color: #B91C1C; }
          .action-button.bg-blue-500 { --tw-gradient-from: #3B82F6; --tw-gradient-to: #2563EB; border-color: #1D4ED8; }


          .wash-mode-btn {
            padding: 0.5rem 0.8rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            transition: all 0.2s ease-in-out;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-width: 2px;
            border-color: transparent;
            transform: translateY(0);
          }
          .wash-mode-btn:hover {
            transform: translateY(-2px);
          }
          .wash-mode-btn.bg-purple-600 {
            background-image: linear-gradient(to right, #9333ea, #7e22ce);
            border-color: #6d28d9;
          }
          .wash-mode-btn.bg-white {
            background-color: #fff;
            color: #7e22ce;
          }
          .wash-mode-btn.bg-white:hover {
            background-color: #f3e8ff;
          }


          /* Dragging feedback */
          .cloth-item.dragging-cloth {
            opacity: 0.7;
            transform: scale(1.05) rotate(5deg) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          }

          /* Washing Machine Drag Over effect */
          .wash-machine-drag-over {
            box-shadow: 0 0 0 4px rgba(129, 140, 248, 0.5);
            transform: scale(1.02);
          }

          /* Animations */
          .animate-spin-fast {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-down {
            animation: fadeDown 1s ease-out forwards;
          }
          @keyframes fadeDown {
            from { opacity: 0; transform: translateY(-15px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.7s ease-out forwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-sparkle {
            animation: sparkle 1.5s ease-in-out infinite alternate;
          }
          @keyframes sparkle {
            0% { filter: brightness(1); text-shadow: none; }
            50% { filter: brightness(1.5); text-shadow: 0 0 5px rgba(255,255,200,0.8), 0 0 10px rgba(255,255,200,0.5); }
            100% { filter: brightness(1); text-shadow: none; }
          }
          .animate-sparkle-loop {
            animation: sparkle 2s ease-in-out infinite;
          }

          .animate-pop-in {
            animation: popIn 0.4s ease-out forwards;
          }
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }

          .rotate-animation {
            animation: rotateClothes 3s linear infinite;
          }
          @keyframes rotateClothes {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Wash Feature Bubble Animations */
          .wash-feature-bubble {
            animation: floatPop 3s ease-out infinite;
            opacity: 0;
            white-space: nowrap;
            filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
            transition: background-color 0.3s ease-in-out;
          }

          @keyframes floatPop {
            0% { transform: scale(0.5) translateY(0px) translateX(0px); opacity: 0; }
            20% { transform: scale(1) translateY(-10px) translateX(5px); opacity: 1; }
            80% { transform: scale(0.9) translateY(-20px) translateX(-5px); opacity: 0.8; }
            100% { transform: scale(0.7) translateY(-30px) translateX(0px); opacity: 0; }
          }

          /* Specific positioning for bubbles around the drum center */
          .wash-feature-bubble:nth-child(1) { top: 10%; left: 50%; transform: translateX(-50%); animation-delay: 0.1s; }
          .wash-feature-bubble:nth-child(2) { top: 30%; left: 80%; transform: translateY(-50%); animation-delay: 0.4s; }
          .wash-feature-bubble:nth-child(3) { top: 70%; left: 20%; transform: translateY(-50%); animation-delay: 0.7s; }
          .wash-feature-bubble:nth-child(4) { top: 90%; left: 50%; transform: translateX(-50%); animation-delay: 1.0s; }
          .wash-feature-bubble:nth-child(5) { top: 30%; left: 20%; transform: translateY(-50%); animation-delay: 1.3s; }

          /* Initial Screen Bubbles */
          .initial-bubble {
            animation: initialBubbleFloatPop 4s ease-out infinite;
            opacity: 0;
            position: absolute;
          }

          @keyframes initialBubbleFloatPop {
            0% { transform: scale(0.5) translateY(0px) translateX(0px); opacity: 0; }
            20% { transform: scale(1) translateY(-15px) translateX(5px); opacity: 1; }
            80% { transform: scale(0.9) translateY(-30px) translateX(-5px); opacity: 0.8; }
            100% { transform: scale(0.7) translateY(-45px) translateX(0px); opacity: 0; }
          }

          .animate-pulse-slow {
            animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.05); }
          }

          .animate-bounce-subtle {
            animation: bounceSubtle 2s infinite;
          }
          @keyframes bounceSubtle {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default App;
