import { IsBoolean, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';

/**
 * Opt-in link from a Sehatpublic doctor profile to an existing SehtDesk
 * (SehatDoc) booking slug. Doctors without SehtDesk leave this unset.
 */
export class LinkSehatdocDto {
  @IsOptional()
  @IsBoolean()
  sehatdocSyncEnabled?: boolean;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'sehatdocBookingSlug must be alphanumeric with dashes/underscores',
  })
  sehatdocBookingSlug?: string;

  @IsOptional()
  @IsUUID()
  sehatdocDoctorUserId?: string;

  @IsOptional()
  @IsUUID()
  sehatdocClinicId?: string;
}
