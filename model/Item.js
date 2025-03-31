import { itemsArray } from '../db/DB.js';

export const itemModel = {
    saveItem,
    deleteItem,
    updateItem,
    findItemByCode,
    getItemCodes,
    getUpdatedArray,
    getNextItemId,
    getAllItems
};

function saveItem(item) {
    let existingItem = itemsArray.find(i => i.itemCode.toString() === item.itemCode.toString());

    if (existingItem) {
        console.log(`Item with Code ${item.itemCode} already exists. Cannot save duplicate.`);
        alert(`Item with Code ${item.itemCode} already exists!`);
        return false;
    }

    itemsArray.push(item);
    console.log(itemsArray);
    console.log(`Item with Code ${item.itemCode} saved.`);
    return true;
}

function deleteItem(itemCode) {
    let index = itemsArray.findIndex(item => item.itemCode.toString() === itemCode.toString());

    if (index !== -1) {
        itemsArray.splice(index, 1);
        console.log(`Item with Code ${itemCode} removed.`);
        console.log(itemsArray);
        // updateCounts();
        return true;
    } else {
        console.log(`Item with Code ${itemCode} not found.`);
        return false;
    }
}

function updateItem(item) {
    let existingItem = itemsArray.find(i => i.itemCode.toString() === item.itemCode.toString());

    if (existingItem) {
        Object.assign(existingItem, item);
        console.log(`Item with Code ${item.itemCode} updated.`);
        console.log(itemsArray);
        // updateCounts();
        return true;
    } else {
        console.log(`Item with Code ${item.itemCode} not found.`);
        return false;
    }
}

function findItemByCode(itemCode) {
    itemCode = itemCode.toString().trim();
    let existingItem = itemsArray.find(i => i.itemCode.toString() === itemCode);

    if (existingItem) {
        return existingItem;
    } else {
        alert(`Item with Code ${itemCode} not found.`);
        return false;
    }
}

function getAllItems() {
    return itemsArray;
}

function getItemCodes() {
    if (!Array.isArray(itemsArray)) {
        console.error("Error: itemsArray is not an array");
        return [];
    }
    return itemsArray.map(item => item.itemCode);
}

function getNextItemId() {
    if (itemsArray.length === 0) {
        return "I00 - 001";
    }
    let maxId = Math.max(
        ...itemsArray.map(item => parseInt(item.itemCode.split("-")[1].trim(), 10))
    );

    let nextId = maxId + 1; 
    return `I00 - ${String(nextId).padStart(3, "0")}`; 
}

function getUpdatedArray() {
    return itemsArray;
}