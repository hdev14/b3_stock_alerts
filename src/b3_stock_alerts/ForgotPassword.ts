export type ForgotPasswordParams = {
  email: string;
  user_id: string;
};

interface ForgotPassword {
  sendForgotPasswordLink(params: ForgotPasswordParams): Promise<void>;
}

export default ForgotPassword;
