import React from "react";
import GenericDownloadConfigForm from "./GenericDownloadConfigForm";
import { useP1Doks } from "../../contexts";

interface FormData {
  series: string;
  season: string;
  year: string;
  week: string;
  runHeadless: boolean;
}

interface P1DoksDownloadConfigFormProps {
  onDownload: (formData: FormData) => Promise<{completed: boolean}>;
  onCancel?: () => void;
  seriesOptions?: string[]; // Custom series options for P1Doks
}

const P1DoksDownloadConfigForm: React.FC<P1DoksDownloadConfigFormProps> = ({
  onDownload,
  onCancel,
  seriesOptions = [
    "All series",
    "Daytona 24h",
    "F3",
    "F4",
    "Falken Sports Car",
    "Ferrari Challenge",
    "Global Mazda Mx5",
    "GT3 Fixed",
    "GT Sprint",
    "GTE Sprint",
    "IMSA",
    "Indycar",
    "Indy NXT Road - fixed",
    "NASCAR Open A NextGen",
    "NASCAR Open B Xfinity",
    "NASCAR  Open C Trucks",
    "Nurburgring Endurance Challenge",
    "Porsche Cup",
    "Production Car Challenge",
    "Prototype Challenge",
    "Super Formula",
    "Super Formula Lights",
    "TCR Virtual Challenge",
  ], // Default P1Doks series options (from P1Doks filter drawer)
}) => {
  const { settings: p1doksSettings } = useP1Doks();

  return (
    <GenericDownloadConfigForm
      onDownload={onDownload}
      onCancel={onCancel}
      seriesOptions={seriesOptions}
      localStorageKey="p1doks-form-data"
      isSettingsValid={() => !!(p1doksSettings.email && p1doksSettings.password)}
    />
  );
};

export default P1DoksDownloadConfigForm;