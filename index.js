// API endpoint base url to backend spring boot project car-rental-v2
const apiBaseUrl = "http://localhost:9090/api/v1";

// On document ready section, bind functions to DOM
$(document).ready(function () {
    // Add eventlistener for nav-sections navs (jQuery)
    $("#welcome-nav").on("click", function () { loadHomeContent() });
    $("#customers-nav").on("click", function () { loadAllCustomers() });




    ////------------------------- SORTING FUNCTIONS BY NUMBER --------------------------////
    // Sorting click functions by id, ssn, date of birth; both event and definition are here

    $(document).on("click", ".sortById", async function (event) {
        event.preventDefault();
        const customersToSortByNum = await getCustomersList(); // Get customers list

        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortByAsc")) {
            customers = customersToSortByNum.sort(function (b, a) { return a.id - b.id });
            currentSortClass = "sortById sortByDesc"; // Change to asc for next sort
            upOrDown = "up";
        } else if ($(this).hasClass("sortByDesc")) {
            customers = customersToSortByNum.sort(function (a, b) { return a.id - b.id });
            currentSortClass = "sortById sortByAsc"; // Change to desc for next sort
            upOrDown = "down";
        }

        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }

        // Assign table class in alignment with the coorporation styleguide
        const tableTop = '<table class="multiple-col-table" id="customersTable">';

        // Create first table row; also add "btns" for sorting
        const tableHead = '<thead><tr><th class="' + currentSortClass + '"># <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';

        // Create rest of the parts
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';

        // Use the created table parts as args in jquery/ajax .html() method
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);

    });

    $(document).on("click", ".sortBySsn", async function (event) {
        event.preventDefault();
        const customersToSortByNum = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortByAsc")) {
            customers = customersToSortByNum.sort(function (b, a) { return parseInt(a.ssn) - parseInt(b.ssn) });
            currentSortClass = "sortBySsn sortByDesc";
            upOrDown = "up";
        } else if ($(this).hasClass("sortByDesc")) {
            customers = customersToSortByNum.sort(function (a, b) { return parseInt(a.ssn) - parseInt(b.ssn) });
            currentSortClass = "sortBySsn sortByAsc"; // Change to desc for next sort
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">SSN <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByDob", async function (event) {
        event.preventDefault();
        const customersToSortByNum = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortByAsc")) {
            customers = customersToSortByNum.sort(function (b, a) { return parseInt(a.dateOfBirth) - parseInt(b.dateOfBirth) });
            currentSortClass = "sortByDob sortByDesc";
            upOrDown = "up";
        } else if ($(this).hasClass("sortByDesc")) {
            customers = customersToSortByNum.sort(function (a, b) { return parseInt(a.dateOfBirth) - parseInt(b.dateOfBirth) });
            currentSortClass = "sortByDob sortByAsc";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="SortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Date of Birth <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByNumOfOrders", async function (event) {
        event.preventDefault();
        const customersToSortByNum = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortByAsc")) {
            customers = customersToSortByNum.sort(function (b, a) { return a.ordersByCustomer.length - b.ordersByCustomer.length });
            currentSortClass = "sortByNumOfOrders sortByDesc";
            upOrDown = "up";
        } else if ($(this).hasClass("sortByDesc")) {
            customers = customersToSortByNum.sort(function (a, b) { return a.ordersByCustomer.length - b.ordersByCustomer.length });
            currentSortClass = "sortByNumOfOrders sortByAsc";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="SortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Orders <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });


    ////---------------- SORTING FUNCTIONS BY ALPHABETICAL ORDER --------------------////
    // Sorting click functions by email, names adress; both event and definition are here

    $(document).on("click", ".sortByEmail", async function (event) {
        event.preventDefault();
        const customersToSortByAlp = await getCustomersList(); // Get customers list

        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortFromA")) {
            customers = customersToSortByAlp.sort((b, a) => a.email.localeCompare(b.email));
            currentSortClass = "sortByEmail sortToA"; // Change to asc for next sort
            upOrDown = "up";
        } else if ($(this).hasClass("sortToA")) {
            customers = customersToSortByAlp.sort((a, b) => a.email.localeCompare(b.email));
            currentSortClass = "sortByEmail sortFromA"; // Change to desc for next sort
            upOrDown = "down";
        }

        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }

        // Assign table class in alignment with the coorporation styleguide
        const tableTop = '<table class="multiple-col-table" id="customersTable">';

        // Create first table row; also add "btns" for sorting
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Email <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';

        // Create rest of the parts
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';

        // Use the created table parts as args in jquery/ajax .html() method
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByFirstName", async function (event) {
        event.preventDefault();
        const customersToSortByAlp = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortFromA")) {
            customers = customersToSortByAlp.sort((b, a) => a.fName.localeCompare(b.fName));
            currentSortClass = "sortByFirstName sortToA";
            upOrDown = "up";
        } else if ($(this).hasClass("sortToA")) {
            customers = customersToSortByAlp.sort((a, b) => a.fName.localeCompare(b.fName));
            currentSortClass = "sortByFirstName sortFromA";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">First Name <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByLastName", async function (event) {
        event.preventDefault();
        const customersToSortByAlp = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortFromA")) {
            customers = customersToSortByAlp.sort((b, a) => a.lName.localeCompare(b.lName));
            currentSortClass = "sortByLastName sortToA";
            upOrDown = "up";
        } else if ($(this).hasClass("sortToA")) {
            customers = customersToSortByAlp.sort((a, b) => a.lName.localeCompare(b.lName));
            currentSortClass = "sortByLastName sortFromA";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Last Name <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByAddress", async function (event) {
        event.preventDefault();
        const customersToSortByAlp = await getCustomersList();
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortFromA")) {
            customers = customersToSortByAlp.sort((b, a) => a.lName.localeCompare(b.lName));
            currentSortClass = "sortByAddress sortToA";
            upOrDown = "up";
        } else if ($(this).hasClass("sortToA")) {
            customers = customersToSortByAlp.sort((a, b) => a.lName.localeCompare(b.lName));
            currentSortClass = "sortByAddress sortFromA";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < customers.length; i++) {
            tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
                customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
                customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
                '</td><td>' +
                '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
                customers[i].ordersByCustomer.length + '</td></tr>';
        }
        const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Address <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of cars to rent</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });


    // Add eventlistener + function for orders preview for admin after click on custoemr order column
    $(document).on("click", ".customer-orders-btn", async function () {

        var btn = this;
        let customerId = btn.id.slice(8);
        let customerIdNum = Number(customerId);
        console.log(customerIdNum);

        // Get current car in order to show details for that car
        const customers = await getCustomersList();
        var currentCustomer;
        for (var i = 0; i < customers.length; i++) {
            if (customers[i].id === customerIdNum) { // index i is from 0, id is from 1
                currentCustomer = customers[i];
            }
        }

        $("#main-content").append('<div id="panel-div" class="sidepanel"></div>');

        const panelHeader =
            '<span class="closing-panel-x"><i class="fa-solid fa-xmark"></i></span>' +
            '<h6>Orders by customer ' + currentCustomer.fName + ' ' + currentCustomer.lName +
            ' with Ssn ' + currentCustomer.ssn + '</h6>';

        const tableTop = '<table class="multiple-col-table" id="carsTable">';

        const tableHead = '<thead><tr><th>Order id </th><th>Order Nr</th>' +
            '<th>From</th><th>To</th><th>Car Id</th><th>Price</th></tr></thead>';

        const tableBottom = '</table>' +
            '<div><img src="https://thispersondoesnotexist.com/image" alt="Pic of customer"></div>';


        let tableRows = '';
        for (var i = 0; i < currentCustomer.ordersByCustomer.length; i++) {
            tableRows += '<tr><td>' + currentCustomer.ordersByCustomer[i].id + '</td><td>' +
                currentCustomer.ordersByCustomer[i].orderNr + '</td><td>' + currentCustomer.ordersByCustomer[i].firstRentalDay +
                '</td><td>' + currentCustomer.ordersByCustomer[i].lastRentalDay + '</td><td>' + currentCustomer.ordersByCustomer[i].carId + '</td><td>' +
                currentCustomer.ordersByCustomer[i].price + '</td></tr>';
        }

        $("#panel-div").html(panelHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    // Close opened panel, by reloading order details for same order
    $(document).on("click", ".closing-panel-x", async function () {
         // Use load customers function to to reload same view
         loadAllCustomers();
    });





});









/////--------- HOME, ADMIN INFO, LOGOUT fucntions ------------/////

function loadHomeContent() {
    $("#main-content").html(
        '<h3>TW Car Rental Admin Web</h3>' +

        '<div id="carouselExampleInterval" class="carousel slide" data-bs-ride="carousel">' +
        '<div class="carousel-inner">' +
        '<div class="carousel-item active" data-bs-interval="3000">' +
        '<img src="images/welcome-pic1.jpg" class="d-block w-100" alt="Car commercial picture">' +
        '</div>' +
        '<div class="carousel-item" data-bs-interval="2000">' +
        '<img src="images/welcome-pic2.jpg" class="d-block w-100" alt="Car driving picture">' +
        '</div>' +
        '<div class="carousel-item">' +
        '<img src="images/welcome-pic3.jpg" class="d-block w-100" alt="Car travelling picture">' +
        '</div>' +
        '</div>' +
        '<button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="prev">' +
        '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
        '<span class="visually-hidden">Previous</span>' +
        '</button>' +
        '<button class="carousel-control-next" type="button" data-bs-target="#carouselExampleInterval" data-bs-slide="next">' +
        '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
        '<span class="visually-hidden">Next</span>' +
        '</button>' +
        '</div>'
    );
}

















////--------------- DISPLAY CUSTOMERS ------------------////

const loadAllCustomers = async () => {
    const customers = await getCustomersList();

    // Creating table cells and populate it with customers fetched from backend
    let tableRows = '';
    for (var i = 0; i < customers.length; i++) {
        tableRows += '<tr><td>' + customers[i].id + '</td><td>' + customers[i].ssn + '</td><td>' +
            customers[i].dateOfBirth + '</td><td>' + customers[i].email + '</td><td>' +
            customers[i].fName + '</td><td>' + customers[i].lName + '</td><td>' + customers[i].address +
            '</td><td>' +
            // Add btn soa dmin can preview orders
            '<button class="customer-orders-btn btn btn-outline-success" id="customer' + customers[i].id + '">' +
            customers[i].ordersByCustomer.length + '</td></tr>';
    }

    // Assign table class in alignment with the coorporation styleguide
    const tableTop = '<table class="multiple-col-table" id="customersTable">';

    // Create first table row; also add "btns" for sorting
    const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByLasttName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +

        // Add a column for number of orders by customer
        '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
        '</th></tr></thead>';

    // Create rest of the parts
    const tableHeader = '<h3>List of cars to rent</h3><br>';
    const tableBottom = '</table>';

    // Use the created table parts as args in jquery/ajax .html() method
    $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
}



























////------ FUNCTIONS FOR RETRIEVING CUSTOMERS & CARS FROM BACKEND REST API -------////

// Get all customers from backend and RETURN results
const getCustomersList = async () => {
    const urlPath = "/customers";
    const options = {
        method: "GET",
        headers: {
            // Authorization: 'Bearer ' + keycloak.token,
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        }
    };
    await fetch(apiBaseUrl + urlPath, options)
        .then((response) => response.json()) // Promise
        .then((data) => {
            customers = data; // Store data to return
            console.log(customers);

        }).catch((error) => {
            console.log("Error: response not returned: ", error);
        });

    return customers; // Return returned data
}


// Get all cars from backend and RETURN results
const getCarsList = async () => {
    const urlPath = "/cars";
    const options = {
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + keycloak.token,
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        }
    };
    await fetch(apiBaseUrl + urlPath, options)
        .then((response) => response.json()) // Promise
        .then((data) => {
            cars = data;

        }).catch((error) => {
            console.log("Error: response not returned: ", error);
        });

    return cars;
}






