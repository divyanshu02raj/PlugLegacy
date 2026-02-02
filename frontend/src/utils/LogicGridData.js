export const LOGIC_PUZZLES = [
    {
        id: 1,
        title: "Favorite Colors",
        difficulty: "Easy",
        categories: {
            rows: ["Alice", "Bob", "Carol"],
            cols: ["Red", "Blue", "Green"]
        },
        clues: [
            "Alice doesn't like red.",
            "Bob's favorite isn't green.",
            "Carol loves blue."
        ],
        solution: [
            ["false", "true", "false"],   // Alice: Red=X, Blue=✓, Green=X
            ["true", "false", "false"],    // Bob: Red=✓, Blue=X, Green=X
            ["false", "false", "true"]     // Carol: Red=X, Blue=X, Green=✓
        ]
    },
    {
        id: 2,
        title: "Pet Owners",
        difficulty: "Medium",
        categories: {
            rows: ["Emma", "Jack", "Lily", "Noah"],
            cols: ["Cat", "Dog", "Fish", "Bird"]
        },
        clues: [
            "Emma doesn't own a cat or dog.",
            "Jack has a bird.",
            "Lily's pet isn't a fish.",
            "Noah owns a cat."
        ],
        solution: [
            ["false", "false", "true", "false"],   // Emma: Fish
            ["false", "false", "false", "true"],    // Jack: Bird
            ["false", "true", "false", "false"],    // Lily: Dog
            ["true", "false", "false", "false"]     // Noah: Cat
        ]
    },
    {
        id: 3,
        title: "House Colors",
        difficulty: "Medium",
        categories: {
            rows: ["House 1", "House 2", "House 3", "House 4"],
            cols: ["Red", "Blue", "Green", "Yellow"]
        },
        clues: [
            "House 1 is not red or blue.",
            "House 2 is blue.",
            "House 3 is not green.",
            "House 4 is red."
        ],
        solution: [
            ["false", "false", "true", "false"],    // House 1: Green
            ["false", "true", "false", "false"],     // House 2: Blue
            ["false", "false", "false", "true"],     // House 3: Yellow
            ["true", "false", "false", "false"]      // House 4: Red
        ]
    },
    {
        id: 4,
        title: "Professions",
        difficulty: "Hard",
        categories: {
            rows: ["Anna", "Ben", "Clara", "David", "Eva"],
            cols: ["Doctor", "Teacher", "Engineer", "Artist", "Chef"]
        },
        clues: [
            "Anna is not a doctor or teacher.",
            "Ben is an engineer.",
            "Clara is not an artist or chef.",
            "David is a teacher.",
            "Eva is not a doctor."
        ],
        solution: [
            ["false", "false", "false", "true", "false"],   // Anna: Artist
            ["false", "false", "true", "false", "false"],    // Ben: Engineer
            ["true", "false", "false", "false", "false"],    // Clara: Doctor
            ["false", "true", "false", "false", "false"],    // David: Teacher
            ["false", "false", "false", "false", "true"]     // Eva: Chef
        ]
    },
    {
        id: 5,
        title: "Vacation Destinations",
        difficulty: "Hard",
        categories: {
            rows: ["Alice", "Bob", "Carol", "Dan", "Eve"],
            cols: ["Paris", "Tokyo", "NYC", "London", "Rome"]
        },
        clues: [
            "Alice is going to Paris.",
            "Bob is not going to Tokyo or NYC.",
            "Carol is going to London.",
            "Dan is not going to Rome.",
            "Eve is going to Tokyo."
        ],
        solution: [
            ["true", "false", "false", "false", "false"],    // Alice: Paris
            ["false", "false", "false", "false", "true"],    // Bob: Rome
            ["false", "false", "false", "true", "false"],    // Carol: London
            ["false", "false", "true", "false", "false"],    // Dan: NYC
            ["false", "true", "false", "false", "false"]     // Eve: Tokyo
        ]
    }
];
