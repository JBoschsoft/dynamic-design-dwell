
import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Badge
} from '@/components/ui';
import { Settings, Edit } from 'lucide-react';

interface ScreeningSettingsProps {
  screeningSettings: {
    defaultDuration: number;
    questions: string[];
    automaticReminders: boolean;
    reminderTime: number;
  };
  onModifyParameters: () => void;
  onEditQuestions: () => void;
}

const ScreeningSettings: React.FC<ScreeningSettingsProps> = ({ 
  screeningSettings,
  onModifyParameters,
  onEditQuestions
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Ustawienia rozmów telefonicznych</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe parametry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Domyślny czas rozmowy</span>
                <span>{screeningSettings.defaultDuration} minut</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Automatyczne przypomnienia</span>
                <Badge variant={screeningSettings.automaticReminders ? "default" : "outline"}>
                  {screeningSettings.automaticReminders ? "Włączone" : "Wyłączone"}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Czas przypomnienia</span>
                <span>{screeningSettings.reminderTime} godz. przed rozmową</span>
              </div>
              <Button variant="outline" className="w-full" onClick={onModifyParameters}>
                <Settings className="mr-2 h-4 w-4" />
                Modyfikuj parametry
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pytania screeningowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc pl-5 space-y-2">
                {screeningSettings.questions.map((question, index) => (
                  <li key={index} className="text-sm">{question}</li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" onClick={onEditQuestions}>
                <Edit className="mr-2 h-4 w-4" />
                Edytuj pytania
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScreeningSettings;
