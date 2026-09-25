export interface ManualTestLog {
  logId?: string;
  id: string;
  pondId: string;
  userId: string;
  nh3Value: number;
  no2Value: number;
  note?: string;
  testedAt: string;
}
