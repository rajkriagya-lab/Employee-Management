import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../db.js"

export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expired:"7d",
        }
    );
};

export const findUserByEmail = async (email) =>{
    return await prisma.user.findUnique({
        where:{
            email: email.tolowerCase().trim(),
        },
    });
};

export const findUserById = async (id) => {
    return await prisma.user.findUnique({
        where:{
            id: Number(id),
        },

        select:{
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,

            employeee: {
                include:{
                    department: true,
                },
            },
        },
    });
};

export const createUser = async ({
    name,
    email,
    password,
    role = "EMPLOYEE",
}) => {
    const hashedPassword = 
    await hashPassword(password);

    return await prisma.user.create({
        data:{
            nmae: name.trim,
            email: email.tolowerCase().trim(),
            password: hashedPassword,
            role,
        },

        select:{
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
};