import { generateLayout } from 'crossword-layout-generator';

// Helper function to convert layout to grid format
function layoutToGrid(layout) {
    if (!layout || layout.length === 0) return { grid: [], clues: { across: [], down: [] } };

    // Find grid dimensions
    let maxRow = 0;
    let maxCol = 0;
    layout.forEach(word => {
        const endRow = word.starty + (word.orientation === 'down' ? word.answer.length - 1 : 0);
        const endCol = word.startx + (word.orientation === 'across' ? word.answer.length - 1 : 0);
        maxRow = Math.max(maxRow, endRow);
        maxCol = Math.max(maxCol, endCol);
    });

    // Validate dimensions to prevent invalid array length errors
    if (maxRow < 0 || maxCol < 0 || maxRow > 100 || maxCol > 100) {
        console.error('Invalid grid dimensions:', maxRow, maxCol);
        return { grid: [], clues: { across: [], down: [] } };
    }

    // Create empty grid
    const grid = Array(maxRow + 1).fill(null).map(() =>
        Array(maxCol + 1).fill(null).map(() => ({
            letter: "",
            isBlack: true,
            answer: ""
        }))
    );

    // Fill in words
    const clues = { across: [], down: [] };
    let clueNumber = 1;
    const numberMap = new Map();

    // Sort by position (top to bottom, left to right)
    const sortedLayout = [...layout].sort((a, b) => {
        if (a.starty !== b.starty) return a.starty - b.starty;
        return a.startx - b.startx;
    });

    sortedLayout.forEach(word => {
        const key = `${word.starty},${word.startx}`;
        if (!numberMap.has(key)) {
            numberMap.set(key, clueNumber++);
        }
        const number = numberMap.get(key);

        for (let i = 0; i < word.answer.length; i++) {
            const row = word.orientation === 'down' ? word.starty + i : word.starty;
            const col = word.orientation === 'across' ? word.startx + i : word.startx;

            const existingCell = grid[row][col];
            grid[row][col] = {
                letter: existingCell ? existingCell.letter : "",
                isBlack: false,
                answer: word.answer[i],
                number: (i === 0 ? number : undefined) || (existingCell ? existingCell.number : undefined)
            };
        }

        clues[word.orientation].push({
            number,
            clue: word.clue
        });
    });

    return { grid, clues };
}

// Define all crossword word sets
const CROSSWORD_WORDS = [
    // Crossword 1
    [
        { answer: "PARIS", clue: "Capital of France" },
        { answer: "HOT", clue: "Opposite of cold" },
        { answer: "COMPUTER", clue: "Device used to compute" },
        { answer: "JUPITER", clue: "Largest planet" },
        { answer: "RED", clue: "Primary color" },
        { answer: "APRIL", clue: "Month after March" }
    ],
    // Crossword 2
    [
        { answer: "CHEETAH", clue: "Fast animal" },
        { answer: "SATURDAY", clue: "Day after Friday" },
        { answer: "WATER", clue: "Liquid we drink" },
        { answer: "OXYGEN", clue: "Gas we breathe" },
        { answer: "WEEK", clue: "7 days make a ___" },
        { answer: "SHORT", clue: "Opposite of tall" }
    ],
    // Crossword 3
    [
        { answer: "JAVA", clue: "Programming language by Sun" },
        { answer: "SUN", clue: "Star at center of solar system" },
        { answer: "PHONE", clue: "Device to call someone" },
        { answer: "OWL", clue: "Bird that hoots" },
        { answer: "LOOP", clue: "Repeating code structure" },
        { answer: "CODE", clue: "Instructions for computer" },
        { answer: "NODE", clue: "JavaScript runtime" },
        { answer: "OPEN", clue: "Opposite of closed" },
        { answer: "NOON", clue: "12 PM" },
        { answer: "POOL", clue: "Place to swim" }
    ],
    // Crossword 4
    [
        { answer: "GOLD", clue: "Precious yellow metal" },
        { answer: "DOWN", clue: "Opposite of up" },
        { answer: "OCEAN", clue: "Large body of salty water" },
        { answer: "FOUR", clue: "2 + 2 =" },
        { answer: "GOOGLE", clue: "Web search giant" },
        { answer: "STAR", clue: "Night sky light" }
    ],
    // Crossword 5
    [
        { answer: "EARTH", clue: "Planet we live on" },
        { answer: "RACE", clue: "Fast running sport" },
        { answer: "NIGHT", clue: "Opposite of day" },
        { answer: "LION", clue: "King of jungle" },
        { answer: "ICE", clue: "Frozen water" },
        { answer: "YEAR", clue: "12 months make a ___" }
    ],
    // Crossword 6
    [
        { answer: "INSTAGRAM", clue: "Social media platform" },
        { answer: "RIGHT", clue: "Opposite of left" },
        { answer: "TRIANGLE", clue: "Shape with three sides" },
        { answer: "KEYBOARD", clue: "Device to type" },
        { answer: "CLOSED", clue: "Opposite of open" },
        { answer: "MINUTE", clue: "60 seconds make a ___" }
    ],
    // Crossword 7
    [
        { answer: "GARDEN", clue: "Place to grow plants" },
        { answer: "GREEN", clue: "Color of grass" },
        { answer: "GRAPE", clue: "Small purple fruit" },
        { answer: "ANGER", clue: "Strong feeling of upset" },
        { answer: "RANGE", clue: "Area or scope" },
        { answer: "EAGER", clue: "Very excited or keen" }
    ],
    // Crossword 8
    [
        { answer: "WHALE", clue: "Largest mammal" },
        { answer: "DEBUG", clue: "Programming term for bug fixing" },
        { answer: "SLOW", clue: "Opposite of fast" },
        { answer: "LAPTOP", clue: "Device to browse internet" },
        { answer: "DELHI", clue: "Capital of India" },
        { answer: "CENTURY", clue: "100 years" }
    ],
    // Crossword 9
    [
        { answer: "POOR", clue: "Opposite of rich" },
        { answer: "APPLE", clue: "Red fruit" },
        { answer: "CSS", clue: "Language for styling web" },
        { answer: "TEN", clue: "5 + 5" },
        { answer: "BIKE", clue: "Vehicle with two wheels" },
        { answer: "ARMSTRONG", clue: "First man on moon" }
    ],
    // Crossword 10
    [
        { answer: "PLANET", clue: "Earth is one" },
        { answer: "PLANT", clue: "Living green organism" },
        { answer: "LANTERN", clue: "Portable light" },
        { answer: "TENT", clue: "Camping shelter" },
        { answer: "ANT", clue: "Small hardworking insect" },
        { answer: "NEAT", clue: "Clean and organized" }
    ],
    // Crossword 11
    [
        { answer: "FALSE", clue: "Opposite of true" },
        { answer: "SQUARE", clue: "Shape with four equal sides" },
        { answer: "END", clue: "Opposite of begin" },
        { answer: "SPIDER", clue: "8 legs animal" },
        { answer: "SOUTH", clue: "Opposite of north" },
        { answer: "REMOTE", clue: "Device to watch TV" }
    ],
    // Crossword 12
    [
        { answer: "CHEETAH", clue: "Fastest land animal" },
        { answer: "LATE", clue: "Opposite of early" },
        { answer: "HONEY", clue: "Sweet made by bees" },
        { answer: "TOKYO", clue: "Capital of Japan" },
        { answer: "LOW", clue: "Opposite of high" },
        { answer: "PRINTER", clue: "Device to print" }
    ],
    // Crossword 13
    [
        { answer: "FAILURE", clue: "Opposite of success" },
        { answer: "MARS", clue: "Planet known as red planet" },
        { answer: "JAVASCRIPT", clue: "Programming language for web" },
        { answer: "WEAK", clue: "Opposite of strong" },
        { answer: "CIRCLE", clue: "Shape with no sides" },
        { answer: "YEAR", clue: "365 days" }
    ],
    // Crossword 14
    [
        { answer: "RUPEES", clue: "Indian currency" },
        { answer: "SLOW", clue: "Opposite of fast" },
        { answer: "ELEPHANT", clue: "Animal with trunk" },
        { answer: "ENEMY", clue: "Opposite of friend" },
        { answer: "CALCULATOR", clue: "Device to calculate" },
        { answer: "ICE", clue: "Frozen dessert" }
    ],
    // Crossword 15
    [
        { answer: "CRY", clue: "Opposite of laugh" },
        { answer: "HELIUM", clue: "Gas used in balloons" },
        { answer: "LINKEDIN", clue: "Social network for jobs" },
        { answer: "DRY", clue: "Opposite of wet" },
        { answer: "HTML", clue: "Web page language" },
        { answer: "HOUR", clue: "60 minutes" }
    ],
    // Crossword 16
    [
        { answer: "BAKE", clue: "Cook in an oven" },
        { answer: "CAKE", clue: "Sweet dessert" },
        { answer: "FAKE", clue: "Not real" },
        { answer: "LAKE", clue: "Body of water" },
        { answer: "MAKE", clue: "Create or build" },
        { answer: "RAKE", clue: "Garden tool" },
        { answer: "SAKE", clue: "For the ___ of" },
        { answer: "TAKE", clue: "To grab" },
        { answer: "WAKE", clue: "Stop sleeping" },
        { answer: "SNAKE", clue: "Slithering reptile" }
    ],
    // Crossword 17
    [
        { answer: "SAD", clue: "Opposite of happy" },
        { answer: "SAHARA", clue: "Largest desert" },
        { answer: "CONSOLE", clue: "Device for gaming" },
        { answer: "PULL", clue: "Opposite of push" },
        { answer: "WEST", clue: "Opposite of east" },
        { answer: "CLOCK", clue: "Device to measure time" }
    ],
    // Crossword 18
    [
        { answer: "LIGHT", clue: "Opposite of heavy" },
        { answer: "ORANGE", clue: "Red + Yellow =" },
        { answer: "MONITOR", clue: "Part of computer to see output" },
        { answer: "NEW", clue: "Opposite of old" },
        { answer: "TRIANGLE", clue: "3 sides shape" },
        { answer: "JACKSON", clue: "King of pop" }
    ],
    // Crossword 19
    [
        { answer: "SILVER", clue: "Precious gray metal" },
        { answer: "RIVER", clue: "Large flowing water body" },
        { answer: "LIVER", clue: "Body organ" },
        { answer: "SERVICE", clue: "Help or assistance" },
        { answer: "RESCUE", clue: "Save from danger" },
        { answer: "USER", clue: "Person using a system" }
    ],
    // Crossword 20
    [
        { answer: "COLD", clue: "Opposite of hot" },
        { answer: "PACIFIC", clue: "Largest ocean" },
        { answer: "ROCKET", clue: "Vehicle for space" },
        { answer: "FAST", clue: "Opposite of slow" },
        { answer: "COMPUTER", clue: "Device to compute" },
        { answer: "RIGHT", clue: "90 degrees angle" }
    ],
    // Crossword 21
    [
        { answer: "DIRTY", clue: "Opposite of clean" },
        { answer: "CSHARP", clue: "Programming language by Microsoft" },
        { answer: "CARBON", clue: "Gas plant uses" },
        { answer: "SMALL", clue: "Opposite of big" },
        { answer: "PENTAGON", clue: "Shape with 5 sides" },
        { answer: "JUBILEE", clue: "50 years" }
    ],
    // Crossword 22
    [
        { answer: "DULL", clue: "Opposite of smart" },
        { answer: "ROME", clue: "Capital of Italy" },
        { answer: "COW", clue: "Animal that gives milk" },
        { answer: "EXIT", clue: "Opposite of entry" },
        { answer: "BROWSER", clue: "Device to surf web" },
        { answer: "STRAIGHT", clue: "180 degrees" }
    ],
    // Crossword 23
    [
        { answer: "WEAK", clue: "Opposite of strong" },
        { answer: "DISK", clue: "Device to store data" },
        { answer: "PENGUIN", clue: "Bird that swims" },
        { answer: "SELL", clue: "Opposite of buy" },
        { answer: "CAR", clue: "4 wheels vehicle" },
        { answer: "WASHINGTON", clue: "Capital of USA" }
    ],
    // Crossword 24
    [
        { answer: "LOSS", clue: "Opposite of gain" },
        { answer: "PYTHON", clue: "Programming language" },
        { answer: "ENEMY", clue: "Opposite of friend" },
        { answer: "DECADE", clue: "10 years" },
        { answer: "DOWN", clue: "Opposite of up" },
        { answer: "GMAIL", clue: "Device to send mail" }
    ],
    // Crossword 25
    [
        { answer: "SOFT", clue: "Opposite of hard" },
        { answer: "DELHI", clue: "Indian capital" },
        { answer: "RADIO", clue: "Device for communication" },
        { answer: "FAIL", clue: "Opposite of success" },
        { answer: "TWO", clue: "1 + 1" },
        { answer: "SATURN", clue: "Planet known for rings" }
    ]
];

// Generate layouts for each crossword
const generatedLayouts = CROSSWORD_WORDS.map((words, index) => {
    const layout = generateLayout(words);
    // Filter out words that weren't placed (orientation: "none")
    const placedWords = (layout.result || []).filter(word => word.orientation !== 'none');

    return {
        id: index + 1,
        title: `Puzzle ${index + 1}`,
        difficulty: index < 10 ? "Easy" : "Medium",
        ...layoutToGrid(placedWords)
    };
});

export const CROSSWORD_LEVELS = generatedLayouts;
