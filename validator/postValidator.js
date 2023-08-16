const { object, string, mixed ,number} = require("yup");


exports.schema = object().shape({
    title: string()
        .required("عنوان پست الزامی می باشد")
        .min(5, "عنوان پست نباید کمتر از 5 کارکتر باشد")
        .max(100, "عنوان پست نباید بیشتر از 100 کاراکتر باشد"),
    body: string().required("پست جدید باید دارای محتوا باشد"),
    status: mixed().oneOf(
        ["public", "private"],
        "یکی از 2 وضعیت خصوصی یا عمومی را انتخاب کنید"
    ),
    thumbnail: object().shape({
        name: string().required("عکس بند انگشتی الزامی می باشد"),
        size: number().max(3000000, "عکس نباید بیشتر از 3 مگابایت باشد"),
        mimetype: mixed().oneOf(
            ["image/jpeg", "image/png"],
            "تنها پسوندهای png و jpeg پشتیبانی می شوند"
        ),
    })
});
