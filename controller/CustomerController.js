import {customerModel} from '../model/Customer.js'

$(document).ready(function () {

    loadNextCustomerId();
    loadAllCustomers();
    rowCustomerTableClick();

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

    //  Save button in Customer Page

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
                alert('Customer Added Successfully');
            }            

            clearCustomerAll();
            
        }
    });


    // Remove button in Customer Page

    $('#removeCustomer').click(function (event) {
        event.preventDefault();
        let cusID = $('#customerID').val();

        if (!cusID) {
            $("#cusIdError").text("Please enter the Customer ID to delete.");
            return;
        } else {
            $("#cusIdError").text("");
        }

        if (customerModel.deleteCustomer(cusID)) {
            removeFromTable(cusID);
            alert("Customer deleted successfully!");
            clearCustomerAll();
            loadNextCustomerId();
        } else {
            alert("Customer ID not found!");
        }
    });


    // Update Button in Customer Page

    $('#updateCustomer').click(function (event) {
        event.preventDefault();
    
        if (validateAllFields()) {
            let customer = {
                cusId: $('#customerID').val(),
            };
    
            let cusName = $('#customerName').val();
            let cusAddress = $('#customerAddress').val();
            let cusSalary = $('#customerSalary').val();
    
            if (cusName) customer.cusName = cusName;
            if (cusAddress) customer.cusAddress = cusAddress;
            if (cusSalary) customer.cusSalary = cusSalary;
    
    
            if (customerModel.updateCustomer(customer)) {
                updateTable(customer);
                console.log("Customer updated successfully!");
                clearCustomerAll();
            } else {
                alert("Customer ID not found! Unable to update.");
            }
        }
    });

    // Get All Button in Customer Page

    $('#getAllCustomer').click(function (event) {
        event.preventDefault();
    
        if (validateCustomerID()) {
            let cusId = $('#customerID').val().trim();

            let foundCustomer = customerModel.findCustomerById(cusId);

            if (foundCustomer) {
                $("#customerID").val(foundCustomer.cusId);
                $("#customerName").val(foundCustomer.cusName);
                $("#customerAddress").val(foundCustomer.cusAddress);
                $("#customerSalary").val(foundCustomer.cusSalary);                
                console.log("Customer Found!", foundCustomer);
            } else {
                alert("Customer ID not found!");
                clearCustomerAll();
            }
        }
    });

    // Clear All Button in Customer Page

    $('#clearCustomer').click(function (event){
        event.preventDefault();
        clearCustomerAll();
    })

    // Save to the Customer Table
    
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


    // Remove from customer table

    function removeFromTable(cusId) {
        $("#customer-table tbody tr").each(function () {
            let rowId = $(this).find("td:first").text();
            if (rowId === cusId) {
                $(this).remove();
            }
        });
    }


    // Update the Customer table
    
    function updateTable(customer) {
        $("#customer-table tbody tr").each(function () {
            let rowId = $(this).find("td:first").text();
    
            if (rowId === customer.cusId) {
                $(this).find("td:eq(1)").text(customer.cusName);
                $(this).find("td:eq(2)").text(customer.cusAddress);
                $(this).find("td:eq(3)").text(customer.cusSalary);
            }
        });
    }

    function validateCustomerID() {
        let $input = $('#customerID');
        let value = $input.val().trim();
        let $errorSpan = $('#cusIdError');
        let pattern = /^C\d{2} - \d{3}$/;

        if (!value) {
            $input.css('border', '2px solid red');
            $errorSpan.text('The text box is empty').css('color', 'red');
            return false;
        } else if (!pattern.test(value)) {
            $input.css('border', '2px solid red');
            $errorSpan.text('Invalid format! (e.g., C00 - 001)').css('color', 'red');
            return false;
        } else {
            $input.css('border', '2px solid green');
            $errorSpan.text('').css('color', 'green');
            return true;
        }
    }

    function loadNextCustomerId() {
        let nextId = customerModel.getNextCustomerId();
        $("#customerID").val(nextId).prop("readonly", false); 
    }

    // ---------------------------------------------
    function loadAllCustomers() {
        const customers = customerModel.loadAllCustomersFromModel(); 
        displayAllCustomers(customers);
    }

    function displayAllCustomers(customers) {
        const tbody = $("#customer-table tbody");
        tbody.empty(); 
    
        customers.forEach(customer => {
            let row = `<tr>
                <td>${customer.cusId}</td>
                <td>${customer.cusName}</td>
                <td>${customer.cusAddress}</td>
                <td>${customer.cusSalary}</td>
            </tr>`;
    
            tbody.append(row); 
        });
    }
    // ---------------------------------------------

    function rowCustomerTableClick() {
        $(document).on("click", "#customer-table tbody tr", function () {
            clearCustomerAll();
            let cusId = $(this).find("td:eq(0)").text();
            let cusName = $(this).find("td:eq(1)").text();
            let cusAddress = $(this).find("td:eq(2)").text();
            let cusSalary = $(this).find("td:eq(3)").text();
    
            $("#customerID").val(cusId);
            $("#customerName").val(cusName);
            $("#customerAddress").val(cusAddress);
            $("#customerSalary").val(cusSalary);
        });
    }

    function clearCustomerAll(){
        $(".customer-form")[0].reset();
        $(".customer-form input").css("border", "");
        $('.validateError').text("");

        loadNextCustomerId();
    }
});