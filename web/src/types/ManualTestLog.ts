export interface ManualTestLog {
  // Backend actual fields
  logId?: string;
  pondId?: string;
  testedById?: string;
  testTime?: string;
  phValue?: number | null;
  salinity?: number | null;
  temperature?: number | null;
  note?: string | null;
  createdAt?: string;

  // Frontend aliases / backward compat
  id?: string;
  parameterId?: string;
  value?: number;
  notes?: string;
}
