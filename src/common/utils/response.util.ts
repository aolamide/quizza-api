export const sendSuccess = (
  data: object | Array<object> | null,
  message: string,
): object => {
  return {
    status: 'success',
    message,
    data,
  };
};
