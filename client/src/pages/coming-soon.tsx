import { motion, AnimatePresence } from "framer-motion";
import { useWebsiteSettings } from "@/hooks/use-website-settings";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef, useCallback } from "react";
import { Trophy, Gamepad2, RotateCcw, Play } from "lucide-react";
import { SEO } from "@/components/seo";

// --- Game Constants ---
const LANE_COUNT = 3;
const GAME_SPEED = 5;
const SPAWN_RATE = 1500; // ms

interface Obstacle {
    id: number;
    lane: number;
    y: number;
}

export default function ComingSoon() {
    const { isLoading, ...settings } = useWebsiteSettings();
    const { websiteName, logo, companyName } = settings;

    // Game State
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [playerLane, setPlayerLane] = useState(1); // 0, 1, 2
    const [obstacles, setObstacles] = useState<Obstacle[]>([]);

    const gameLoopRef = useRef<number>();
    const lastSpawnRef = useRef<number>(0);

    // Initialization
    useEffect(() => {
        const saved = localStorage.getItem("import_high_score");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    // Game Core Logic
    const spawnObstacle = useCallback(() => {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        setObstacles(prev => [...prev, { id: Date.now(), lane, y: -100 }]);
    }, []);

    const updateGame = useCallback((time: number) => {
        if (!gameActive || gameOver) return;

        // Spawn
        if (time - lastSpawnRef.current > SPAWN_RATE) {
            spawnObstacle();
            lastSpawnRef.current = time;
        }

        setObstacles(prev => {
            const next = prev.map(o => ({ ...o, y: o.y + GAME_SPEED }))
                .filter(o => o.y < 800); // Filter off-screen

            // Collision Detection
            const playerY = 500; // Fixed player Y
            const playerHeight = 80;
            const collision = next.find(o =>
                o.lane === playerLane &&
                o.y + 60 > playerY &&
                o.y < playerY + playerHeight
            );

            if (collision) {
                setGameOver(true);
                setGameActive(false);
            }

            return next;
        });

        setScore(prev => prev + 1);
        gameLoopRef.current = requestAnimationFrame(updateGame);
    }, [gameActive, gameOver, playerLane, spawnObstacle]);

    useEffect(() => {
        if (gameActive && !gameOver) {
            gameLoopRef.current = requestAnimationFrame(updateGame);
        }
        return () => {
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        };
    }, [gameActive, gameOver, updateGame]);

    // Controls
    useEffect(() => {
        const handleKeys = (e: KeyboardEvent) => {
            if (!gameActive) return;
            if (e.key === "ArrowLeft") setPlayerLane(p => Math.max(0, p - 1));
            if (e.key === "ArrowRight") setPlayerLane(p => Math.min(LANE_COUNT - 1, p + 1));
        };
        window.addEventListener("keydown", handleKeys);
        return () => window.removeEventListener("keydown", handleKeys);
    }, [gameActive]);

    const startGame = () => {
        setGameOver(false);
        setScore(0);
        setObstacles([]);
        setPlayerLane(1);
        setGameActive(true);
        lastSpawnRef.current = performance.now();
    };

    useEffect(() => {
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem("import_high_score", score.toString());
        }
    }, [score, highScore]);

    return (
        <>
            <SEO
                title="Under Maintenance - Auto Import Specialists Australia"
                description="Our import experts are currently updating the site for a better experience. We'll be back online soon with premium vehicle imports."
            />
            <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden text-left">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 blur-[120px] rounded-full" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl w-full text-center z-10 flex flex-col items-center"
                >
                    {logo ? (
                        <img src={logo} alt={websiteName} className="h-12 md:h-16 mx-auto mb-6 object-contain" />
                    ) : (
                        <h2 className="text-2xl font-bold tracking-tighter mb-6">{websiteName}</h2>
                    )}

                    <AnimatePresence mode="wait">
                        {!gameActive && !gameOver ? (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                                    Maintenance Underway
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold tracking-tight uppercase">
                                    We're Tuning <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                                        The High Performance
                                    </span>
                                </h1>
                                <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
                                    Our import experts are working on the site. In the meantime, try to beat the high score in our drift arcade!
                                </p>
                                <Button
                                    onClick={startGame}
                                    size="lg"
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 h-14 text-lg rounded-full"
                                >
                                    <Gamepad2 className="h-5 w-5" />
                                    Launch Import Arcade
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="game"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full max-w-md aspect-[4/5] bg-neutral-900 rounded-3xl border border-white/10 overflow-hidden shadow-2xl cursor-pointer"
                                onClick={(e) => {
                                    if (!gameActive || gameOver) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = e.clientX - rect.left;
                                    if (x < rect.width / 2) {
                                        setPlayerLane(p => Math.max(0, p - 1));
                                    } else {
                                        setPlayerLane(p => Math.min(LANE_COUNT - 1, p + 1));
                                    }
                                }}
                            >
                                {/* Roadmap */}
                                <div className="absolute inset-0 flex">
                                    {[0, 1, 2].map(l => (
                                        <div key={l} className="flex-1 border-x border-white/5 relative">
                                            {/* Road Markings */}
                                            <div className="absolute inset-0 flex flex-col justify-around py-4 opacity-10">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="w-1 h-12 bg-white mx-auto animate-pulse" />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Player */}
                                <motion.div
                                    animate={{ x: playerLane * 100 + 50 - 50 }} // Simple lane math
                                    className="absolute bottom-20 left-0 w-1/3 flex justify-center z-30 transition-all duration-200"
                                >
                                    <div className="w-16 h-24 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg relative shadow-lg shadow-blue-500/20">
                                        <div className="absolute top-2 left-2 right-2 h-4 bg-white/20 rounded" /> {/* Windshield */}
                                        <div className="absolute bottom-2 left-1 w-2 h-4 bg-red-500 rounded-sm" /> {/* Tail lights */}
                                        <div className="absolute bottom-2 right-1 w-2 h-4 bg-red-500 rounded-sm" />
                                    </div>
                                </motion.div>

                                {/* Obstacles */}
                                {obstacles.map(o => (
                                    <motion.div
                                        key={o.id}
                                        style={{ y: o.y, x: o.lane * (400 / 3) + (400 / 6) - 20 }}
                                        className="absolute left-0 w-10 h-16 bg-neutral-700 rounded-lg"
                                    >
                                        <div className="absolute top-2 left-1 right-1 h-2 bg-orange-500/40 rounded" />
                                    </motion.div>
                                ))}

                                {/* HUD */}
                                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-40 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                    <div>
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Current</p>
                                        <p className="text-xl font-mono text-blue-400 font-bold">{Math.floor(score / 10)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold flex items-center justify-end gap-1">
                                            <Trophy className="h-3 w-3" /> Best
                                        </p>
                                        <p className="text-xl font-mono text-amber-400 font-bold">{Math.floor(highScore / 10)}</p>
                                    </div>
                                </div>

                                {/* Game Over Overlay */}
                                <AnimatePresence>
                                    {gameOver && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                                                <RotateCcw className="h-8 w-8 text-red-500" />
                                            </div>
                                            <h3 className="text-3xl font-bold mb-2 uppercase">Wrecked!</h3>
                                            <p className="text-neutral-400 mb-8">You drifted too close to the edge.</p>

                                            <div className="bg-white/5 rounded-2xl p-6 w-full mb-8 border border-white/10">
                                                <p className="text-sm text-neutral-500 uppercase tracking-widest font-bold mb-1">Final Score</p>
                                                <p className="text-5xl font-mono text-white font-bold">{Math.floor(score / 10)}</p>
                                            </div>

                                            <Button
                                                onClick={startGame}
                                                className="w-full h-14 rounded-2xl bg-white text-black hover:bg-neutral-200 text-lg font-bold gap-2"
                                            >
                                                <Play className="h-5 w-5 fill-black" />
                                                Race Again
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Game Controls Guide */}
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none opacity-40">
                                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase">Use Arrow Keys to Steer</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-12 pt-8 border-t border-white/5 w-full">
                        <p className="text-neutral-600 text-sm">
                            &copy; {new Date().getFullYear()} {websiteName || companyName}. High Performance Maintenance.
                        </p>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
