export const mapCarP1DoksToIracing = (car: string): string => {
  const mapping: Record<string, string> = {
    "Acura NSX GT3 EVO 22": "acuransxevo22gt3",
    "Audi R8 LMS GT3 EVO II": "audir8lmsevo2gt3",
    "BMW M4 GT3": "bmwm4gt3",
    "Chevrolet Corvette Z06 GT3.R": "chevyvettez06rgt3",
    "Ferrari 296 GT3": "ferrari296gt3",
    "Ford Mustang GT3": "fordmustanggt3",
    "Lamborghini Huracán GT3 EVO": "lamborghinievogt3",
    "McLaren 720S GT3 EVO": "mclaren720sgt3",
    "Mercedes-AMG GT3 2020": "mercedesamgevogt3",
    "Porsche 911 GT3 R (992)": "porsche992rgt3",
  };
  return mapping[car] || car;
};

export const mapTrackP1DoksToWBR = (track: string): string => {
  const mapping: Record<string, string> = {
    "Silverstone Circuit": "Silverstone Circuit - Grand Prix",
  };
  return mapping[track] || track;
};

export const mapSeasonP1DoksToWBR = (season: string): string => {
  const mapping: Record<string, string> = {
    "Season 3": "2025 Season 3",
  };
  return mapping[season] || season;
};
