export type ResetPasswordParams = {
  email: string;
  user_id: string;
};

interface ResetPassword {
  sendResetPasswordLink(params: ResetPasswordParams): Promise<void>;
}

export default ResetPassword;
