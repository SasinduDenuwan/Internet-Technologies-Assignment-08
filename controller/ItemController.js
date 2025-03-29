$(document).ready(function () {
    // General validation function
    function validateField(inputElement, pattern, errorSpanId, errorMessage, customCheck = null) {
        let value = inputElement.val().trim();
        let errorSpan = $("#" + errorSpanId);

        if (!value) {
            inputElement.css("border", "2px solid red");
            errorSpan.text("The text box is empty").css("color", "red");
            return false;
        } else if (!pattern.test(value) || (customCheck && !customCheck(value))) {
            inputElement.css("border", "2px solid red");
            errorSpan.text(errorMessage).css("color", "red");
            return false;
        } else {
            inputElement.css("border", "2px solid green");
            errorSpan.text("").css("color", "green");
            return true;
        }
    }

    // Item Code validation (Format: I00 - 001)
    $("#itemID").on("input", function () {
        validateField($(this), /^I\d{2} - \d{3}$/, "itemCodeError", "Invalid format! (e.g., I00 - 001)");
    });

    // Item Name validation (Only letters and spaces)
    $("#itemName").on("input", function () {
        validateField($(this), /^[A-Za-z\s]+$/, "itemNameError", "Only letters and spaces allowed.");
    });

    // Item Qty validation (Must be a positive integer)
    $("#itemQty").on("input", function () {
        validateField(
            $(this),
            /^\d+$/,
            "itemQtyError",
            "Qty must be a positive number.",
            (value) => parseInt(value) > 0 // Custom check for positive number
        );
    });

    // Unit Price validation (Must be a positive number)
    $("#itemPrice").on("input", function () {
        validateField(
            $(this),
            /^\d+(\.\d{1,2})?$/,
            "itemUnitPriceError",
            "Enter a valid price (e.g., 10.99).",
            (value) => parseFloat(value) > 0 // Custom check for positive price
        );
    });

    function validateAllFields() {
        let isValid = true;

        if (!validateField($('#itemID'), /^I\d{2} - \d{3}$/, "itemCodeError", "Invalid format! (e.g., I00 - 001)")) {
            isValid = false;
        }
        if (!validateField($('#itemName'), /^[A-Za-z\s]+$/, "itemNameError", "Only letters and spaces allowed.")) {
            isValid = false;
        }
        if (!validateField($('#itemQty'), /^\d+$/, "itemQtyError", "Qty must be a positive number.", (value) => parseInt(value) > 0)) {
            isValid = false;
        }
        if (!validateField($('#itemPrice'), /^\d+(\.\d{1,2})?$/, "itemUnitPriceError", "Enter a valid price.", (value) => parseFloat(value) > 0)) {
            isValid = false;
        }

        return isValid;
    }

    // Validate before saving
    $("#saveItem").on("click", function (e) {
        e.preventDefault();  // Prevent form submission
        if (validateAllFields()) {
            // Submit the form if all fields are valid
            console.log("Form is valid, submitting...");
        } else {
            console.log("Form is invalid.");
        }
    });
});
