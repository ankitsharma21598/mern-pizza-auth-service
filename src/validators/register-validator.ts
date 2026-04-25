import { checkSchema } from "express-validator";

export default checkSchema({
    email: {
        errorMessage: "Email is required",
        notEmpty: true,
        trim: true,
        // isEmail: true,
        // normalizeEmail: true,
        // errorMessage: "Invalid email address",
        // in: "body",
        // isString: true,
        // isLength: {
        //     options: { min: 1 },
        //     errorMessage: "Email is required",
        // },
    },
});

// export default [
//     body("email").notEmpty().withMessage("Email is required"),
//     // body("password").notEmpty().isLength({ min: 8 }),
// ];
