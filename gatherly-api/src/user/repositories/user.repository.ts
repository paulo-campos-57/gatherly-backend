import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDTO } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { User, UserDocument } from '../schemas/user.schema.js';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(data: CreateUserDTO): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password')
      .exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username: username.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ id }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async search(query: string): Promise<UserDocument[]> {
    const normalizedQuery = query.trim();
    const escapedQuery = normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const exactQuery = normalizedQuery.toLowerCase();
    const nameSearch = new RegExp(escapedQuery, 'i');

    return this.userModel
      .find({
        $or: [
          { id: normalizedQuery },
          { email: exactQuery },
          { username: exactQuery },
          { name: { $regex: nameSearch } },
        ],
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, data: UpdateUserDto): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { id },
        { $set: data },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();
  }

  delete(id: string): Promise<UserDocument | null> {
    return this.userModel.findOneAndDelete({ id }).exec();
  }
}
