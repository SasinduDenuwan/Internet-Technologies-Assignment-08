import { itemModel } from '../model/Item.js';

$(document).ready(function () {

    itemRowClick();
    loadNextItemId();
    loadAllItems();

    $('#saveItem').click(function (event) {
        event.preventDefault();
        if (validateAllFields()){
            let item = {
                itemCode: $('#itemID').val(),
                itemName: $('#itemName').val(),
                itemQtyOnHand: $('#itemQty').val(),
                itemPrice: $('#itemPrice').val()
            };
    
            let isSaved = itemModel.saveItem(item);
    
            if (isSaved) {
                addToTable(item);
                clearItemAll();
                alert("Item saved successfully!");
                loadNextItemId();
            }
        }
    });
    
    $('#removeItem').click(function (event) {
        event.preventDefault();
        let itemCode = $('#itemID').val().trim();

        if (!itemCode) {
            $("#itemCodeError").text("Please enter the Item Code to delete.");
            return;
        } else {
            $("#itemCodeError").text("");
        }

        let isDeleted = itemModel.deleteItem(itemCode);

        if (isDeleted) {
            removeFromTable(itemCode);
            alert("Item deleted successfully!");
            $(".item-form")[0].reset();
            clearItemAll();
            loadNextItemId();
        } else {
            alert("Item ID not found !!!");
        }
    });

    $('#updateItem').click(function (event) {
        event.preventDefault();
        if (validateAllFields()) {
            let item = {
                itemCode: $('#itemID').val(),
            };

            let itemName = $('#itemName').val();
            let itemQtyOnHand = $('#itemQty').val();
            let itemPrice = $('#itemPrice').val();

            if (itemName) item.itemName = itemName;
            if (itemQtyOnHand) item.itemQtyOnHand = itemQtyOnHand;
            if (itemPrice) item.itemPrice = itemPrice;

            let isUpdated = itemModel.updateItem(item);

            if (isUpdated) {
                updateTable(item);
                console.log("Item updated successfully!");
                $(".item-form")[0].reset();
                clearItemAll();
                loadNextItemId();
            } else {
                alert("Item Code not found! Unable to update.");
            }
        }
    });

    $('#clearItem').click(function (event) {
        event.preventDefault();
        $(".item-form")[0].reset();
        clearItemAll();
    });

    $('#getAllItem').click(function (event) {
        event.preventDefault();
        if (validateItemID()) {
            let itemCode = $('#itemID').val().trim();

            let foundItem = itemModel.findItemByCode(itemCode);

            if (foundItem) {
                console.log("Item Found!", foundItem);
                $("#itemID").val(foundItem.itemCode);
                $("#itemName").val(foundItem.itemName);
                $("#itemQty").val(foundItem.itemQtyOnHand);
                $("#itemPrice").val(foundItem.itemPrice);
            } else {
                alert("Item Code not found!");
            }
        }
    }); 

    function validateItemID() {
        let $input = $('#itemID');
        let value = $input.val().trim();
        let $errorSpan = $('#itemCodeError');
        let pattern = /^I\d{2} - \d{3}$/;

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

    function validateField($input, pattern, errorSpanId, errorMessage) {
        let value = $input.val().trim();
        let $errorSpan = $('#' + errorSpanId);
    
        if (!value) {
            $input.css('border', '2px solid red');
            $errorSpan.text('This field cannot be empty').css('color', 'red');
            return false;
        } else if (!pattern.test(value)) {
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
        isValid &= validateField($('#itemID'), /^I\d{2}\s?-\s?\d{3}$/, 'itemCodeError', 'Invalid format! (e.g., I00 - 001)');
        isValid &= validateField($('#itemName'), /^[A-Za-z\s]+$/, 'itemNameError', 'Only letters and spaces allowed.');
        isValid &= validateField($('#itemQty'), /^[1-9]\d*$/, 'itemQtyError', 'Quantity must be a positive integer.');
        isValid &= validateField($('#itemPrice'), /^\d+(\.\d{1,2})?$/, 'itemUnitPriceError', 'Unit price must be a valid number with up to 2 decimal places.');
        return !!isValid;
    }
    
    $('#itemID, #itemName, #itemQty, #itemPrice').on('input', function () {
        let validationRules = {
            'itemID': [/^I\d{2}\s?-\s?\d{3}$/, 'itemCodeError', 'Invalid format! (e.g., I00 - 001)'],
            'itemName': [/^[A-Za-z\s]+$/, 'itemNameError', 'Only letters and spaces allowed.'],
            'itemQty': [/^[1-9]\d*$/, 'itemQtyError', 'Quantity must be a positive integer.'],
            'itemPrice': [/^\d+(\.\d{1,2})?$/, 'itemUnitPriceError', 'Unit price must be a valid number with up to 2 decimal places.']
        };
    
        let fieldId = $(this).attr('id');
        validateField($(this), ...validationRules[fieldId]);
    });
    

});

function clearItemAll(){
    $(".item-form")[0].reset();
    $(".item-form input").css("border", "");
    $('.validateError').text("");
}


function loadNextItemId() {
    let nextId = itemModel.getNextItemId();
    $("#itemID").val(nextId).prop("readonly", false);
}

function itemRowClick() {
    $(document).on("click", "#item-table tbody tr", function () {
        clearItemAll();
        let itemCode = $(this).find("td:eq(0)").text();
        let itemName = $(this).find("td:eq(1)").text();
        let itemQtyOnHand = $(this).find("td:eq(2)").text();
        let itemPrice = $(this).find("td:eq(3)").text();

        $("#itemID").val(itemCode);
        $("#itemName").val(itemName);
        $("#itemQty").val(itemQtyOnHand);
        $("#itemPrice").val(itemPrice);
    });
}

function addToTable(item) {
    let newRow = `<tr>
        <td>${item.itemCode}</td>
        <td>${item.itemName}</td>
        <td>${item.itemQtyOnHand}</td>
        <td>${item.itemPrice}</td>
    </tr>`;

    $("#item-table tbody").append(newRow);
}

function removeFromTable(itemCode) {
    $("#item-table tbody tr").each(function () {
        let rowCode = $(this).find("td:first").text();
        if (rowCode === itemCode) {
            $(this).remove();
        }

    });
}

//----------------------------
function loadAllItems() {
    const items = itemModel.getAllItems();
    displayItems(items); 
}

function displayItems(items) {
    const tbody = $("#item-table tbody");
    tbody.empty(); 

    items.forEach(item => {
        let row = `<tr>
            <td>${item.itemCode}</td>
            <td>${item.itemName}</td>
            <td>${item.itemQtyOnHand}</td>
            <td>${item.itemPrice}</td>
        </tr>`;

        tbody.append(row); // Append the row to the table body
    });
}
//----------------------------

function updateTable(item) {
    $("#item-table tbody tr").each(function () {
        let rowCode = $(this).find("td:first").text();

        if (rowCode === item.itemCode) {
            $(this).find("td:eq(1)").text(item.itemName);
            $(this).find("td:eq(2)").text(item.itemQtyOnHand);
            $(this).find("td:eq(3)").text(item.itemPrice);
        }
    });
}

export function updateItemTableAfterOrder(updatedItems) {
    // Loop through each item and update the quantity in the table while leaving other details unchanged
    updatedItems.forEach(updatedItem => {
        // Find the table row corresponding to this item based on itemCode
        let row = $("#item-table tbody tr").filter(function() {
            return $(this).find("td").first().text() === updatedItem.itemCode.toString();
        });

        // If the item row exists, update the itemQtyOnHand column (third column so eq(2))
        if (row.length > 0) {
            row.find("td").eq(2).text(updatedItem.itemQtyOnHand);
        }
    });

    console.log("Item table updated with latest item quantities.");
}