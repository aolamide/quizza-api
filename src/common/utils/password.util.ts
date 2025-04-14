import * as bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt
 * @param password - The plain text password to hash
 * @return A promise that resolves to the hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(7);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password to compare
 * @param hashedPassword - The hashed password to compare against
 * @return A promise that resolves to true if the passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};
