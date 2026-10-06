(() => {
    const uid = window.SITE_CONFIG?.USER_UID || "TXP104582";
    let toastTimeout;

    document.querySelectorAll("[data-uid-value]").forEach((element) => {
        element.textContent = uid;
    });

    document.querySelectorAll("[data-copy-uid]").forEach((button) => {
        button.addEventListener("click", async () => {
            const toast = document.querySelector("[data-uid-toast]");

            try {
                await navigator.clipboard.writeText(uid);
                showToast(toast, "Copied to clipboard!", false);
            } catch (error) {
                showToast(toast, "Could not copy UID. Check clipboard permissions.", true);
            }
        });
    });

    function showToast(toast, message, isError) {
        if (!toast) {
            return;
        }

        window.clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.toggle("border-red-700", isError);
        toast.classList.toggle("border-gray-700", !isError);
        toast.classList.remove("translate-y-2", "opacity-0");
        toast.classList.add("translate-y-0", "opacity-100");
        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("translate-y-0", "opacity-100");
            toast.classList.add("translate-y-2", "opacity-0");
        }, 2000);
    }
})();
