export interface ProgramDraft {
  id: string;
  title: string;
  slotIds: string[];
  description: string;
  isConfirmed: boolean;
  coachAssignments: Record<string, string>;
}

