export const ROOF_HOOKS = [
    {
        TILED: [
            { type: "HYBRID", key: "TILEDHYBRID", product: "[1HME15DD003] dakhaak dubbel verstelbaar rvs [Type: Hybride]" },
            { type: "LONG", key: "TILEDLONG", product: "[1HME15DD002] dakhaak dubbel verstelbaar rvs [Type: Lange tegel]" },
            { type: "NORMAL", key: "TILEDNORMAL", product: "[1HME15DD001] dakhaak dubbel verstelbaar rvs [Type: Standaard]" },
            { type: "OPTIMUM", key: "TILEDOPTIMUM", product: "[1HME15DD009] dakhaak dubbel verstelbaar rvs [Type: Optimum]" },
            { type: "OPTI CLASSIC", key: "TILEDOPTI CLASSIC", product: "[1HME15DD011] dakhaak dubbel verstelbaar rvs [Type: Optimum classic]" }
        ]
    },
    {
        SLATES: [
            { type: "NORMAL", key: "SLATESNORMAL", product: "[1HME15DE002] dakhaak enkel verstelbaar lei [Daktype: Leien; Type: Plat]" }
        ]
    },
    {
        ZINC: [
            { type: "ROUND", key: "ZINCROUND", product: "[1HME15DV003] zinken dak klem [Type: Rond]" },
            { type: "STAND SEAM", key: "ZINCSTAND SEAM", product: "[1HME15DV006] zinken dak klem [Type: Staande naad]" }
        ]
    }
]

export const PROFILE_POSITION = [
    {
        landscape: {
            horizontal: "HORIZONTAL",
            vertical: "VERTICAL"
        }
    },
    {
        portrait: {
            horizontal: "HORIZONTAL",
            vertical: "VERTICAL"
        }
    }
];

export const TRIANGLES = [
    { times: 1, landscape: null, portrait: "[1FLD19ZZ001] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 1PT/2LS]" },
    { times: 2, landscape: "[1FLD19ZZ001] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 1PT/2LS]", portrait: "[1FLD19ZZ002] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 2PT/3LS]" },
    { times: 3, landscape: "[1FLD19ZZ002] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 2PT/3LS]", portrait: "[1FLD19ZZ004] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 3PT/5LS]" },
    { times: 4, landscape: "[1FLD19ZZ003] verstelbare schans [Oriëntatie: Landscape; Maat: 4LS]", portrait: null },
    { times: 5, landscape: "[1FLD19ZZ004] verstelbare schans [Oriëntatie: Portriat/Landscape; Maat: 3PT/5LS]", portrait: null }
];


export const TRIANGLE_WIDTH = {
    "EAST/WEST": "2450",
    "SOUTH": ["1500", "1600"]
};

export const PLATES = {
    LANDSCAPE: ["15CM", "40CM", "Connecting Plate"],
    PORTRAIT: ["40CM", "Connecting Plate"]
};


export const PROFILES = {
    "HOUSE": {

        "PROFILES_COLOR": "ALU"
    },
    "FEATHER": {
        "PROFILES_COLOR": "BLACK"
    }

};


export const SCREW_MOUNTING_ANCHOR = {
    CONCRETE: [
        "6.3X45MM",
        "6.3X160MM",
        "6.3X180MM",
        "6.3X200MM",
        "6.7X160MM"
    ],
    "WOOD/STEEL": [
        "4.5X50MM",
        "4.8X150MM",
        "4.8X180MM",
        "4.8X210MM",
        "4.8X240MM"
    ]
};

