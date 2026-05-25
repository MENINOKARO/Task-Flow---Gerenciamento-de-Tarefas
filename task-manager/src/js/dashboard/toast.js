
export function showToast(message, icon = "success") {

    Swal.fire({

        toast: true,

        position: "top-end",

        icon,

        title: message,

        showConfirmButton: false,

        timer: 2000,

        timerProgressBar: true,

        customClass: {
            popup: "rounded-xl"
        }

    });

}