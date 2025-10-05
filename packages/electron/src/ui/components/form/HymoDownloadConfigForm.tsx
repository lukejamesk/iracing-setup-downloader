import React from "react";
import GenericDownloadConfigForm from "./GenericDownloadConfigForm";
import { useHymo } from "../../contexts";

interface FormData {
  series: string;
  season: string;
  year: string;
  week: string;
  runHeadless: boolean;
}

interface HymoDownloadConfigFormProps {
  onDownload: (formData: FormData) => Promise<{completed: boolean}>;
  onCancel?: () => void;
  seriesOptions?: string[]; // Custom series options for Hymo
}

const HymoDownloadConfigForm: React.FC<HymoDownloadConfigFormProps> = ({
  onDownload,
  onCancel,
  seriesOptions = [
    "2025 INDY 500",
    "Creventic Endurance Series",
    "Falken Tyre Sports Car Challenge",
    "FIA Formula 4 Challenge",
    "Formula B - Super Formula Series",
    "Formula C - DOF Reality Dallara F3 Series",
    "Formula C - Super Formula Lights",
    "GT Sprint",
    "GTE Sprint",
    "IMSA",
    "INDYCAR Series",
    "iRacing Porsche Cup",
    "Majors 24 2025",
    "NASCAR Class A Series",
    "Nurburgring Endurance Championship",
    "Porsche TAG Heuer Esports Supercup Qualifying Series",
    "Portimao 1000",
    "Production Car Challenge",
    "TCR Virtual Challenge",
  ], // Default Hymo series options
}) => {
  const { settings: hymoSettings } = useHymo();

  return (
    <GenericDownloadConfigForm
      onDownload={onDownload}
      onCancel={onCancel}
      seriesOptions={seriesOptions}
      localStorageKey="hymo-form-data"
      isSettingsValid={() => !!(hymoSettings.login && hymoSettings.password)}
    />
  );
};

export default HymoDownloadConfigForm;