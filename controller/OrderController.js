import { updateItemTableAfterOrder } from '../controller/ItemController.js';
import { orderModel } from '../model/Order.js';
import { orderDetailsModel } from '../model/OrderDetails.js';
import { customerModel } from '../model/Customer.js';
import { itemModel } from '../model/Item.js';
 
let totalPrice = 0;

$(document).ready(function () {
    loadNextOrderId();

    $("#txtOrderID").on("input", function () {
        let orderId = $(this).val().trim();  
        if (orderId) {
            searchOrder(orderId);  
        }
    });

    $("#cmbCustomer").click(function () {
        let select = $("#cmbCustomer");
    
        let customers = customerModel.getCustomerIds();
        let selectedValue = select.val();  // Get the currently selected value
    
        select.empty();
        
        if (!customers || !Array.isArray(customers)) {
            console.error("Error: customerIDs is not an array");
            return;
        }
    
        // Append options to the dropdown
        customers.forEach(id => {
            let customer = customerModel.findCustomerById(id);
            let option = $(`<option value="${id}">${customer.cusName}</option>`);  // Display customer name
    
            // If the customer id matches the selected value, set as selected
            if (id === selectedValue) {
                option.attr("selected", "selected");
            }
            select.append(option);
        });
    });

    $("#cmbCustomer").on("change", function () {
        let selectedValue = $(this).val();
    
        if (selectedValue) {
            $(this).find("option:selected").text(selectedValue);  // Change displayed text to the selected customer name
            setCustomerDetails(selectedValue);  
        } 
    });

    function setCustomerDetails(id) {
        let cusDetails = customerModel.findCustomerById(id);
        if (cusDetails) {
            $('#txtCustomerID').val(cusDetails.cusId);
            $('#txtCustomerName').val(cusDetails.cusName);
            $('#txtCustomerAddress').val(cusDetails.cusAddress);
            $('#txtCustomerSalary').val(cusDetails.cusSalary);
        }
    }


    $("#cmbItem").click(function () {
    let select = $("#cmbItem");

    let items = itemModel.getItemCodes();
    let selectedValue = select.val(); 

    select.empty();

    if (!items || !Array.isArray(items)) {
        console.error("Error: itemCodes is not an array");
        return;
    }

    items.forEach(code => {
        let item = itemModel.findItemByCode(code);
        let option = $(`<option value="${code}">${item.itemName}</option>`); 

        if (code === selectedValue) {
            option.attr("selected", "selected");
        }

            select.append(option);
        });
    });

    $("#cmbItem").on("change", function () {
        let selectedValue = $(this).val();

        if (selectedValue) {
            $(this).find("option:selected").text(selectedValue);  
            setItemDetails(selectedValue); 
        }
    });
    function setItemDetails(code) {
        let itemDetails = itemModel.findItemByCode(code);
        if (itemDetails) {
            $('#txtItemCode').val(itemDetails.itemCode);
            $('#txtItemName').val(itemDetails.itemName);
            $('#txtItemPrice').val(itemDetails.itemPrice);
            $('#txtItemQtyOnHand').val(itemDetails.itemQtyOnHand);
        }
    }

    // --------------- order process ----------------

    
    $('#addItemBtn').click(function (event) {
        
        event.preventDefault();
    
        if (isOrderValidated()) {
            
            let price = parseFloat($('#txtItemPrice').val());
            let quantity = parseInt($('#txtItemQtyOnHand').val());
    
            let itemCode = $('#txtItemCode').val(); // Get the item code of the selected item
            let item = itemModel.findItemByCode(itemCode); // Get item details based on the item code
    
            if (item) {
                let availableQty = item.itemQtyOnHand; // Quantity on hand for the selected item
    
                // Check if entered quantity is greater than available quantity
                if (quantity > availableQty) {
                    $('#orderQtyError').text(`Cannot order more than ${availableQty} items. Available stock: ${availableQty}`);
                    return; // Stop further processing if the quantity exceeds the available stock
                } else {
                    $('#orderQtyError').text(''); // Clear any previous error message if the quantity is valid
                }
    
                let total = price * quantity;
                totalPrice += total;
    
                let orderItem = {
                    orderId: $('#txtOrderID').val(),
                    itemCode: itemCode,
                    itemName: $('#txtItemName').val(),
                    itemPrice: price,
                    itemQty: quantity,
                    total: total
                };
    
                // Save the order item details
                orderDetailsModel.saveOrderDetails(orderItem);
                addToOrderTable(orderItem);
                updateTotal(totalPrice);
                clearOrderItemFields();
            }

            resetOrderForm();
        }

    });

    $('#txtPriceDiscount').on('input', function () {
        updateTotal();
    });

    $('#txtPriceCash').on('input', function () {
        updateBalance(); 
    });

    $('#purchaseBtn').click(function (event) {
        event.preventDefault();
    
        if (isOrderFinalized()) {
            let order = {
                orderId: $('#txtOrderID').val(),
                orderDate: $('#txtOrderDate').val(),
                customerId: $('#txtCustomerID').val(),
                cash: parseFloat($('#txtPriceCash').val()),
                discount: parseFloat($('#txtPriceDiscount').val()) || 0,
                balance: parseFloat($('#v').val())
            };
    
            let isSaved = orderModel.saveOrder(order);
    
            if (isSaved) {
                // Reduce stock quantities for ordered items
                $('#orderTable tbody tr').each(function () {
                    let itemCode = $(this).find('td:eq(0)').text();
                    let orderedQty = parseInt($(this).find('td:eq(3)').text());
    
                    let item = itemModel.findItemByCode(itemCode);
                    if (item) {
                        let newQtyOnHand = item.itemQtyOnHand - orderedQty;
                        
                        if (newQtyOnHand < 0) {
                            alert(`Not enough stock for item ${itemCode}`);
                            return;
                        }
    
                        // Update item quantity
                        itemModel.updateItem({
                            ...item,
                            itemQtyOnHand: newQtyOnHand
                        });
                    }
                });
    
                updateItemTableAfterOrder(itemModel.getUpdatedArray());
                alert("Order Placed Successfully!");
                resetOrderForm();
                // updateCounts();
            }
        }
    });
    

    $('#orderQtyTxt').on('input', function () {
        let enteredQty = parseInt($(this).val());
        let itemCode = $('#orderItemCodeTxt').val(); // Get the selected item's code
    
        if (itemCode) {
            let item = itemModel.findItemByCode(itemCode); // Get item details based on the item code
            if (item) {
                let availableQty = item.itemQtyOnHand; // Quantity on hand from the item model
    
                // Check if entered quantity is greater than available quantity
                if (enteredQty > availableQty) {
                    $('#orderQtyTxtError').text(`Cannot order more than ${availableQty} items. Available stock: ${availableQty}`);
                } else {
                    $('#orderQtyTxtError').text(''); // Clear the error message if the quantity is valid
                }
            }
        }
    });



});

function loadNextOrderId() {
    let nextOrderId = orderModel.getNextOrderId();
    $("#txtOrderID").val(nextOrderId).prop("readonly", false);
}

function addToOrderTable(orderItem) {
    let newRow = `<tr>
        <td>${orderItem.itemCode}</td>
        <td>${orderItem.itemName}</td>
        <td>${orderItem.itemPrice.toFixed(2)}</td>
        <td>${orderItem.itemQty}</td>
        <td>${orderItem.total.toFixed(2)}</td>
    </tr>`;

    $("#orderTable tbody").append(newRow);
}

function clearOrderItemFields() {
    $('#orderItemCodeTxt').val('');
    $('#orderitemNameTxt').val('');
    $('#orderItemPriceTxt').val('');
    $('#orderQtyTxt').val('');
}


function updateTotal() {
    let discount = parseFloat($('#txtPriceDiscount').val()) || 0; 
    let total = totalPrice - discount; 

    $('#SubTotalGeneratePrice').text(total.toFixed(2)); 
    $('#totalGeneratePrice').text(totalPrice.toFixed(2)); 

    updateBalance(); 
}


function updateBalance() {
    let totalAfterDiscount = parseFloat($('#SubTotalGeneratePrice').text()) || 0; 
    let cash = parseFloat($('#txtPriceCash').val()) || 0; 
    
    let balance = cash - totalAfterDiscount; 

    $('#txtPriceBalance').val(balance.toFixed(2)); 
}


// 
// 
// 
// 
// 
// 





function isOrderValidated() {
    let isValid = true;

    if (!$('#txtItemCode').val()) {
        $("#txtCustomerSelectError").text("Select a Customer");
        isValid = false;
    } else {
        $("#txtCustomerSelectError").text("");
    }
    if (!$('#txtOrderQty').val()) {
        $("#orderQtyError").text("Enter order qty");
        isValid = false;
    } else {
        $("#orderQtyError").text("");
    }
    if (!$('#txtItemCode').val()) {
        $("#txtItemSelectError").text("Select a Item");
        isValid = false;
    } else {
        $("#txtItemSelectError").text("");
    }

    return isValid;
}

function isOrderFinalized() {
    let isValid = true;

    if (!$('#txtCustomerID').val()) {
        $("#txtCustomerSelectError").text("Select a Customer");
        isValid = false;
    } else {
        $("#txtCustomerSelectError").text("");
    }
    if (!$('#txtOrderDate').val()) {
        $("#txtOrderDateError").text("Select the Date");
        isValid = false;
    } else {
        $("#txtOrderDateError").text("");
    }
    if (parseFloat($('#totalGeneratePrice').text()) <= 0) {
        $("#totalGeneratePriceError").text("Total amount must be greater than 0");
        isValid = false;
    } else {
        $("#totalGeneratePriceError").text("");
    }
    if (parseFloat($('#SubTotalGeneratePrice').text()) <= 0) {
        $("#subTotalPriceError").text("SubTotal must be greater than 0");
        isValid = false;
    } else {
        $("#subTotalPriceError").text("");
    }
    if (!$('#txtPriceCash').val()) {
        $("#txtPriceCashError").text("Enter Cash Amount");
        isValid = false;
    } else {
        $("#txtPriceCashError").text("");
    }
    if (!$('#txtPriceBalance').val()) {
        $("#txtPriceBalanceError").text("Enter Balance");
        isValid = false;
    } else {
        $("#txtPriceBalanceError").text("");
    }

    return isValid;
}

function resetOrderForm() {
    // $('#orderSectionID input').val('');

    $('#cmbCustomer').val('option0');
    $('#cmbItem').val('option0');

    $('#totalGeneratePrice').text('00.0');
    $('#SubTotalGeneratePrice').text('00.0');
    $('#txtPriceBalance').val('');

    $('#txtOrderDate').val('');
    $('#txtCustomerID').val('');
    $('#txtCustomerName').val('');
    $('#txtCustomerSalary').val('');
    $('#txtCustomerAddress').val('');

    $('#txtItemCode').val('');
    $('#txtItemName').val('');
    $('#txtItemPrice').val('');
    $('#txtItemQtyOnHand').val('');
    $('#txtOrderQty').val('');

    $('.validateError').text('');

    $('#orderTable tbody').empty();

}

function searchOrder(orderId) {
    let order = orderModel.findOrderById(orderId);
    
    if (order) {
        $("#txtOrderID").val(order.orderId);
        $("#txtOrderDate").val(order.orderDate);
        $("#txtCustomerID").val(order.customerId);

        let orderDetails = orderDetailsModel.findOrderDetailsByOrderId(orderId);

        if (orderDetails.length > 0) {
            $('#orderTable tbody').empty();
            orderDetails.forEach(orderItem => {
                let item = itemModel.findItemByCode(orderItem.itemCode);
                let itemName = item ? item.itemName : "Item Not Found";

                let newRow = `<tr>
                    <td>${orderItem.itemCode}</td>
                    <td>${itemName}</td>
                    <td>${orderItem.itemPrice.toFixed(2)}</td>
                    <td>${orderItem.itemQty}</td>
                    <td>${orderItem.total.toFixed(2)}</td>
                </tr>`;
                $("#orderTable tbody").append(newRow);
            });

            loadCustomerforOrderSearch(order.customerId);
            setTotalAndBalance(order);
        }
    } else {
        $('#orderTable tbody').empty();
    }
}


function setTotalAndBalance(order) {
    if (order) {
    
        let cash = parseFloat(order.cash) || 0.00;
        let discount = parseFloat(order.discount) || 0.00;
        let balance = parseFloat(order.balance) || 0.00;

        let total = 0;
        $('#orderTable tbody tr').each(function () {
            let rowTotal = parseFloat($(this).find('td:eq(4)').text()) || 0; // Get item total from the table
            total += rowTotal; 
        });

        let subtotal = total - discount;

        $("#txtPriceCash").val(cash.toFixed(2));
        $("#txtPriceDiscount").val(discount.toFixed(2));
        $("#txtPriceBalance").val(balance.toFixed(2));
        $("#SubTotalGeneratePrice").text(subtotal.toFixed(2));  
        $("#totalGeneratePrice").text(total.toFixed(2));       
    } else {
        $("#txtPriceCash").val('0.00');
        $("#txtPriceDiscount").val('0.00');
        $("#txtPriceBalance").val('0.00');
        $("#SubTotalGeneratePrice").text('0.00');
        $("#totalGeneratePrice").text('0.00');
    }
}


function loadCustomerforOrderSearch(cusId){
    let customerId = cusId;

        if (customerId) {
            let customer = customerModel.findCustomerById(customerId);
            if (customer) {
                $('#txtCustomerName').val(customer.cusName);
                $('#txtCustomerAddress').val(customer.cusAddress);
                $('#txtCustomerSalary').val(customer.cusSalary);
            } else {
                $('#txtCustomerName').val('');
                $('#txtCustomerAddress').val('');
                $('#txtCustomerSalary').val('');
            }
        } else {
            $('#txtCustomerName').val('');
            $('#txtCustomerAddress').val('');
            $('#txtCustomerSalary').val('');
        }
}