document.getElementById("imageUpload").onclick = function () {
    let xhttp = new XMLHttpRequest(); // create new AJAX request

    const selectedImage = document.getElementById('selectedImage')
    const imageStatus = document.getElementById('imageStatus')
    const progressBar = document.getElementById("progress")
    const progressBarDiv = document.getElementById("progressDiv")
    const uploadResult = document.getElementById("uploadResult")

    xhttp.onreadystatechange = function () {
        if (xhttp.status === 200) {
            imageStatus.innerHTML = "اپلود عکس موفقیت آمیزبود";
            uploadResult.innerHTML = this.responseText;
            selectedImage.value = "";
        }
        else {
            imageStatus.innerHTML = this.responseText;
        }
    };

    xhttp.open("POST", "/dashboard/image-upload");

    xhttp.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            let result = Math.floor((e.loaded / e.total) * 100);
            if (result !== 100) {
                progressBar.style = `width: ${result}%`
            } else {
                progressBarDiv.style = "display:none"
            }
        }
    }

    let formData = new FormData();

    if (selectedImage.files.length > 0) {
        progressBarDiv.style = "display:block";
        formData.append("image", selectedImage.files[0]);
        xhttp.send(formData);
    } else {
        imageStatus.innerHTML = "برای اپلود باید عکسی انتخاب کنید";
    }
};
