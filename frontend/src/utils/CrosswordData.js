export const CROSSWORD_LEVELS = [
    {
        id: 1,
        title: "Animals",
        grid: [
            // 7x7 Grid
            [{ letter: "", isBlack: false, number: 1, answer: "C" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, answer: "T" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 2, answer: "D" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "G" }],
            [{ letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "W" }, { letter: "", isBlack: false, number: 3, answer: "B" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, number: 4, answer: "F" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: false, answer: "H" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }]
        ],
        clues: {
            across: [
                { number: 1, clue: "Feline pets" },              // CATS
                { number: 2, clue: "Canine pet" },               // DOG
                { number: 3, clue: "Flying animals" },           // BIRDS
                { number: 4, clue: "Aquatic animal" }            // FISH
            ],
            down: [
                { number: 1, clue: "Farm animals" },             // COWS (C-O-W-S)
                { number: 2, clue: "Waterfowl" },                // DUCKS (D-U-C-K-S) - wait only D-U
                { number: 3, clue: "Honey makers" }              // BEARS (B-E-A-R-S)
            ]
        }
    },
    {
        id: 2,
        title: "Food & Cooking",
        grid: [
            // 8x8 Grid
            [{ letter: "", isBlack: false, number: 1, answer: "B" }, { letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 2, answer: "M" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "L" }, { letter: "", isBlack: false, answer: "K" }],
            [{ letter: "", isBlack: false, answer: "K" }, { letter: "", isBlack: false, number: 3, answer: "R" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "C" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 4, answer: "M" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, answer: "T" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 5, answer: "E" }, { letter: "", isBlack: false, answer: "G" }, { letter: "", isBlack: false, answer: "G" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }]
        ],
        clues: {
            across: [
                { number: 1, clue: "Baked loaf" },               // BREAD
                { number: 2, clue: "Dairy drink" },              // MILK
                { number: 3, clue: "Grain staple" },             // RICE
                { number: 4, clue: "Protein food" },             // MEAT
                { number: 5, clue: "Breakfast food" }            // EGGS
            ],
            down: [
                { number: 1, clue: "Cooking method" },           // BAKE (B-A-K-E)
                { number: 2, clue: "Dairy drink" }               // MILK (duplicate)
            ]
        }
    },
    {
        id: 3,
        title: "Sports & Games",
        grid: [
            // 7x7 Grid
            [{ letter: "", isBlack: false, number: 1, answer: "R" }, { letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 2, answer: "S" }, { letter: "", isBlack: false, answer: "K" }, { letter: "", isBlack: false, answer: "I" }],
            [{ letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "W" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "C" }, { letter: "", isBlack: false, number: 3, answer: "S" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "C" }, { letter: "", isBlack: false, answer: "C" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "R" }],
            [{ letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "W" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, number: 4, answer: "T" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "S" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "M" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }]
        ],
        clues: {
            across: [
                { number: 1, clue: "Sprint" },                   // RUN
                { number: 2, clue: "Winter sport" },             // SKI
                { number: 3, clue: "Football game" },            // SOCCER
                { number: 4, clue: "Racket sport" }              // TENNIS
            ],
            down: [
                { number: 1, clue: "Competition" },              // RACE (R-A-C-E)
                { number: 2, clue: "Water activity" },           // SWIM (S-W-I-M)
                { number: 3, clue: "Water activity" }            // SWIM (duplicate)
            ]
        }
    },
    {
        id: 4,
        title: "Nature & Weather",
        grid: [
            // 8x8 Grid
            [{ letter: "", isBlack: false, number: 1, answer: "T" }, { letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "H" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 2, answer: "R" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, answer: "I" }, { letter: "", isBlack: false, answer: "N" }],
            [{ letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: false, number: 3, answer: "C" }, { letter: "", isBlack: false, answer: "L" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: false, number: 4, answer: "S" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "W" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }]
        ],
        clues: {
            across: [
                { number: 1, clue: "Tall plants" },              // TREES
                { number: 2, clue: "Water from sky" },           // RAIN
                { number: 3, clue: "Sky formations" },           // CLOUDS
                { number: 4, clue: "White winter weather" }      // SNOW
            ],
            down: [
                { number: 1, clue: "Storm sound" },              // THUNDER (T-H-U-N-D-E-R)
                { number: 2, clue: "Water from sky" },           // RAIN (duplicate)
                { number: 3, clue: "Sky formations" },           // CLOUDS (duplicate)
                { number: 4, clue: "Bright star" }               // SUN (S-U-N)
            ]
        }
    },
    {
        id: 5,
        title: "School & Learning",
        grid: [
            // 7x7 Grid
            [{ letter: "", isBlack: false, number: 1, answer: "P" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "N" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, number: 2, answer: "B" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "O" }, { letter: "", isBlack: false, answer: "K" }, { letter: "", isBlack: false, answer: "S" }],
            [{ letter: "", isBlack: false, answer: "P" }, { letter: "", isBlack: false, number: 3, answer: "D" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "S" }, { letter: "", isBlack: false, answer: "K" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: false, number: 4, answer: "R" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: false, answer: "A" }, { letter: "", isBlack: false, answer: "D" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "U" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "L" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "E" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }],
            [{ letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: false, answer: "R" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }, { letter: "", isBlack: true, answer: "" }]
        ],
        clues: {
            across: [
                { number: 1, clue: "Writing tools" },            // PENS
                { number: 2, clue: "Reading materials" },        // BOOKS
                { number: 3, clue: "Study table" },              // DESK
                { number: 4, clue: "Study activity" }            // READ
            ],
            down: [
                { number: 1, clue: "Sheets of writing" },        // PAPER (P-A-P-E-R)
                { number: 2, clue: "Reading materials" },        // BOOKS (duplicate)
                { number: 3, clue: "Measuring tool" },           // DRULER (D-R-U-L-E-R) - wait that's not right
                { number: 4, clue: "Measuring stick" }           // RULER (R-U-L-E-R)
            ]
        }
    }
];
