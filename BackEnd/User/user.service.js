import User from './user.schema.js';
import bcrypt from 'bcryptjs';
export default class UserService {
    constructor() {
        this.user = User;
        this.bcrypt = bcrypt;
    }

    async getAllUsers() {
        try {
            const users = await this.user.find().select('-password');
            return users;
        } catch (error) {
            throw new Error(`Error fetching users: ${error.message}`);
        }
    }

    async getUserById(id) {
        try {
            const user = await this.user.findById(id).select('-password');
            if (!user) throw new Error('User not found');
            return user;
        } catch (error) {
            throw new Error(`Error fetching user: ${error.message}`);
        }
    }

    async createUser(userData) {
        try {
            const newUser = await this.user.create(userData);
            return newUser;
        } catch (error) {
            throw new Error(`Error creating user: ${error.message}`);
        }
    }

    async updateUser(id, userData) {
        try {
            const updatedUser = await this.user.findByIdAndUpdate(
                id,
                userData,
                { new: true }
            ).select('-password');
            if (!updatedUser) throw new Error('User not found');
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }

    async deleteUser(id) {
        try {
            const deletedUser = await this.user.findByIdAndDelete(id);
            if (!deletedUser) throw new Error('User not found');
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error(`Error deleting user: ${error.message}`);
        }
    }

    // async getUserByEmail(email) {
    //     try {
    //         const user = await this.user.findOne({ email });
    //         return user;
    //     } catch (error) {
    //         throw new Error(`Error fetching user by email: ${error.message}`);
    //     }
    // }

    async updatePass(id, { password, oldPassword }) {
        try {
            const user = await this.user.findById(id);
            if (!user) throw new Error('User not found');
            const isMatch = await this.bcrypt.compare(oldPassword, user.password);
            if (!isMatch) throw new Error('Incorrect password');
            user.password = await this.bcrypt.hash(password, 10);
            await user.save();
            return user;
        } catch (error) {
            throw new Error(`Error updating password: ${error.message}`);
        }
    }
    async updateUserbyadmin(id, userData) {
        try {
            const updatedUser = await this.user.findByIdAndUpdate(
                id,
                userData,
                { new: true }
            ).select('-password');
            if (!updatedUser) throw new Error('User not found');
            return updatedUser;
        } catch (error) {
            throw new Error(`Error updating user: ${error.message}`);
        }
    }
}
