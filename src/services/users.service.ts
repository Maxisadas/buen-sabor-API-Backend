import { getRepository } from 'typeorm';
import { User } from '../entity/user';

class UserService {
  async getUsers() {
    const users = await getRepository(User).find();
    return users;
  }
}

export default new UserService();
