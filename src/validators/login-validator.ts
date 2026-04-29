import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required.",
        notEmpty: true,
        trim: true,
        isEmail: {
            errorMessage: "Invalid email address",
        },
        // normalizeEmail: true,
        // errorMessage: "Invalid email address",
        // in: "body",
        // isString: true,
        // isLength: {
        //     options: { min: 1 },
        //     errorMessage: "Email is required",
        // },
    },
    password: {
        errorMessage: "Password is required.",
        notEmpty: true,
        trim: true,
        // isLength: {
        //     options: { min: 8 },
        //     errorMessage: "Password must be at least 8 characters",
        // },
    },
});

// export default [
//     body("email").notEmpty().withMessage("Email is required"),
//     // body("password").notEmpty().isLength({ min: 8 }),
// ];
