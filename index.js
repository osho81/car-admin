// API endpoint base url to backend spring boot project car-rental-v2
const apiBaseUrl = "http://localhost:9090/api/v1";

// Method for checking token lifespan and updates token if needed
keycloak.onTokenExpired = () => {
    console.log('token expired', keycloak.token);
    keycloak.updateToken(50).success(() => {
        console.log('successfully get a new token', keycloak.token);
    }).error(() => { "Error: failed token update: ", error });
}

// On document ready section, bind functions to DOM
$(document).ready(function () {
    // Add eventlistener for nav-sections navs (jQuery)
    $("#welcome-nav").on("click", function () { loadHomeContent() });
    $("#admin-info-nav").on("click", function () { loadAdminInfo() });
    $("#logout-btn").on("click", function () { signout() });

    $("#all-cars-nav").on("click", function () { loadAllCars() });
    $("#mini-nav").on("click", function () { loadCarsByType("mini") });
    $("#sedan-nav").on("click", function () { loadCarsByType("sedan") });
    $("#sport-nav").on("click", function () { loadCarsByType("sport") });
    $("#cab-nav").on("click", function () { loadCarsByType("cab") });
    $("#suv-nav").on("click", function () { loadCarsByType("suv") });
    $("#bus-nav").on("click", function () { loadCarsByType("bus") });

    $("#add-car-nav").on("click", function () { addCar() })
    $("#customers-nav").on("click", function () { loadAllCustomers() });

    // Add eventlistener for update car btn
    $(document).on("click", ".update-car-btn", function () {
        var btn = this; // Extract id
        let orderId = btn.id.slice(3); // remove "car" from id
        let orderIdNum = Number(orderId); // Cast to number/int

        updateCar(orderIdNum); // Call update car funcion with extracted id
    });

    // Add eventlistener for delete car btn
    $(document).on("click", ".delete-car-btn", async function () {
        var btn = this; // Extract id
        let carId = btn.id.slice(3); // remove "car" from id
        let carIdNum = Number(carId); // Cast to number/int

        // Get cars list and find out current car by matching its id with carId in order
        const cars = await getCarsList();
        for (var i = 0; i < cars.length; i++) {
            var carToBeDeleted;
            if (cars[i].id == carIdNum) {
                carToBeDeleted = cars[i];
            }
        }


        // FInd a substitute car with same type
        const carsByThisType = await getCarsByType(carToBeDeleted.type.toUpperCase());

        // Exclude car being deleted, to not re-assign it to orders
        const otherCarsByThisType = carsByThisType.filter(car => car.id != carToBeDeleted.id);

        // Delete-warning message
        // Message depends on if there are substitute cars of same type or not
        if (otherCarsByThisType.length > 0) { // If there is substitution car
            $("#main-content").append('<div id="danger-div" class="alert danger"></div>');
            $("#danger-div").html(
                '<strong>WARNING:<br></strong>' +
                ' You are about to delete car ' + carToBeDeleted.regNr + ' with id ' + carIdNum + '.<br>' +
                'If you proceed, any order of this car will be given a substitute car of same type.<br>'
            );

        } else { // If no substitution car 
            $("#main-content").append('<div id="danger-div" class="alert danger"></div>');
            $("#danger-div").html(
                '<strong>WARNING:<br></strong>' +
                ' You are about to delete car ' + carToBeDeleted.regNr + ' with id ' + carIdNum + '.<br>' +
                'There are no substitute cars of same type.<br>If you proceed, any order containing this car will therefore be canceled.<br>'
            );
        }

        // Give warning message time to load, before calling deleteCar() where a confirmation box is displayed
        var millisecondsToWait = 500;
        setTimeout(function () {
            prepareDeleteCar(carIdNum);
        }, millisecondsToWait);


    });

    // Add eventlistener for cancel order btn
    $(document).on("click", ".cancel-order-btn", function () {
        var btn = this; // Extract id
        let orderId = btn.id.slice(5); // remove "car" from id
        let orderIdNum = Number(orderId); // Cast to number/int

        cancelOrder(orderIdNum);
    });

    // Add eventlistener for un-cancel order btn
    $(document).on("click", ".uncancel-order-btn", function () {
        var btn = this; // Extract id
        let orderId = btn.id.slice(5); // remove "car" from id
        let orderIdNum = Number(orderId); // Cast to number/int

        uncancelOrder(orderIdNum);
    });

    // Add eventlistener + function for expanding columns for customers view
    $(document).on("click", ".maximize-customer-btn", function () {
        $("#customersTable").removeClass();
        $("#customersTable").addClass("customers-table-maxi multiple-col-table"); // Replace pertinent classes
        $("#expand-btn-id").removeClass();
        $("#expand-btn-id").addClass("minimize-customer-btn functional-btn"); // Replace pertinent classes
        $("#expand-btn-id").html('<i class="fa-solid fa-minimize"></i>'); // Change btn icon
    });

    // For mimnimizing customers table, do opposite code of maximizing function above
    $(document).on("click", ".minimize-customer-btn", function () {
        $("#customersTable").removeClass();
        $("#customersTable").addClass("customers-table-mini multiple-col-table");
        $("#expand-btn-id").removeClass();
        $("#expand-btn-id").addClass("maximize-customer-btn functional-btn");
        $("#expand-btn-id").html('<i class="fa-solid fa-maximize"></i>');
    });

    ////------------------------- SORTING FUNCTIONS BY NUMBER --------------------------////
    // Sorting custoemr by id, ssn, date of birth; both event and definition are here

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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

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
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">SSN <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Date of Birth <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="SortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Orders <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });


    ////---------------- SORTING FUNCTIONS BY ALPHABETICAL ORDER --------------------////
    // Sorting ccustomer by email, names adress; both event and definition are here

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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

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
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">First Name <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Last Name <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
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
        // const tableTop = '<table class="multiple-col-table" id="customersTable">';
        const currentExpansion = $("#customersTable").hasClass("customers-table-mini") ? "customers-table-mini" :
            "customers-table-maxi";
        const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
            '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

        const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Address <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
            '</th></tr></thead>';
        const tableHeader = '<h3>List of Customers</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    ////------------- SORTING CARS BY ID (number) & REG.NR (alphabet) --------------//// 

    $(document).on("click", ".sortByNumber", async function (event) {
        event.preventDefault();
        const carsToSortByNum = await getCarsList(); // Get cars list
        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortByAsc")) {
            cars = carsToSortByNum.sort(function (b, a) { return a.id - b.id });
            currentSortClass = "sortByNumber sortByDesc";
            upOrDown = "up";
        } else if ($(this).hasClass("sortByDesc")) {
            cars = carsToSortByNum.sort(function (a, b) { return a.id - b.id });
            currentSortClass = "sortByNumber sortByAsc";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < cars.length; i++) {
            tableRows += '<tr><td>' + cars[i].id + '</td><td>' + cars[i].regNr + '</td><td>' + cars[i].model +
                '</td><td>' + cars[i].type + '</td><td>' + cars[i].modelYear + '</td><td>' + cars[i].dailySek +
                '</td><td>' +
                '<button class="positive-btn update-car-btn" id="car' + cars[i].id +
                '">Update</button>' +
                '<button class="negative-btn delete-car-btn" id="car' + cars[i].id +
                '">Delete</button>' + '</td></tr>';
        }

        const tableTop = '<table class="multiple-col-table" id="carsTable">';

        const tableHead = '<thead><tr><th class="' + currentSortClass + '"># <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th class="sortByAlphabet sortFromA">Reg. Nr <i class="fa-solid fa-sort-down"></i></th><th>Model</th><th>Type' +
            '</th><th>Model Year</th><th>SEK/day</th><th>Actions</th></tr></thead>';
        const tableHeader = '<h3>List of Cars</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    $(document).on("click", ".sortByAlphabet", async function (event) {
        event.preventDefault();
        const carsToSortByAlphabet = await getCarsList();

        let currentSortClass;
        let upOrDown;
        if ($(this).hasClass("sortFromA")) {
            cars = carsToSortByAlphabet.sort((b, a) => a.regNr.localeCompare(b.regNr));
            currentSortClass = "sortByAlphabet sortToA";
            upOrDown = "up";
        } else if ($(this).hasClass("sortToA")) {
            cars = carsToSortByAlphabet.sort((a, b) => a.regNr.localeCompare(b.regNr));
            currentSortClass = "sortByAlphabet sortFromA";
            upOrDown = "down";
        }
        let tableRows = '';
        for (var i = 0; i < cars.length; i++) {
            tableRows += '<tr><td>' + cars[i].id + '</td><td>' + cars[i].regNr + '</td><td>' + cars[i].model +
                '</td><td>' + cars[i].type + '</td><td>' + cars[i].modelYear + '</td><td>' + cars[i].dailySek +
                '</td><td>' +
                '<button class="positive-btn update-car-btn" id="car' + cars[i].id +
                '">Update</button>' +
                '<button class="negative-btn delete-car-btn" id="car' + cars[i].id +
                '">Delete</button>' + '</td></tr>';
        }

        const tableTop = '<table class="multiple-col-table" id="carsTable">';

        const tableHead = '<thead><tr><th class="sortByNumber sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
            '</th><th class="' + currentSortClass + '">Reg. Nr <i class="fa-solid fa-sort-' + upOrDown + '"></i>' +
            '</th><th>Model</th><th>Type</th><th>Model Year</th><th>SEK/day</th><th>Actions</th></tr></thead>';
        const tableHeader = '<h3>List of Cars</h3><br>';
        const tableBottom = '</table>';
        $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    ////----------------- SIDE PANEL FOR ORDERS --------------------////

    // Add eventlistener + function for orders preview for admin after click on customer order column
    $(document).on("click", ".customer-orders-btn", async function () {

        var btn = this;
        let customerId = btn.id.slice(8);
        let customerIdNum = Number(customerId);

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
            '<h6>Orders by ' + currentCustomer.fName + ' ' + currentCustomer.lName +
            ' with Ssn ' + currentCustomer.ssn + '</h6>';

        const tableTop = '<table class="multiple-col-table" id="ordersTable">';

        const tableHead = '<thead><tr><th>Order id</th><th>Canceled</th><th>Order Nr</th>' +
            '<th>From</th><th>To</th><th>Car Id</th><th>Price</th></tr></thead>';

        const tableBottom = '</table>' +
            '<div><img src="https://thispersondoesnotexist.com/image" alt="Pic of customer"></div>';


        let tableRows = '';
        for (var i = 0; i < currentCustomer.ordersByCustomer.length; i++) {
            const cancelUncancel = currentCustomer.ordersByCustomer[i].canceled ? "uncancel" : "cancel";

            tableRows += '<tr><td>' + currentCustomer.ordersByCustomer[i].id + '</td><td>' +
                // currentCustomer.ordersByCustomer[i].canceled + '</td><td>' +

                // Add btn so admin can cancel an order
                '<button class="' + cancelUncancel + '-order-btn btn btn-outline-success" id="order' +
                currentCustomer.ordersByCustomer[i].id + '">' +
                // '<button class="cancel-order-btn btn btn-outline-success" id="order' + 
                // currentCustomer.ordersByCustomer[i].id + '">' +
                (currentCustomer.ordersByCustomer[i].canceled ? "Uncancel" : "Cancel") +
                '</button></td><td>' +

                currentCustomer.ordersByCustomer[i].orderNr + '</td><td>' +
                currentCustomer.ordersByCustomer[i].firstRentalDay + '</td><td>' +
                currentCustomer.ordersByCustomer[i].lastRentalDay + '</td><td>' +
                currentCustomer.ordersByCustomer[i].carId + '</td><td>' +
                currentCustomer.ordersByCustomer[i].price + '</td></tr>'
        }

        $("#panel-div").html(panelHeader + tableTop + tableHead + tableRows + tableBottom);
    });

    // Close opened panel, by reloading order details for same order
    $(document).on("click", ".closing-panel-x", async function () {
        // Use load customers function to to reload same view
        loadAllCustomers();
    });


    // Footer email function
    $("#mail").on("click", function () {
        window.open('mailto:ossi.hour@gmail.com');
    });

}); ////------------- End of Document On Ready Part ----------------////


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

function loadAdminInfo() {
    $("#main-content").html(
        // Header
        '<h3>Signed in admin info</h3><be><br>' +
        // Content in table rows 
        '<table class="few-col-table">' +
        '<tr><td>Admin username: </td><td>' + keycloak.tokenParsed.preferred_username + '</td></tr>' +
        '<tr><td>Admin email: </td><td>' + keycloak.tokenParsed.email + '</td></tr>' +
        '<tr><td>First name: </td><td>' +
        (keycloak.tokenParsed.given_name == "" ? "No registered name" :
            keycloak.tokenParsed.given_name) + '</td></tr>' +
        '<tr><td>Last name: </td><td>' +
        (keycloak.tokenParsed.family_name == "" ? "No registered name" :
            keycloak.tokenParsed.family_name) + '</td></tr>' +
        '</td></tr></table>');
}


function signout() {
    // Use this for default VS code jj browser/client 
    keycloak.logout({ "redirectUri": "http://127.0.0.1:5500" });

    // Use this if certain port is set in settings.json (Currently used for custoemr web 221231:)
    // keycloak.logout({ "redirectUri": "http://127.0.0.1:5501" });

    // keycloak.logout({"redirectUri":"http://localhost:8080/"}); // Default keycloak admin console
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
            customers[i].ordersByCustomer.length + '</button></td></tr>';
    }


    // Assign table class in alignment with the coorporation styleguide
    const currentExpansion = $("#customersTable").hasClass("customers-table-maxi") ? "customers-table-" : // Opposite of sorting at start
        "customers-table-mini";
    const tableTop = '<table class="multiple-col-table ' + currentExpansion + '" id="customersTable"><br>' +
        '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';
    // const tableTop = '<table class="multiple-col-table customers-table-mini" id="customersTable"><br>' +
    //     // Expand columns button
    //     '<button class="functional-btn maximize-customer-btn" id="expand-btn-id"><i class="fa-solid fa-maximize"></i></button><br><br>';

    // Create first table row; also add "btns" for sortingmaxi
    const tableHead = '<thead><tr><th class="sortById sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortBySsn sortByAsc">SSN <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByDob sortByAsc">Date of Birth <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByEmail sortFromA">Email <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByFirstName sortFromA">First Name <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByLastName sortFromA">Last Name <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByAddress sortFromA">Address <i class="fa-solid fa-sort-down"></i>' +

        // Add a column for number of orders by customer
        '</th><th class="sortByNumOfOrders sortByAsc">Orders <i class="fa-solid fa-sort-down"></i>' +
        '</th></tr></thead>';

    // Create rest of the partsss
    const tableHeader = '<h3>List of Customers</h3><br>';
    const tableBottom = '</table>';

    // Use the created table parts as args in jquery/ajax .html() method
    $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
}

////--------------- DISPLAY CARS ------------------////

// Get all cars from getCarsList; and DISPLAYS cars
const loadAllCars = async () => {

    const cars = await getCarsList();

    // Creating table cells and populate it with cars fetched from backend
    let tableRows = '';
    for (var i = 0; i < cars.length; i++) { // Add display car pic btn in ROW, not just cell
        tableRows += '<tr><td>' + cars[i].id + '</td><td>' + cars[i].regNr + '</td><td>' + cars[i].model +
            '</td><td>' + cars[i].type + '</td><td>' + cars[i].modelYear + '</td><td>' + cars[i].dailySek +
            '</td><td>' +
            '<button class="positive-btn update-car-btn" id="car' + cars[i].id +
            '">Update</button>' +
            '<button class="negative-btn delete-car-btn" id="car' + cars[i].id +
            '">Delete</button>' + '</td></tr>';
    }

    // Assign table class in alignment with the coorporation styleguide
    const tableTop = '<table class="multiple-col-table" id="carsTable">';

    // Create first table row; also add "btn" for sorting
    const tableHead = '<thead><tr><th class="sortByNumber sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
        '</th><th class="sortByAlphabet sortFromA">Reg. Nr <i class="fa-solid fa-sort-down"></i></th><th>Model</th><th>Type' +
        '</th><th>Model Year</th><th>SEK/day</th><th>Actions</th></tr></thead>';

    // Create rest of the parts
    const tableHeader = '<h3>List of Cars</h3><br>';
    const tableBottom = '</table>';

    // Use the created table parts as args in jquery/ajax .html() method
    $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
}

// Takes in car type arg and returns list of cars for that type
const loadCarsByType = async (type) => {
    const allCars = await getCarsList();
    const cars = [];
    for (var i = 0; i < allCars.length; i++) {
        if (allCars[i].type.toLowerCase() == type) {
            const tempCar = allCars[i];
            cars.push(tempCar);
        }
    }

    let tableRows = '';
    for (var i = 0; i < cars.length; i++) {
        tableRows += '<tr><td>' + cars[i].id + '</td><td>' + cars[i].regNr + '</td><td>' + cars[i].model +
            '</td><td>' + cars[i].type + '</td><td>' + cars[i].modelYear + '</td><td>' + cars[i].dailySek +
            '</td><td>' +
            '<button class="positive-btn update-car-btn" id="car' + cars[i].id +
            '">Update</button>' +
            '<button class="negative-btn delete-car-btn" id="car' + cars[i].id +
            '">Delete</button>' + '</td></tr>';
    }

    const tableTop = '<table class="multiple-col-table" id="carsTable">';
    // const tableHead = '<thead><tr><th class="sortByNumber sortByAsc"># <i class="fa-solid fa-sort-down"></i>' +
    //     '</th><th class="sortByAlphabet sortFromA">Reg. Nr <i class="fa-solid fa-sort-down"></i></th><th>Model</th><th>Type' +
    //     '</th><th>Model Year</th><th>SEK/day</th><th>Actions</th></tr></thead>';

    // Remove sorting fucntions, since this is a filtering; for sorting see list of all cars
    const tableHead = '<thead><tr><th>#</th><th>Reg. Nr</th><th>Model</th><th>Type' +
        '</th><th>Model Year</th><th>SEK/day</th><th>Actions</th></tr></thead>';
    const tableHeader = '<h3>List of Cars</h3><br>';
    const tableBottom = '</table>';

    $("#main-content").html(tableHeader + tableTop + tableHead + tableRows + tableBottom);
}

////--------------------------------- ADD CAR ------------------------------////

// Display form for input, send input with POST fetch to backend rest api to create of a car record
const addCar = async () => {

    // Build form, and take inputs from user, to send in as post fetch body fields
    const formCardContent =
        // Form header
        '<h5 id="car-form-header">Form for adding a car to our fleet</h5><br>' +
        '<form id="car-submit-form">' +
        // Registration nr:
        '<div class="mb-3 car-form-div">' +
        '<label for="regNr" class="form-label">Registration nr</label>' +
        '<input type="text" class="form-control" id="regNrInput" placeholder="Example: aaa999"></div>' +
        // Model/Brand:
        '<div class="mb-3 car-form-div">' +
        '<label for="model" class="form-label">Model/Brand</label>' +
        '<input type="text" class="form-control" id="modelInput" placeholder="Example: Audi"></div>' +
        // Car Type:
        '<div class="mb-3 car-form-div">' +
        '<label for="typeInput" class="form-label">Car type</label><br>' +
        '<select id="typeInput">' +
        '<option selected>SEDAN</option>' +
        '<option>MINI</option>' +
        '<option>SPORT</option>' +
        '<option>CAB</option>' +
        '<option>SUV</option>' +
        '<option>BUS</option></select></div>' +
        // Model Year:
        '<div class="mb-3 car-form-div">' +
        '<label for="modelYear" class="form-label">Model Year</label>' +
        '<input type="number" min="1990" max="2099" step="1" class="form-control" id="modelYearInput"' +
        'placeholder="Example: 2015"></div>' +
        // Car price per day:
        '<div class="mb-3 car-form-div">' +
        '<label for="sekPerDay" class="form-label">SEK/day</label>' +
        '<input type="floatr" class="form-control" id="sekPerDayInput" placeholder="Example: 300 or 200.50"></div>' +

        // Submit button for ordering car
        '<button type="submit" id="submit-add-car" class="positive-btn">Submit</button>' + '</form>';

    // Display the built html form 
    $("#main-content").html(formCardContent);

    $("#car-submit-form").on('submit', async function (event) { // Async since fetch is await
        event.preventDefault();

        // Extract input values
        const regNrInp = $("#regNrInput").val();
        const modelInp = $("#modelInput").val();
        const typeInp = $("#typeInput").val();
        const modelYearInp = $("#modelYearInput").val();
        const pricePerDayInp = $("#sekPerDayInput").val();

        // Prepare post fetch url and options
        const urlPath = "/addcar";
        const options = {
            method: "POST",
            headers: {
                Authorization: 'Bearer ' + keycloak.token,
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },

            // Send user inputs extracted from the add car form
            body: JSON.stringify({
                regNr: regNrInp,
                model: modelInp,
                type: typeInp,
                modelYear: modelYearInp,
                dailySek: pricePerDayInp,
            }),
        };

        // Send post request to backend rest api
        await fetch(apiBaseUrl + urlPath, options)
            .then((response) => {
                response.json();
                if (!response.ok) {
                    alert("You have no rights for this action");
                }
            }).then((data) => {
                var cars = data;

            }).catch((error) => {
                console.log("Error: response not returned: ", error);
            });

        loadAllCars(); // Reload page view

    });
}

////--------------------------------- UPDATE CAR ------------------------------////

const updateCar = async (carIdNum) => {

    // Get cars list and find out current car by matching its id with carId in order
    const cars = await getCarsList();
    for (var i = 0; i < cars.length; i++) {
        var currentCar;
        if (cars[i].id == carIdNum) {
            currentCar = cars[i];
        }
    }

    // Reuse form from car update - but disable unchangeable fields
    const formCardContent =
        // Insert info on car about to be updated
        '<h5 id="update-form-header">Update ' + currentCar.model.toUpperCase() +
        ' with id ' + currentCar.id + '</h5><br>' +
        '<form id="update-submit-form">' +
        // Registration nr - prefilled
        '<div class="mb-3 car-form-div">' +
        '<label for="regNr" class="form-label">Registration nr</label>' +
        '<input type="text" class="form-control" id="regNrInput" value="' + currentCar.regNr + '" disabled></div>' +
        // Model/Brand:
        '<div class="mb-3 car-form-div">' +
        '<label for="model" class="form-label">Model/Brand</label>' +
        '<input type="text" class="form-control" id="modelInput" value="' + currentCar.model + '"></div>' +
        // Car Type:
        '<div class="mb-3 car-form-div">' +
        '<label for="typeInput" class="form-label">Car type</label><br>' +
        '<select id="typeInput">' +
        '<option selected>' + currentCar.type + '</option>' +
        '<option>SEDAN</option>' +
        '<option>MINI</option>' +
        '<option>SPORT</option>' +
        '<option>CAB</option>' +
        '<option>SUV</option>' +
        '<option>BUS</option></select></div>' +
        // Model Year:
        '<div class="mb-3 car-form-div">' +
        '<label for="modelYear" class="form-label">Model Year</label>' +
        '<input type="number" min="1990" max="2099" step="1" class="form-control" id="modelYearInput"' +
        'value="' + currentCar.modelYear + '"></div>' +
        // Car price per day:
        '<div class="mb-3 car-form-div">' +
        '<label for="sekPerDay" class="form-label">SEK/day</label>' +
        '<input type="floatr" class="form-control" id="sekPerDayInput" value="' + currentCar.dailySek + '"></div>' +

        // Submit button for ordering car
        '<button type="submit" id="submit-car-order" class="positive-btn">Submit</button>' + '</form>';

    $("#main-content").html(formCardContent);

    $("#update-submit-form").on('submit', async function (event) {
        event.preventDefault();

        // const regNrInp = $("#regNrInput").val();
        const modelInp = $("#modelInput").val();
        const typeInp = $("#typeInput").val();
        const modelYearInp = $("#modelYearInput").val();
        const pricePerDayInp = $("#sekPerDayInput").val();

        // Prepare post fetch url and options
        const urlPath = "/updatecar";
        const options = {
            method: "PUT",
            headers: {
                Authorization: 'Bearer ' + keycloak.token,
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },
            body: JSON.stringify({
                regNr: currentCar.regNr,
                model: modelInp,
                type: typeInp,
                modelYear: modelYearInp,
                dailySek: pricePerDayInp,
            }),
        };
        await fetch(apiBaseUrl + urlPath, options)
            .then((response) => response.json())
            .then((data) => {
                var cars = data;

            }).catch((error) => {
                console.log("Error: response not returned: ", error);
            });

        loadAllCars(); // Reload page view
    });
}

////--------------------------------- DELETE CAR ------------------------------////

// Function for handle substitutuin cars if car to be deleted is in other orders
const prepareDeleteCar = async (carIdNum) => {

    // Get cars list and find out current car by matching its id with carId in order
    const cars = await getCarsList();
    for (var i = 0; i < cars.length; i++) {
        var carToBeDeleted;
        if (cars[i].id == carIdNum) {
            carToBeDeleted = cars[i];
        }
    }

    // FInd a substitute car with same type
    const carsByThisType = await getCarsByType(carToBeDeleted.type.toUpperCase());

    // Exclude car being deleted, to not re-assign it to orders
    const otherCarsByThisType = carsByThisType.filter(car => car.id != carToBeDeleted.id);

    const orders = await getOrdersList(); // Get orders to loop through

    const urlPath = "/updateorder";

    if (otherCarsByThisType.length > 0) { // If at least 1 substitute car is found

        // Loop through orders and assign/update with substitute car id
        for (var i = 0; i < orders.length; i++) {

            // Create comparison dates to check if order is curent
            let currentOrderEnd = new Date(orders[i].lastRentalDay);
            let today = new Date();
            today.setDate(today.getDate() - 1);

            // If match, replace car in CURRENT with the found substitute car
            // (If canceled or passed, just set car to zero)
            if (orders[i].carId == carToBeDeleted.id && orders[i].canceled == false &&
                currentOrderEnd > today) {
                // Assign first found substitute in sub-method
                const options = {
                    method: "PUT",
                    headers: {
                        Authorization: 'Bearer ' + keycloak.token,
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    body: JSON.stringify({
                        id: orders[i].id,
                        orderNr: orders[i].orderNr,
                        carId: otherCarsByThisType[0].id,
                    }),
                };
                await fetch(apiBaseUrl + urlPath, options)
                    .then((response) => response.json())
                    .catch((error) => {
                        console.log("Error: response not returned: ", error);
                    });
            }
        }
        deleteCar(carIdNum);

    } else { // If NO substitute car of same type is found, cancel any order with deleted car
        for (var i = 0; i < orders.length; i++) {

            if (orders[i].carId == carToBeDeleted.id) {
                // If substitute not found; cancel orders and fix it in other manner
                const options = {
                    method: "PUT",
                    headers: {
                        Authorization: 'Bearer ' + keycloak.token,
                        Accept: "application/json",
                        "Content-Type": "application/json;charset=UTF-8",
                    },
                    body: JSON.stringify({
                        id: orders[i].id,
                        orderNr: orders[i].orderNr,
                        canceled: true, // CAncel, since carId will be zero
                    }),
                };
                await fetch(apiBaseUrl + urlPath, options)
                    .then((response) => response.json())
                    .catch((error) => {
                        console.log("Error: response not returned: ", error);
                    });
            }
        }
        deleteCar(carIdNum);
    }

}

// Delete car after handled current orders with car etc, in prepareDeleteCar()
const deleteCar = async (carIdNum) => {
    var conf = confirm("WARNING: Confirm deletion of car with id " + carIdNum + "?");

    if (conf == false) {
        loadAllCars(); // If cancels: abort by reloading car list view

    } else { // If accept
        const urlPath = "/deletecar";
        const options = {
            method: "DELETE",
            headers: {
                Authorization: 'Bearer ' + keycloak.token,
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
            },

            // Car id is enough to identify car to delete
            body: JSON.stringify({
                id: carIdNum,
            }),
        };
        await fetch(apiBaseUrl + urlPath, options)
            .then((response) => {
                response.json(); // Promise
                if (!response.ok) {
                    alert("You have no rights for this action");
                }
            }).then((data) => {
                cars = data;

            }).catch((error) => {
                console.log("Error: response not returned: ", error);
            });
        loadAllCars(); // Reload page view
    }
}

// PUT FETCH for canceling order
const cancelOrder = async (orderIdNum) => {
    // Retrieve pertinent order, get customer id, and find current customer
    const orders = await getOrdersList();
    var currentCustomerId;
    var currentOrder1;
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == orderIdNum) {
            currentOrder1 = orders[i];
            currentCustomerId = orders[i].customerId;
        }
    }

    const urlPath = "/cancelorder";
    const options = {
        method: "PUT",
        headers: {
            Authorization: 'Bearer ' + keycloak.token,
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            id: orderIdNum,
            orderNr: currentOrder1.orderNr,
            price: currentOrder1.price,
        }),
    };
    await fetch(apiBaseUrl + urlPath, options)
        .then((response) => response.json())
        .then((data) => { // Deleted/Canceled - no need to use returned data
        }).catch((error) => {
            console.log("Error: response not returned: ", error);
        });

    const customers = await getCustomersList();
    var currentCustomer;
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].id == currentCustomerId) {
            currentCustomer = customers[i];
        }
    }

    const panelHeader =
        '<span class="closing-panel-x"><i class="fa-solid fa-xmark"></i></span>' +
        '<h6>Orders by ' + currentCustomer.fName + ' ' + currentCustomer.lName +
        ' with Ssn ' + currentCustomer.ssn + '</h6>';

    const tableTop = '<table class="multiple-col-table" id="ordersTable">';

    const tableHead = '<thead><tr><th>Order id</th><th>Canceled</th><th>Order Nr</th>' +
        '<th>From</th><th>To</th><th>Car Id</th><th>Price</th></tr></thead>';

    const tableBottom = '</table>' +
        '<div><img src="https://thispersondoesnotexist.com/image" alt="Pic of customer"></div>';

    let tableRows = '';
    for (var i = 0; i < currentCustomer.ordersByCustomer.length; i++) {
        const cancelUncancel = currentCustomer.ordersByCustomer[i].canceled ? "uncancel" : "cancel";

        tableRows += '<tr><td>' + currentCustomer.ordersByCustomer[i].id + '</td><td>' +
            // Change class to enable for next cancel/uncancel option

            '<button class="' + cancelUncancel + '-order-btn btn btn-outline-success" id="order' +
            currentCustomer.ordersByCustomer[i].id + '">' +
            cancelUncancel +
            // (currentCustomer.ordersByCustomer[i].canceled ? "Uncancel" : "Cancel") +
            '</button></td><td>' +
            currentCustomer.ordersByCustomer[i].orderNr + '</td><td>' +
            currentCustomer.ordersByCustomer[i].firstRentalDay + '</td><td>' +
            currentCustomer.ordersByCustomer[i].lastRentalDay + '</td><td>' +
            currentCustomer.ordersByCustomer[i].carId + '</td><td>' +
            currentCustomer.ordersByCustomer[i].price + '</td></tr>';
    }

    $("#panel-div").html(panelHeader + tableTop + tableHead + tableRows + tableBottom);
}

// PUT FETCH for UN-canceling order
const uncancelOrder = async (orderIdNum) => {
    // Retrieve pertinent order, get customer id, and find current customer
    const orders = await getOrdersList();
    var currentCustomerId;
    var currentOrder1;
    for (var i = 0; i < orders.length; i++) {
        if (orders[i].id == orderIdNum) {
            currentOrder1 = orders[i];
            currentCustomerId = orders[i].customerId;
        }
    }

    const urlPath = "/updateorder";
    const options = {
        method: "PUT",
        headers: {
            Authorization: 'Bearer ' + keycloak.token,
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({
            id: orderIdNum,
            orderNr: currentOrder1.orderNr,
            canceled: false,

            // Backend also endpoint api requires the start/end dates to calculate price:
            firstRentalDay: currentOrder1.firstRentalDay,
            lastRentalDay: currentOrder1.lastRentalDay,
        }),
    };
    await fetch(apiBaseUrl + urlPath, options)
        .then((response) => {
            response.json()
        }
        ).then((data) => {

        }).catch((error) => {
            console.log("Error: response not returned: ", error);
        });


    const customers = await getCustomersList();
    var currentCustomer;
    for (var i = 0; i < customers.length; i++) {
        if (customers[i].id == currentCustomerId) {
            currentCustomer = customers[i];
        }
    }

    const panelHeader =
        '<span class="closing-panel-x"><i class="fa-solid fa-xmark"></i></span>' +
        '<h6>Orders by ' + currentCustomer.fName + ' ' + currentCustomer.lName +
        ' with Ssn ' + currentCustomer.ssn + '</h6>';

    const tableTop = '<table class="multiple-col-table" id="ordersTable">';

    const tableHead = '<thead><tr><th>Order id</th><th>Canceled</th><th>Order Nr</th>' +
        '<th>From</th><th>To</th><th>Car Id</th><th>Price</th></tr></thead>';

    const tableBottom = '</table>' +
        '<div><img src="https://thispersondoesnotexist.com/image" alt="Pic of customer"></div>';

    let tableRows = '';
    for (var i = 0; i < currentCustomer.ordersByCustomer.length; i++) {
        const cancelUncancel = currentCustomer.ordersByCustomer[i].canceled ? "uncancel" : "cancel";

        tableRows += '<tr><td>' + currentCustomer.ordersByCustomer[i].id + '</td><td>' +
            // Change class to enable for next cancel/uncancel option

            '<button class="' + cancelUncancel + '-order-btn btn btn-outline-success" id="order' +
            currentCustomer.ordersByCustomer[i].id + '">' +
            cancelUncancel +
            // (currentCustomer.ordersByCustomer[i].canceled ? "Uncancel" : "Cancel") +
            '</button></td><td>' +
            currentCustomer.ordersByCustomer[i].orderNr + '</td><td>' +
            currentCustomer.ordersByCustomer[i].firstRentalDay + '</td><td>' +
            currentCustomer.ordersByCustomer[i].lastRentalDay + '</td><td>' +
            currentCustomer.ordersByCustomer[i].carId + '</td><td>' +
            currentCustomer.ordersByCustomer[i].price + '</td></tr>';
    }

    $("#panel-div").html(panelHeader + tableTop + tableHead + tableRows + tableBottom);
}

////------ FUNCTIONS FOR RETRIEVING CUSTOMERS & CARS FROM BACKEND REST API -------////

// Get all customers from backend and RETURN results
const getCustomersList = async () => {
    const urlPath = "/customers";
    const options = {
        method: "GET",
        headers: {
            Authorization: 'Bearer ' + keycloak.token,
            Accept: "application/json",
            "Content-Type": "application/json;charset=UTF-8",
        }
    };
    await fetch(apiBaseUrl + urlPath, options)
        .then((response) => response.json())
        .then((data) => {
            customers = data; // Store data to return

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

// Takes in car type arg and returns list of cars for that type
const getCarsByType = async (type) => {
    const allCars = await getCarsList();
    const cars = [];
    for (var i = 0; i < allCars.length; i++) {
        if (allCars[i].type.toUpperCase() == type) {
            const tempCar = allCars[i];
            cars.push(tempCar);
        }
    }
    return cars;
}

// Get all orders from backend and RETURN result; assit other functions only
const getOrdersList = async () => {
    const urlPath = "/orders";
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
            orders = data;

        }).catch((error) => {
            console.log("Error: response not returned: ", error);
        });

    return orders;
}
