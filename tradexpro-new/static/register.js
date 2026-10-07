(() => {
    const siteName = window.SITE_CONFIG?.SITE_NAME || "TradeXPro";
    document.querySelectorAll("[data-site-name]").forEach((element) => {
        element.textContent = siteName;
    });
    document.querySelectorAll("[data-site-initial]").forEach((element) => {
        element.textContent = siteName.trim().charAt(0).toUpperCase() || "T";
    });
    document.title = `${siteName} - Create Account`;

    const form = document.getElementById("register-form");
    const toast = document.getElementById("register-toast");
    let toastTimer;

    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.passwordToggle);
            const showPassword = input.type === "password";
            input.type = showPassword ? "text" : "password";
            button.setAttribute("aria-pressed", String(showPassword));
            button.setAttribute(
                "aria-label",
                `${showPassword ? "Hide" : "Show"} ${input.id === "password" ? "password" : "confirm password"}`,
            );
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearErrors();

        const fullName = document.getElementById("full-name");
        const contact = document.getElementById("contact");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirm-password");
        const terms = document.getElementById("terms");
        let firstInvalidField = null;

        const setError = (field, message) => {
            field.setAttribute("aria-invalid", "true");
            document.getElementById(`${field.id}-error`).textContent = message;
            firstInvalidField ??= field;
        };

        if (!fullName.value.trim()) {
            setError(fullName, "Enter your full name.");
        }
        if (!contact.value.trim()) {
            setError(contact, "Enter your email address or mobile number.");
        } else if (!isValidEmailOrPhone(contact.value.trim())) {
            setError(contact, "Enter a valid email address or mobile number.");
        }
        if (!password.value) {
            setError(password, "Enter a password.");
        } else if (password.value.length < 8) {
            setError(password, "Use at least 8 characters for your password.");
        }
        if (!confirmPassword.value) {
            setError(confirmPassword, "Confirm your password.");
        } else if (confirmPassword.value !== password.value) {
            setError(confirmPassword, "The passwords do not match.");
        }
        if (!terms.checked) {
            terms.setAttribute("aria-invalid", "true");
            document.getElementById("terms-error").textContent =
                "You must agree to the Terms & Conditions to continue.";
            firstInvalidField ??= terms;
        }

        if (firstInvalidField) {
            firstInvalidField.focus();
            showToast("Please correct the highlighted fields.", "error");
            return;
        }

        showToast("All fields look good. Account creation is not connected in this preview.", "success");
    });

    function isValidEmailOrPhone(value) {
        if (value.includes("@")) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
        }
        if (!/^\+?[0-9().\-\s]+$/.test(value)) {
            return false;
        }
        const digitCount = value.replace(/\D/g, "").length;
        return digitCount >= 7 && digitCount <= 15;
    }

    function clearErrors() {
        document.querySelectorAll('[id$="-error"]').forEach((element) => {
            element.textContent = "";
        });
        form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
            field.removeAttribute("aria-invalid");
        });
    }

    function showToast(message, type) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.remove("translate-y-2", "opacity-0", "border-red-700", "border-emerald-700");
        toast.classList.add("translate-y-0", "opacity-100");
        toast.classList.add(type === "error" ? "border-red-700" : "border-emerald-700");
        toastTimer = window.setTimeout(() => {
            toast.classList.remove("translate-y-0", "opacity-100", "border-red-700", "border-emerald-700");
            toast.classList.add("translate-y-2", "opacity-0");
        }, 3500);
    }
})();
