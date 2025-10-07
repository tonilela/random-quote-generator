import * as bcrypt from 'bcryptjs';
import { User, UserAttributes } from '../models/user';

export const register = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    passwordHash: hashedPassword,
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...userWithoutPassword } = newUser.get({ plain: true }) as UserAttributes;
  return userWithoutPassword;
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordCorrect) {
    throw new Error('Invalid email or password');
  }

  return user;
};
