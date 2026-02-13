import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type TrackMappingService = 'p1doks' | 'hymo';

export interface UnifiedTrackMapping {
  canonicalName: string;
  sources: {
    p1doks?: string[];
    hymo?: string[];
  };
  isDefault?: boolean;
}

interface TrackMappingContextType {
  trackMappings: UnifiedTrackMapping[];
  addMapping: (canonicalName: string, service: TrackMappingService, sourceName: string) => void;
  removeMapping: (index: number) => void;
  editMapping: (index: number, mapping: UnifiedTrackMapping) => void;
  replaceMappings: (mappings: UnifiedTrackMapping[]) => void;
  getServiceTrackMappings: (service: TrackMappingService) => Record<string, string>;
  getCanonicalNames: () => string[];
}

const TrackMappingContext = createContext<TrackMappingContextType | undefined>(undefined);

// Normalize a source value from old format (string) or new format (string[])
function normalizeSource(source: string | string[] | undefined): string[] | undefined {
  if (!source) return undefined;
  if (Array.isArray(source)) return source;
  return [source];
}

// Normalize an entire mapping to ensure sources are arrays
function normalizeMapping(mapping: any): UnifiedTrackMapping {
  return {
    canonicalName: mapping.canonicalName,
    sources: {
      p1doks: normalizeSource(mapping.sources?.p1doks),
      hymo: normalizeSource(mapping.sources?.hymo),
    },
    isDefault: mapping.isDefault,
  };
}

const DEFAULT_TRACK_MAPPINGS: UnifiedTrackMapping[] = [
  { canonicalName: 'Adelaide Street Circuit', sources: { p1doks: ['Adelaide Street Circuit'] }, isDefault: true },
  { canonicalName: 'Acura Grand Prix of Long Beach', sources: { p1doks: ['Acura Grand Prix of Long Beach'] }, isDefault: true },
  { canonicalName: 'Atlanta Motor Speedway', sources: { p1doks: ['Atlanta Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Autodromo Hermanos Rodriguez', sources: { p1doks: ['Autódromo Hermanos Rodríguez'] }, isDefault: true },
  { canonicalName: 'Autodromo Internacional do Algarve', sources: { p1doks: ['Autódromo Internacional do Algarve'] }, isDefault: true },
  { canonicalName: 'Autodromo Internazionale del Mugello', sources: { p1doks: ['Autodromo Internazionale del Mugello'] }, isDefault: true },
  { canonicalName: 'Autodromo Internazionale Enzo e Dino Ferrari', sources: { p1doks: ['Autodromo Internazionale Enzo e Dino Ferrari'] }, isDefault: true },
  { canonicalName: 'Autodromo Jose Carlos Pace', sources: { p1doks: ['Autodromo Jose Carlos Pace'] }, isDefault: true },
  { canonicalName: 'Autodromo Nazionale Monza', sources: { p1doks: ['Autodromo Nazionale Monza'] }, isDefault: true },
  { canonicalName: "Bakersfield Speedway at Kevin Harvick's Kern Raceway", sources: { p1doks: ["Bakersfield Speedway at Kevin Harvick's Kern Raceway"] }, isDefault: true },
  { canonicalName: 'Barber Motorsports Park', sources: { p1doks: ['Barber Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Brands Hatch Circuit', sources: { p1doks: ['Brands Hatch Circuit'] }, isDefault: true },
  { canonicalName: 'Bristol Motor Speedway', sources: { p1doks: ['Bristol Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Cadwell Park Circuit', sources: { p1doks: ['Cadwell Park Circuit'] }, isDefault: true },
  { canonicalName: "Caffeine and Octane's Lanier Raceway", sources: { p1doks: ["Caffeine & Octane's Lanier Raceway"] }, isDefault: true },
  { canonicalName: 'Canadian Tire Motorsport Park', sources: { p1doks: ['Canadian Tire Motorsport Park'] }, isDefault: true },
  { canonicalName: 'Cedar Lake Speedway', sources: { p1doks: ['Cedar Lake Speedway'] }, isDefault: true },
  { canonicalName: 'Charlotte Motor Speedway', sources: { p1doks: ['Charlotte Motor Speedway'] }, isDefault: true },
  { canonicalName: '(Legacy) Charlotte Motor Speedway - 2008', sources: { p1doks: ['(Legacy) Charlotte Motor Speedway - 2008'] }, isDefault: true },
  { canonicalName: 'Chicago Street Course', sources: { p1doks: ['Chicago Street Course'] }, isDefault: true },
  { canonicalName: 'Chicagoland Speedway', sources: { p1doks: ['Chicagoland Speedway'] }, isDefault: true },
  { canonicalName: 'Circuit de Barcelona-Catalunya', sources: { p1doks: ['Circuit de Barcelona-Catalunya'] }, isDefault: true },
  { canonicalName: 'Circuit de Ledenon', sources: { p1doks: ['Circuit de Lédenon'] }, isDefault: true },
  { canonicalName: 'Circuit de Nevers Magny-Cours', sources: { p1doks: ['Circuit de Nevers Magny-Cours'] }, isDefault: true },
  { canonicalName: 'Circuit de Spa-Francorchamps', sources: { p1doks: ['Circuit de Spa-Francorchamps'] }, isDefault: true },
  { canonicalName: 'Circuit des 24 Heures du Mans', sources: { p1doks: ['Circuit des 24 Heures du Mans'] }, isDefault: true },
  { canonicalName: 'Circuit Gilles-Villeneuve', sources: { p1doks: ['Circuit Gilles-Villeneuve'] }, isDefault: true },
  { canonicalName: 'Circuit of the Americas', sources: { p1doks: ['Circuit of the Americas'] }, isDefault: true },
  { canonicalName: 'Circuit Paul Ricard', sources: { p1doks: ['Circuit Paul Ricard'] }, isDefault: true },
  { canonicalName: 'Circuit Zolder', sources: { p1doks: ['Circuit Zolder'] }, isDefault: true },
  { canonicalName: 'Circuit Zandvoort', sources: { p1doks: ['CM.com Circuit Zandvoort'] }, isDefault: true },
  { canonicalName: 'Circuito de Jerez', sources: { p1doks: ['Circuito de Jerez - Ángel Nieto'] }, isDefault: true },
  { canonicalName: 'Circuito de Navarra', sources: { p1doks: ['Circuito de Navarra'] }, isDefault: true },
  { canonicalName: 'Concord Speedway', sources: { p1doks: ['Concord Speedway'] }, isDefault: true },
  { canonicalName: 'Darlington Raceway', sources: { p1doks: ['Darlington Raceway'] }, isDefault: true },
  { canonicalName: 'Daytona International Speedway', sources: { p1doks: ['Daytona International Speedway'] }, isDefault: true },
  { canonicalName: 'Detroit Grand Prix at Belle Isle', sources: { p1doks: ['Detroit Grand Prix at Belle Isle'] }, isDefault: true },
  { canonicalName: 'Donington Park Circuit', sources: { p1doks: ['Donington Park Circuit'] }, isDefault: true },
  { canonicalName: 'Dover Motor Speedway', sources: { p1doks: ['Dover Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Eldora Speedway', sources: { p1doks: ['Eldora Speedway'] }, isDefault: true },
  { canonicalName: 'Fairbury American Legion Speedway', sources: { p1doks: ['Fairbury American Legion Speedway'] }, isDefault: true },
  { canonicalName: 'Firebird Motorsports Park', sources: { p1doks: ['Firebird Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Five Flags Speedway', sources: { p1doks: ['Five Flags Speedway'] }, isDefault: true },
  { canonicalName: 'Fuji International Speedway', sources: { p1doks: ['Fuji International Speedway'] }, isDefault: true },
  { canonicalName: 'Hickory Motor Speedway', sources: { p1doks: ['Hickory Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Hockenheimring Baden-Wurttemberg', sources: { p1doks: ['Hockenheimring Baden-Württemberg'] }, isDefault: true },
  { canonicalName: 'Homestead-Miami Speedway', sources: { p1doks: ['Homestead-Miami Speedway'] }, isDefault: true },
  { canonicalName: 'Hungaroring', sources: { p1doks: ['Hungaroring'] }, isDefault: true },
  { canonicalName: "Huset's Speedway", sources: { p1doks: ["Huset's Speedway"] }, isDefault: true },
  { canonicalName: 'I-55 Federated Auto Parts Raceway Park', sources: { p1doks: ['I-55 Federated Auto Parts Raceway Park'] }, isDefault: true },
  { canonicalName: 'Indianapolis Motor Speedway', sources: { p1doks: ['Indianapolis Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Iowa Speedway', sources: { p1doks: ['Iowa Speedway'] }, isDefault: true },
  { canonicalName: 'Irwindale Speedway and Event Center', sources: { p1doks: ['Irwindale Speedway & Event Center'] }, isDefault: true },
  { canonicalName: 'iRacing Superspeedway', sources: { p1doks: ['iRacing Superspeedway'] }, isDefault: true },
  { canonicalName: 'Kansas Speedway', sources: { p1doks: ['Kansas Speedway'] }, isDefault: true },
  { canonicalName: "Kevin Harvick's Kern Raceway", sources: { p1doks: ["Kevin Harvick's Kern Raceway"] }, isDefault: true },
  { canonicalName: 'Kentucky Speedway', sources: { p1doks: ['Kentucky Speedway'] }, isDefault: true },
  { canonicalName: '(Legacy) Kentucky Speedway - 2011', sources: { p1doks: ['(Legacy) Kentucky Speedway - 2011'] }, isDefault: true },
  { canonicalName: 'Knockhill Racing Circuit', sources: { p1doks: ['Knockhill Racing Circuit'] }, isDefault: true },
  { canonicalName: 'Knoxville Raceway', sources: { p1doks: ['Knoxville Raceway'] }, isDefault: true },
  { canonicalName: 'Kokomo Speedway', sources: { p1doks: ['Kokomo Speedway'] }, isDefault: true },
  { canonicalName: 'Lankebanen', sources: { p1doks: ['Lånkebanen'] }, isDefault: true },
  { canonicalName: "Larry King Law's Langley Speedway", sources: { p1doks: ["Larry King Law's Langley Speedway"] }, isDefault: true },
  { canonicalName: 'Las Vegas Motor Speedway', sources: { p1doks: ['Las Vegas Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Lernerville Speedway', sources: { p1doks: ['Lernerville Speedway'] }, isDefault: true },
  { canonicalName: 'Lime Rock Park', sources: { p1doks: ['Lime Rock Park'] }, isDefault: true },
  { canonicalName: '(Legacy) Lime Rock Park - 2008', sources: { p1doks: ['(Legacy) Lime Rock Park - 2008'] }, isDefault: true },
  { canonicalName: 'Lincoln Speedway', sources: { p1doks: ['Lincoln Speedway'] }, isDefault: true },
  { canonicalName: 'Los Angeles Memorial Coliseum Raceway', sources: { p1doks: ['Los Angeles Memorial Coliseum Raceway'] }, isDefault: true },
  { canonicalName: 'Lucas Oil Indianapolis Raceway Park', sources: { p1doks: ['Lucas Oil Indianapolis Raceway Park'] }, isDefault: true },
  { canonicalName: 'Lucas Oil Speedway', sources: { p1doks: ['Lucas Oil Speedway'] }, isDefault: true },
  { canonicalName: 'Martinsville Speedway', sources: { p1doks: ['Martinsville Speedway'] }, isDefault: true },
  { canonicalName: 'Michigan International Speedway', sources: { p1doks: ['Michigan International Speedway'] }, isDefault: true },
  { canonicalName: 'Miami International Autodrome', sources: { p1doks: ['Miami International Autodrome'] }, isDefault: true },
  { canonicalName: '(Legacy) Michigan International Speedway - 2009', sources: { p1doks: ['(Legacy) Michigan International Speedway - 2009'] }, isDefault: true },
  { canonicalName: 'Mid-Ohio Sports Car Course', sources: { p1doks: ['Mid-Ohio Sports Car Course'] }, isDefault: true },
  { canonicalName: 'Michelin Raceway Road Atlanta', sources: { p1doks: ['Michelin Raceway Road Atlanta'] }, isDefault: true },
  { canonicalName: 'Millbridge Speedway', sources: { p1doks: ['Millbridge Speedway'] }, isDefault: true },
  { canonicalName: 'Milwaukee Mile Speedway', sources: { p1doks: ['Milwaukee Mile Speedway'] }, isDefault: true },
  { canonicalName: 'Misano World Circuit Marco Simoncelli', sources: { p1doks: ['Misano World Circuit Marco Simoncelli'] }, isDefault: true },
  { canonicalName: 'Mobility Resort Motegi', sources: { p1doks: ['Mobility Resort Motegi'] }, isDefault: true },
  { canonicalName: 'MotorLand Aragon', sources: { p1doks: ['MotorLand Aragón'] }, isDefault: true },
  { canonicalName: 'Motorsport Arena Oschersleben', sources: { p1doks: ['Motorsport Arena Oschersleben'] }, isDefault: true },
  { canonicalName: 'Motorsports Park at The Bend', sources: { p1doks: ['Motorsports Park at The Bend'] }, isDefault: true },
  { canonicalName: 'Mount Panorama Motor Racing Circuit', sources: { p1doks: ['Mount Panorama Motor Racing Circuit'] }, isDefault: true },
  { canonicalName: 'Mount Washington Auto Road', sources: { p1doks: ['Mount Washington Auto Road'] }, isDefault: true },
  { canonicalName: 'Myrtle Beach Speedway', sources: { p1doks: ['Myrtle Beach Speedway'] }, isDefault: true },
  { canonicalName: 'Nashville Fairgrounds Speedway', sources: { p1doks: ['Nashville Fairgrounds Speedway'] }, isDefault: true },
  { canonicalName: 'Nashville Superspeedway', sources: { p1doks: ['Nashville Superspeedway'] }, isDefault: true },
  { canonicalName: 'New Hampshire Motor Speedway', sources: { p1doks: ['New Hampshire Motor Speedway'] }, isDefault: true },
  { canonicalName: 'New Jersey Motorsports Park', sources: { p1doks: ['New Jersey Motorsports Park'] }, isDefault: true },
  { canonicalName: 'New Smyrna Speedway', sources: { p1doks: ['New Smyrna Speedway'] }, isDefault: true },
  { canonicalName: 'Next Gen in California', sources: { p1doks: ['Next Gen in California'] }, isDefault: true },
  { canonicalName: 'North Wilkesboro Speedway', sources: { p1doks: ['North Wilkesboro Speedway'] }, isDefault: true },
  { canonicalName: 'NOS Energy Drink Chili Bowl Nationals', sources: { p1doks: ['NOS Energy Drink Chili Bowl Nationals'] }, isDefault: true },
  { canonicalName: 'Nurburgring Combined', sources: { p1doks: ['Nurburgring Combined'] }, isDefault: true },
  { canonicalName: 'Nurburgring Grand-Prix-Strecke', sources: { p1doks: ['Nurburgring Grand-Prix-Strecke'] }, isDefault: true },
  { canonicalName: 'Nurburgring Nordschleife', sources: { p1doks: ['Nurburgring Nordschleife'] }, isDefault: true },
  { canonicalName: 'Okayama International Circuit', sources: { p1doks: ['Okayama International Circuit'] }, isDefault: true },
  { canonicalName: 'Oran Park Raceway', sources: { p1doks: ['Oran Park Raceway'] }, isDefault: true },
  { canonicalName: 'Oswego Speedway', sources: { p1doks: ['Oswego Speedway'] }, isDefault: true },
  { canonicalName: 'Oulton Park Circuit', sources: { p1doks: ['Oulton Park Circuit'] }, isDefault: true },
  { canonicalName: 'Oxford Plains Speedway', sources: { p1doks: ['Oxford Plains Speedway'] }, isDefault: true },
  { canonicalName: 'Phillip Island Circuit', sources: { p1doks: ['Phillip Island Circuit'] }, isDefault: true },
  { canonicalName: 'Phoenix Raceway', sources: { p1doks: ['Phoenix Raceway'] }, isDefault: true },
  { canonicalName: '(Legacy) Phoenix Raceway - 2008', sources: { p1doks: ['(Legacy) Phoenix Raceway - 2008'] }, isDefault: true },
  { canonicalName: 'Pocono Raceway', sources: { p1doks: ['Pocono Raceway'] }, isDefault: true },
  { canonicalName: '(Legacy) Pocono Raceway - 2009', sources: { p1doks: ['(Legacy) Pocono Raceway - 2009'] }, isDefault: true },
  { canonicalName: 'Port Royal Speedway', sources: { p1doks: ['Port Royal Speedway'] }, isDefault: true },
  { canonicalName: 'Portland International Raceway', sources: { p1doks: ['Portland International Raceway'] }, isDefault: true },
  { canonicalName: 'Red Bull Ring', sources: { p1doks: ['Red Bull Ring'] }, isDefault: true },
  { canonicalName: 'Richmond Raceway', sources: { p1doks: ['Richmond Raceway'] }, isDefault: true },
  { canonicalName: 'Road America', sources: { p1doks: ['Road America'] }, isDefault: true },
  { canonicalName: 'Rockingham Speedway and Entertainment Complex', sources: { p1doks: ['Rockingham Speedway & Entertainment Complex'] }, isDefault: true },
  { canonicalName: 'Rudskogen Motorsenter', sources: { p1doks: ['Rudskogen Motorsenter'] }, isDefault: true },
  { canonicalName: 'Sachsenring', sources: { p1doks: ['Sachsenring'] }, isDefault: true },
  { canonicalName: 'Sandown International Motor Raceway', sources: { p1doks: ['Sandown International Motor Raceway'] }, isDefault: true },
  { canonicalName: 'Sebring International Raceway', sources: { p1doks: ['Sebring International Raceway'] }, isDefault: true },
  { canonicalName: 'Silverstone Circuit', sources: { p1doks: ['Silverstone Circuit'] }, isDefault: true },
  { canonicalName: '(Legacy) Silverstone Circuit - 2008', sources: { p1doks: ['(Legacy) Silverstone Circuit - 2008'] }, isDefault: true },
  { canonicalName: 'Slinger Speedway', sources: { p1doks: ['Slinger Speedway'] }, isDefault: true },
  { canonicalName: 'Snetterton Circuit', sources: { p1doks: ['Snetterton Circuit'] }, isDefault: true },
  { canonicalName: 'Sonoma Raceway', sources: { p1doks: ['Sonoma Raceway'] }, isDefault: true },
  { canonicalName: 'South Boston Speedway', sources: { p1doks: ['South Boston Speedway'] }, isDefault: true },
  { canonicalName: 'Southern National Motorsports Park', sources: { p1doks: ['Southern National Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Stafford Speedway', sources: { p1doks: ['Stafford Speedway'] }, isDefault: true },
  { canonicalName: 'Summit Point Motorsports Park', sources: { p1doks: ['Summit Point Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Suzuka International Racing Course', sources: { p1doks: ['Suzuka International Racing Course'] }, isDefault: true },
  { canonicalName: 'Talladega Superspeedway', sources: { p1doks: ['Talladega Superspeedway'] }, isDefault: true },
  { canonicalName: 'Texas Motor Speedway', sources: { p1doks: ['Texas Motor Speedway'] }, isDefault: true },
  { canonicalName: '(Legacy) Texas Motor Speedway - 2009', sources: { p1doks: ['(Legacy) Texas Motor Speedway - 2009'] }, isDefault: true },
  { canonicalName: 'The Bullring at Las Vegas Motor Speedway', sources: { p1doks: ['The Bullring at Las Vegas Motor Speedway'] }, isDefault: true },
  { canonicalName: 'Thompson Speedway Motorsports Park', sources: { p1doks: ['Thompson Speedway Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Thruxton Circuit', sources: { p1doks: ['Thruxton Circuit'] }, isDefault: true },
  { canonicalName: 'Tsukuba Circuit', sources: { p1doks: ['Tsukuba Circuit'] }, isDefault: true },
  { canonicalName: 'USA International Speedway', sources: { p1doks: ['USA International Speedway'] }, isDefault: true },
  { canonicalName: 'USA International Speedway - Dirt', sources: { p1doks: ['USA International Speedway - Dirt'] }, isDefault: true },
  { canonicalName: 'Virginia International Raceway', sources: { p1doks: ['Virginia International Raceway'] }, isDefault: true },
  { canonicalName: 'Volusia Speedway Park', sources: { p1doks: ['Volusia Speedway Park'] }, isDefault: true },
  { canonicalName: 'Watkins Glen International', sources: { p1doks: ['Watkins Glen International'] }, isDefault: true },
  { canonicalName: 'WeatherTech Raceway Laguna Seca', sources: { p1doks: ['WeatherTech Raceway Laguna Seca'] }, isDefault: true },
  { canonicalName: 'Weedsport Speedway', sources: { p1doks: ['Weedsport Speedway'] }, isDefault: true },
  { canonicalName: 'Wild West Motorsports Park', sources: { p1doks: ['Wild West Motorsports Park'] }, isDefault: true },
  { canonicalName: 'Williams Grove Speedway', sources: { p1doks: ['Williams Grove Speedway'] }, isDefault: true },
  { canonicalName: 'Willow Springs International Raceway', sources: { p1doks: ['Willow Springs International Raceway'] }, isDefault: true },
  { canonicalName: 'Winton Motor Raceway', sources: { p1doks: ['Winton Motor Raceway'] }, isDefault: true },
  { canonicalName: 'World Wide Technology Raceway', sources: { p1doks: ['World Wide Technology Raceway'] }, isDefault: true },
  { canonicalName: 'Auto Club Speedway', sources: {}, isDefault: true },
];

function mergeWithDefaults(mappings: UnifiedTrackMapping[]): UnifiedTrackMapping[] {
  const merged = [...mappings];
  for (const defaultMapping of DEFAULT_TRACK_MAPPINGS) {
    const existingIndex = merged.findIndex(m => m.canonicalName.toLowerCase() === defaultMapping.canonicalName.toLowerCase());
    if (existingIndex >= 0) {
      // Fill in missing default sources without overwriting user customizations
      const existing = merged[existingIndex];
      const mergedSources = { ...existing.sources };
      for (const service of ['p1doks', 'hymo'] as const) {
        const defaultSources = defaultMapping.sources[service];
        if (defaultSources && (!mergedSources[service] || mergedSources[service]!.length === 0)) {
          mergedSources[service] = defaultSources;
        }
      }
      merged[existingIndex] = { ...existing, sources: mergedSources };
    } else {
      merged.push(defaultMapping);
    }
  }
  return merged;
}

function migrateFromOldContexts(): UnifiedTrackMapping[] {
  const unified: UnifiedTrackMapping[] = [];

  // Read old P1Doks track mappings
  try {
    const p1doksRaw = localStorage.getItem('p1doks-settings');
    if (p1doksRaw) {
      const p1doksSettings = JSON.parse(p1doksRaw);
      (p1doksSettings.trackMappings || []).forEach((m: { p1doks: string; iracing: string; isDefault?: boolean }) => {
        unified.push({
          canonicalName: m.iracing,
          sources: { p1doks: [m.p1doks] },
          isDefault: m.isDefault,
        });
      });
    }
  } catch (e) {
    console.error('Error migrating P1Doks track mappings:', e);
  }

  // Read old Hymo track mappings and merge by canonical name
  try {
    const hymoRaw = localStorage.getItem('hymo-settings');
    if (hymoRaw) {
      const hymoSettings = JSON.parse(hymoRaw);
      (hymoSettings.trackMappings || []).forEach((m: { p1doks: string; iracing: string; isDefault?: boolean }) => {
        // m.p1doks is the Hymo source name (legacy field naming)
        const existing = unified.find(u => u.canonicalName.toLowerCase() === m.iracing.toLowerCase());
        if (existing) {
          const currentHymo = existing.sources.hymo || [];
          if (!currentHymo.includes(m.p1doks)) {
            existing.sources.hymo = [...currentHymo, m.p1doks];
          }
        } else {
          unified.push({
            canonicalName: m.iracing,
            sources: { hymo: [m.p1doks] },
            isDefault: m.isDefault,
          });
        }
      });
    }
  } catch (e) {
    console.error('Error migrating Hymo track mappings:', e);
  }

  return unified;
}

interface TrackMappingProviderProps {
  children: ReactNode;
}

export const TrackMappingProvider: React.FC<TrackMappingProviderProps> = ({ children }) => {
  const [trackMappings, setTrackMappings] = useState<UnifiedTrackMapping[]>(() => {
    try {
      const saved = localStorage.getItem('unified-track-mappings-v3');
      if (saved) {
        // Normalize old string format to string[] format
        const parsed = JSON.parse(saved);
        const normalized = parsed.map(normalizeMapping);
        return mergeWithDefaults(normalized);
      }
    } catch (e) {
      console.error('Error loading unified track mappings:', e);
    }

    // No existing unified data -- migrate from old contexts then merge defaults
    const migrated = migrateFromOldContexts();
    return mergeWithDefaults(migrated);
  });

  useEffect(() => {
    try {
      localStorage.setItem('unified-track-mappings-v3', JSON.stringify(trackMappings));
    } catch (e) {
      console.error('Error saving unified track mappings:', e);
    }
  }, [trackMappings]);

  const addMapping = useCallback((canonicalName: string, service: TrackMappingService, sourceName: string) => {
    if (!canonicalName || !sourceName) return;

    setTrackMappings(prev => {
      const existingIndex = prev.findIndex(m => m.canonicalName.toLowerCase() === canonicalName.toLowerCase());
      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        const currentSources = existing.sources[service] || [];
        // Don't add duplicate
        if (currentSources.some(s => s.toLowerCase() === sourceName.toLowerCase())) {
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existing,
          sources: {
            ...existing.sources,
            [service]: [...currentSources, sourceName],
          },
        };
        return updated;
      }
      // Create new mapping
      return [...prev, {
        canonicalName,
        sources: { [service]: [sourceName] },
      }];
    });
  }, []);

  const removeMapping = useCallback((index: number) => {
    setTrackMappings(prev => {
      const mapping = prev[index];
      if (mapping?.isDefault) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const editMapping = useCallback((index: number, mapping: UnifiedTrackMapping) => {
    setTrackMappings(prev => prev.map((m, i) => i === index ? mapping : m));
  }, []);

  const replaceMappings = useCallback((mappings: UnifiedTrackMapping[]) => {
    setTrackMappings(mappings);
  }, []);

  const getServiceTrackMappings = useCallback((service: TrackMappingService): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const mapping of trackMappings) {
      const sourceNames = mapping.sources[service];
      if (sourceNames) {
        for (const sourceName of sourceNames) {
          result[sourceName] = mapping.canonicalName;
        }
      }
    }
    return result;
  }, [trackMappings]);

  const getCanonicalNames = useCallback((): string[] => {
    return trackMappings.map(m => m.canonicalName);
  }, [trackMappings]);

  const value: TrackMappingContextType = {
    trackMappings,
    addMapping,
    removeMapping,
    editMapping,
    replaceMappings,
    getServiceTrackMappings,
    getCanonicalNames,
  };

  return (
    <TrackMappingContext.Provider value={value}>
      {children}
    </TrackMappingContext.Provider>
  );
};

export const useTrackMapping = (): TrackMappingContextType => {
  const context = useContext(TrackMappingContext);
  if (!context) {
    throw new Error('useTrackMapping must be used within a TrackMappingProvider');
  }
  return context;
};
