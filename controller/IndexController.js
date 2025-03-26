$(document).ready(function () {
    $(".dashboard").hide();
    $("#dashboardID").show();

    $(".nav-bar-btn").click(function () {
        let buttonName = $(this).text();

        if (buttonName === "Home") {
            $(".main-heading").text("Dashboard");
        }
        if (buttonName === "Customer") {
            $(".main-heading").text("Customers");
        }
        if (buttonName === "Item") {
            $(".main-heading").text("Items");
        }
        if (buttonName === "Orders") {
            $(".main-heading").text("Orders");
        }
    });
});