import {
  type HydratedDocument, model, type Model, Schema,
} from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import HTTPError from '../errors/HTTPError';

export type UserType = {
  login: string;
  password: string;
  tokens: { token: string }[];
  generateAuthToken: (this: HydratedDocument<UserType>) => Promise<string>;
  isEqualPassword: (
    this: HydratedDocument<UserType>,
    password: string
  ) => Promise<string>;
};

export type TokenPayload = {
  id: string;
};

interface UserModel extends Model<UserType> {
  findByCredentials: (login: string, password: string) => Promise<HydratedDocument<UserType>>;
  register: (login: string, password: string) => Promise<HydratedDocument<UserType>>;
}

const userSchema = new Schema<UserType, UserModel>({
  login: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: [{
    token: {
      type: String,
      required: true,
    },
  }],
});

userSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.methods.generateAuthToken = async function (this: HydratedDocument<UserType>) {
  const user = this;

  const token = jwt.sign({ id: user.id }, process.env.JWT_KEY as string);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.isEqualPassword = async function (
  this: HydratedDocument<UserType>,
  password: string,
) {
  const user = this;

  return await bcrypt.compare(password, user.password);
};

userSchema.statics.findByCredentials = async function (
  this: UserModel,
  login: string,
  password: string,
) {
  const user = await this.findOne({ login });
  if (!user) {
    throw new HTTPError(404);
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new HTTPError(404);
  }
  return user;
};

userSchema.statics.register = async function (this: UserModel, login: string, password: string) {
  const user = await this.findOne({ login });
  if (user) {
    throw new HTTPError(409);
  }

  const newUser = new this({ login, password });
  await newUser.save();
  return newUser;
};

const User = model<UserType, UserModel>('User', userSchema);

export default User;
