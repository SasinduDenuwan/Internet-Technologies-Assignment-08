import {customerModel} from '../model/Customer.js'

$(document).ready(function () {
    function validateField($input, pattern, errorSpanId, errorMessage, customCheck = null) {
        let value = $input.val().trim();
        let $errorSpan = $('#' + errorSpanId);

        if (!value) {
            $input.css('border', '2px solid red');
            $errorSpan.text('The text box is empty').css('color', 'red');
            return false;
        } else if (!pattern.test(value) || (customCheck && !customCheck(value))) {
            $input.css('border', '2px solid red');
            $errorSpan.text(errorMessage).css('color', 'red');
            return false;
        } else {
            $input.css('border', '2px solid green');
            $errorSpan.text('').css('color', 'green');
            return true;
        }
    }

    function validateAllFields() {
        let isValid = true;
        isValid &= validateField($('#customerID'), /^C\d{2} - \d{3}$/, 'cusIdError', 'Invalid format! (e.g., C00 - 001)');
        isValid &= validateField($('#customerName'), /^[A-Za-z\s]+$/, 'cusNameError', 'Only letters and spaces allowed.');
        isValid &= validateField($('#customerAddress'), /^[A-Za-z0-9\s,.-]+$/, 'cusAddressError', 'Address must have more than 3 characters.', val => val.length > 3);
        isValid &= validateField($('#customerSalary'), /^\d+(\.\d{1,2})?$/, 'cusSalaryError', 'Salary must be greater than 1000.', val => parseFloat(val) > 1000);
        return !!isValid;
    }

    $('#customerID, #customerName, #customerAddress, #customerSalary').on('input', function () {
        let validationRules = {
            'customerID': [/^C\d{2} - \d{3}$/, 'cusIdError', 'Invalid format! (e.g., C00 - 001)'],
            'customerName': [/^[A-Za-z\s]+$/, 'cusNameError', 'Only letters and spaces allowed.'],
            'customerAddress': [/^[A-Za-z0-9\s,.-]+$/, 'cusAddressError', 'Address must have more than 3 characters.', val => val.length > 3],
            'customerSalary': [/^\d+(\.\d{1,2})?$/, 'cusSalaryError', 'Salary must be greater than 1000.', val => parseFloat(val) > 1000]
        };

        let fieldId = $(this).attr('id');
        validateField($(this), ...validationRules[fieldId]);
    });

    $('#saveCustomer').on('click', function () {
        if (validateAllFields()) {
            let customer = {
                cusId: $('#customerID').val(),
                cusName: $('#customerName').val(),
                cusAddress: $('#customerAddress').val(),
                cusSalary: $('#customerSalary').val()
            };
            
            if(customerModel.saveCustomer(customer)){
                addToTable(customer);
            }
            alert('Customer Added Successfully');

            $(".customer-form")[0].reset();
            $(".customer-form input").css("border", "").next("span").text("");

        }
    });

    

    function addToTable(customer) {
        $('#customer-table tbody').append(
            `<tr>
                <td>${customer.cusId}</td>
                <td>${customer.cusName}</td>
                <td>${customer.cusAddress}</td>
                <td>${customer.cusSalary}</td>
            </tr>`
        );
    }
});
