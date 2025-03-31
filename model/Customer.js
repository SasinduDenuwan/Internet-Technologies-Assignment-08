import { customersArray } from '../db/DB.js';

export const customerModel = {
    saveCustomer,
    deleteCustomer,
    updateCustomer,
    findCustomerById,
    getCustomerIds,
    getNextCustomerId,
    loadAllCustomersFromModel
};

function saveCustomer(customer) {
    
    let existingCustomer = customersArray.find(c => c.cusId.toString() === customer.cusId.toString());

    if (existingCustomer) {
        console.log(`Customer with ID ${customer.cusId} already exists. Cannot save duplicate.`);
        alert(`Customer with ID ${customer.cusId} already exists!`);
        return false;
    }else{
        customersArray.push(customer);
        console.log(customersArray);
        // updateCounts();
        console.log(`Customer with ID ${customer.cusId} saved.`);
        return true;
    }
}

function deleteCustomer(cusId) {
    let index = customersArray.findIndex(customer => customer.cusId === cusId);

    if (index !== -1) {
        customersArray.splice(index, 1); // Remove customer from the array
        alert(`Customer with ID ${cusId} removed.`);
        console.log(customersArray);
        // updateCounts();
        return true;
    } else {
        alert(`Customer with ID ${cusId} not found.`);
        return false;
    }
}

function updateCustomer(customer) {
    function matchCustomer(c) {
        return c.cusId === customer.cusId;
    }

    let existingCustomer = customersArray.find(matchCustomer);

    if (existingCustomer) {
        Object.assign(existingCustomer, customer);

        console.log(`Customer with ID ${customer.cusId} updated.`);
        console.log(customersArray);
        return true;
    } else {
        console.log(`Customer with ID ${customer.cusId} not found.`);
        return false;
    }
}

function loadAllCustomersFromModel() {
    return customersArray; 
}

function findCustomerById(customerId) {
    customerId = customerId.toString().trim();

    let existingCustomer = customersArray.find(c => c.cusId.toString() === customerId);

    if (existingCustomer) {
        return existingCustomer;
    } else {
        console.log(`Customer with ID ${customerId} not found.`);
        return false;
    }
}

function getCustomerIds() {
    if (!Array.isArray(customersArray)) {
        console.error("Error: customersArray is not an array");
        return [];
    }
    return customersArray.map(customer => customer.cusId);
}

function getNextCustomerId() {
    if (customersArray.length === 0) {
        return "C00 - 001"; // Start from C00 - 001 if no customers exist
    }

    // Extract numeric part from IDs (e.g., C00 - 001 -> 001)
    let maxId = Math.max(
        ...customersArray.map(c => parseInt(c.cusId.split(" - ")[1], 10))
    );

    let nextId = maxId + 1;
    return `C00 - ${String(nextId).padStart(3, "0")}`; // Format with leading zeros
}
