export type CapsuleContentType = 0 | 1 | 2;

export interface TimeCapsuleDto {
  id: number;
  ownerUserId: number;
  ownerDisplayName?: string | null;
  contentType: CapsuleContentType;
  title: string;
  textContent?: string | null;
  linkUrl?: string | null;
  fileStoragePath?: string | null;
  openAtUtc: string;
  createdAtUtc: string;
  recipientEmail: string;
  isPublic: boolean;
}

export interface CapsuleLocationDto {
  id: number;
  capsuleId: number;
  latitude: number;
  longitude: number;
  placeLabel: string;
}

export interface UserAccountDto {
  id: number;
  email: string;
  displayName: string;
  createdAtUtc: string;
  notifyEmailEnabled: boolean;
  notifyPushEnabled: boolean;
  loginAlertsEnabled: boolean;
}

export interface ModerationReportDto {
  id: number;
  capsuleId: number;
  reporterEmail: string;
  reason: string;
  status: number;
  createdAtUtc: string;
}

export interface TimeSeriesPointDto {
  date: string;
  count: number;
}

export interface AdminStatsDto {
  userRegistrationsByDay: TimeSeriesPointDto[];
  capsulesCreatedByDay: TimeSeriesPointDto[];
}

export interface ResponceMsg {
  isSuccess: boolean;
  message: string;
}
