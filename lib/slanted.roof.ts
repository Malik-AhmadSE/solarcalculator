import { ROOF_HOOKS, PROFILE_POSITION, PROFILES } from "../data/RoofTypes";
import { products } from "../data/data";
import { SystemHeight, SystemWidth, lookupRoofHook } from "./systemCalculation";

export interface SlantedRoofProps {
    panelOrientation: "landscape" | "portrait";
    rows: number;
    columns: number;
    height: number;
    width: number;
    roofing: "TILED" | "SLATES" | "ZINC";
    roofHook: string;
    profileType: "HOUSE" | "FEATHER";
    profileColor: "ALU" | "BLACK";
    clamps: "ALU" | "BLACK";
    Thickness: number;
}

export const slantedRoof = (props: SlantedRoofProps) => {
    const {
        panelOrientation,
        rows,
        columns,
        height,
        width,
        roofing,
        roofHook,
        profileType,
        profileColor,
        clamps,
        Thickness
    } = props;

    const bom: any[] = [];
    const systemWidth = SystemWidth(props);
    const systemHeight = SystemHeight(props);

    const profileInfo = lookupRoofHook(roofing, roofHook);
    const profileCode = profileInfo.split(']')[0].replace('[', '') || "CODE_NOT_FOUND";
    const baseQuantity = products.find((product) => product.code === profileCode)?.pack;


    bom.push({
        code: profileCode,
        quantity: baseQuantity,
        description: profileInfo || `Profile ${profileType} ${profileColor}`
    });

    // row2 
    // row2
    if (roofing === "ZINC" || roofHook === "HYBRID") {

        if (profileType === "FEATHER") {
            if (profileColor === "BLACK") {
                bom.push({
                    code: "1HME43ZW044",
                    quantity: products.find(p => p.code === "1HME43ZW044")?.pack,
                    description: products.find(p => p.code === "1HME43ZW044")?.description
                });
            } else {
                bom.push({
                    code: "1HME43ZW041",
                    quantity: products.find(p => p.code === "1HME43ZW041")?.pack,
                    description: products.find(p => p.code === "1HME43ZW041")?.description
                });
            }
        }
        else {
            if (profileColor === "BLACK") {
                bom.push({
                    code: "1HME43ZW041",
                    quantity: products.find(p => p.code === "1HME43ZW041")?.pack,
                    description: products.find(p => p.code === "1HME43ZW041")?.description
                });
            } else {
                bom.push({
                    code: "1HME43AL050",
                    quantity: products.find(p => p.code === "1HME43AL050")?.pack,
                    description: products.find(p => p.code === "1HME43AL050")?.description
                });
            }
        }

    }
    else if (roofing === "TILED") {

        bom.push({
            code: "1HME46HT004",
            quantity: products.find(p => p.code === "1HME46HT004")?.pack,
            description: products.find(p => p.code === "1HME46HT004")?.description
        });

    }
    else if (roofing === "SLATES") {

        bom.push({
            code: "1HME46HT001",
            quantity: products.find(p => p.code === "1HME46HT001")?.pack,
            description: products.find(p => p.code === "1HME46HT001")?.description
        });

    }
    else {
        bom.push({
            code: "",
            quantity: "",
            description: ""
        });
    }


    // row 3 

    if (roofing === "ZINC" || roofHook === "HYBRID") {
        if (profileColor === 'BLACK') {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPV002")?.code,
                quantity: products.find((product) => product.code === "1HMEACPV002")?.pack,
                description: products.find((product) => product.code === "1HMEACPV002")?.description
            });
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPV001")?.code,
                quantity: products.find((product) => product.code === "1HMEACPV001")?.pack,
                description: products.find((product) => product.code === "1HMEACPV001")?.description
            });
        }

    }
    else if (profileType === "FEATHER") {
        if (profileColor === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME43ZW044")?.code,
                quantity: products.find((product) => product.code === "1HME43ZW044")?.pack,
                description: products.find((product) => product.code === "1HME43ZW044")?.description
            });
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HME43AL035")?.code,
                quantity: products.find((product) => product.code === "1HME43AL035")?.pack,
                description: products.find((product) => product.code === "1HME43AL035")?.description
            });
        }
    }
    else {
        if (profileColor === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME43ZW041")?.code,
                quantity: products.find((product) => product.code === "1HME43ZW041")?.pack,
                description: products.find((product) => product.code === "1HME43ZW041")?.description
            });
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HME43AL050")?.code,
                quantity: products.find((product) => product.code === "1HME43AL050")?.pack,
                description: products.find((product) => product.code === "1HME43AL050")?.description
            });
        }
    }

    // row 4 

    if (roofing === "ZINC" || roofHook === "HYBRID") {
        bom.push({
            code: products.find((product) => product.code === "1HME10BT037")?.code,
            quantity: products.find((product) => product.code === "1HME10BT037")?.pack,
            description: products.find((product) => product.code === "1HME10BT037")?.description
        });
    }
    else {
        if (profileColor === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPV002")?.code,
                quantity: products.find((product) => product.code === "1HMEACPV002")?.pack,
                description: products.find((product) => product.code === "1HMEACPV002")?.description
            });
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPV001")?.code,
                quantity: products.find((product) => product.code === "1HMEACPV001")?.pack,
                description: products.find((product) => product.code === "1HMEACPV001")?.description
            });
        }
    }


    //row 5

    if (roofing === "ZINC" || roofHook === "HYBRID") {
        bom.push({
            code: products.find((product) => product.code === "1HME10MR001")?.code,
            quantity: products.find((product) => product.code === "1HME10MR001")?.pack,
            description: products.find((product) => product.code === "1HME10MR001")?.description
        });
    }
    else {
        bom.push({
            code: products.find((product) => product.code === "1HME10BT037")?.code,
            quantity: products.find((product) => product.code === "1HME10BT037")?.pack,
            description: products.find((product) => product.code === "1HME10BT037")?.description
        })
    }

    //row 6
    if (roofing === "ZINC" || roofHook === "HYBRID") {
        if (clamps === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME32KK004")?.code,
                quantity: products.find((product) => product.code === "1HME32KK004")?.pack,
                description: products.find((product) => product.code === "1HME32KK004")?.description
            })
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HME32KK003")?.code,
                quantity: products.find((product) => product.code === "1HME32KK003")?.pack,
                description: products.find((product) => product.code === "1HME32KK003")?.description
            })
        }
    }
    else {
        bom.push({
            code: products.find((product) => product.code === "1HME10MR001")?.code,
            quantity: products.find((product) => product.code === "1HME10MR001")?.pack,
            description: products.find((product) => product.code === "1HME10MR001")?.description
        })
    }
    // row 7
    if (roofing === "ZINC" || roofHook === "HYBRID") {
        if (clamps === "BLACK") {
            if (Thickness > 30) {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK016")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK016")?.pack,
                    description: products.find((product) => product.code === "1HME32KK016")?.description
                })
            }
            else {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK025")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK025")?.pack,
                    description: products.find((product) => product.code === "1HME32KK025")?.description
                })
            }
        }
        else {
            if (Thickness > 30) {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK010")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK010")?.pack,
                    description: products.find((product) => product.code === "1HME32KK010")?.description
                })
            }
            else {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK024")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK024")?.pack,
                    description: products.find((product) => product.code === "1HME32KK024")?.description
                })
            }
        }
    } else {
        if (clamps === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME32KK004")?.code,
                quantity: products.find((product) => product.code === "1HME32KK004")?.pack,
                description: products.find((product) => product.code === "1HME32KK004")?.description
            })
        } else {
            bom.push({
                code: products.find((product) => product.code === "1HME32KK003")?.code,
                quantity: products.find((product) => product.code === "1HME32KK003")?.pack,
                description: products.find((product) => product.code === "1HME32KK003")?.description
            })
        }

    }


    // row 8

    if (roofing === "ZINC" || roofHook === "HYBRID") {
        if (clamps === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME0ACPS001")?.code,
                quantity: products.find((product) => product.code === "1HME0ACPS001")?.pack,
                description: products.find((product) => product.code === "1HME0ACPS001")?.description
            })
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPS002")?.code,
                quantity: products.find((product) => product.code === "1HMEACPS002")?.pack,
                description: products.find((product) => product.code === "1HMEACPS002")?.description
            })
        }
    }
    else {
        if (clamps === "BLACK") {
            if (Thickness > 30) {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK016")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK016")?.pack,
                    description: products.find((product) => product.code === "1HME32KK016")?.description
                })
            }
            else {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK025")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK025")?.pack,
                    description: products.find((product) => product.code === "1HME32KK025")?.description
                })
            }
        } else {
            if (Thickness > 30) {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK010")?.code,
                    quantity: products.find((product) => product.code === "1HME32KK010")?.pack,
                    description: products.find((product) => product.code === "1HME32KK010")?.description
                })
            }
            else {
                bom.push({
                    code: products.find((product) => product.code === "1HME32KK024")?.code,
                    quantity: products.find((product) => product.code === "1HMEACPS002")?.pack,
                    description: products.find((product) => product.code === "1HMEACPS002")?.description
                })
            }
        }
    }
    // row 9

    if (roofing === "ZINC" || roofHook === "HYBRID") {
        bom.push({
            code: "",
            quantity: null,
            description: ""
        })
    }
    else {
        if (clamps === "BLACK") {
            bom.push({
                code: products.find((product) => product.code === "1HME0ACPS001")?.code,
                quantity: products.find((product) => product.code === "1HME0ACPS001")?.pack,
                description: products.find((product) => product.code === "1HME0ACPS001")?.description
            })
        }
        else {
            bom.push({
                code: products.find((product) => product.code === "1HMEACPS002")?.code,
                quantity: products.find((product) => product.code === "1HMEACPS002")?.pack,
                description: products.find((product) => product.code === "1HMEACPS002")?.description
            })
        }

    }


    return bom;
};