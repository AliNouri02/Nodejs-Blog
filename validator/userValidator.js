const { object, string, ref } = require("yup");

exports.schema = object().shape({
    fullname: string()
        .required("نام و نام خانوادگی الزامی می باشد")
        .min(4, "نام و نام خانوادگی نباید کمتر از 4 کاراکتر باشد")
        .max(255, "نام و نام خانوادگی نباید بیشتر از 255 کاراکتر باشد"),
    email: string()
        .email("ایمیل معتبر نمی باشد")
        .required("ایمیل الزامی می باشد"),
    password: string()
        .min(4, "کلمه عبور نباید کمتر از 4 کاراکتر باشد")
        .max(255, "کلمه عبور نباید بیشتر از 255 کاراکتر باشد")
        .required("کلمه عبور الزامی می باشد"),
    confirmPassword: string()
        .required("تکرار کلمه عبور الزامی می باشد")
        .oneOf([ref("password"), null], 'کلمه های عبور یکسان نیستند'),
});