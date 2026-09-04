import bcrypt from "bcryptjs";

export const hashpassword = async (password) => {
    if(!password) {
        throw new Error("password is requrired");
    }

    const salt = await bcrypt.genSalt(10);

    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (
    password,
    hashedPassword
) => {
    if(!password || !hashedPassword) {
        return false;
    }

    return await bcrypt.compare(
        password,
        hashedPassword
    );
};