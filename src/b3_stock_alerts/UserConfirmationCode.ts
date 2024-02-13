export type UserConfirmationCode = {
  id: string;
  user_id: string;
  code: string;
  expired_at: Date;
}
