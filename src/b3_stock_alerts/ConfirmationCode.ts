export type SendCodeParams = {
  email: string;
  code: string;
};

interface ConfirmationCode {
  sendCode(params: SendCodeParams): Promise<void>;
}

export default ConfirmationCode;
