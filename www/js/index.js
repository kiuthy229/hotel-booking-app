var ERROR = 'ERROR';

// Create or Open Database.
var db = window.openDatabase('FGW', '1.0', 'FGW', 20000);

// To detect whether users use mobile phones horizontally or vertically.
$(window).on('orientationchange', onOrientationChange);

// Display messages in the console.
function log(message, type = 'INFO') {
    console.log(`${new Date()} [${type}] ${message}`);
}

function onOrientationChange(e) {
    if (e.orientation == 'portrait') {
        log('Portrait.');
    }
    else {
        log('Landscape.');
    }
}

var slideIndex = 0;
showSlides();

function showSlides() {
  var i;
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("dot");
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  slideIndex++;
  if (slideIndex > slides.length) {slideIndex = 1}    
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  dots[slideIndex-1].className += " active";
  setTimeout(showSlides, 2000); // Change image every 2 seconds
}

// To detect whether users open applications on mobile phones or browsers.
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
    $(document).on('deviceready', onDeviceReady);
}
else {
    $(document).on('ready', onDeviceReady);
}

// Display errors when executing SQL queries.
function transactionError(tx, error) {
    log(`SQL Error ${error.code}. Message: ${error.message}.`, ERROR);
}

// Run this function after starting the application.
function onDeviceReady() {
    log(`Device is ready.`);

    db.transaction(function (tx) {
        // Create table ACCOUNT.
        var query = `CREATE TABLE IF NOT EXISTS Account (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                        Username TEXT NOT NULL UNIQUE,
                                                        Password TEXT NOT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
        log(`Create table 'Account' successfully.`);
        }, transactionError);

        // Create table ACCOMMODATION.
        var query = `CREATE TABLE IF NOT EXISTS Accommodation (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Propertyname TEXT NOT NULL UNIQUE,
                                                         Propertytype TEXT NOT NULL,
                                                         City TEXT NOT NULL,
                                                         District TEXT NOT NULL,
                                                         Ward TEXT NOT NULL,
                                                         Bedroom INTEGER NOT NULL,
                                                         Date TEXT NOT NULL,
                                                         Price INTERER NOT NULL,
                                                         Furnituretype TEXT NOT NULL,
                                                         Notes TEXT NOT NULL,
                                                         Reporter TEXT NOT NULL)`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Accommodation' successfully.`);
        }, transactionError);

        // Create table COMMENT.
        var query = `CREATE TABLE IF NOT EXISTS Comment (Id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                         Comment TEXT NOT NULL,
                                                         Datetime DATE NOT NULL,
                                                         AccountId INTEGER NOT NULL,
                                                         FOREIGN KEY (AccountId) REFERENCES Account(Id))`;
        tx.executeSql(query, [], function (tx, result) {
            log(`Create table 'Comment' successfully.`);
        }, transactionError);
    });

    prepareDatabase(db);
}

// Submit a form to register a new account.
$(document).on('submit', '#page-create #frm-register', confirmAccommodation);
$(document).on('vclick', '#page-create #frm-confirm #btn-create', registerAccommodation);

function confirmAccommodation(e) {
    e.preventDefault();

    var propertytypeText=document.getElementById("propertytype");
    var cityText = document.getElementById("city");
    var districtText = document.getElementById("district");
    var wardText = document.getElementById("ward");
    var bedroomText = document.getElementById("bedroom");
    var furnitureText = document.getElementById("furnituretype");

    // Get user's input.
    var propertyname = $('#page-create #frm-register #propertyname').val();
    var propertytype = propertytypeText.options[propertytypeText.selectedIndex].text;
    var city = cityText.options[cityText.selectedIndex].text;
    var district = districtText.options[districtText.selectedIndex].text;
    var ward = wardText.options[wardText.selectedIndex].text;
    var bedroom = bedroomText.options[bedroomText.selectedIndex].text;
    var date = $('#page-create #frm-register #date').val();
    var price = $('#page-create #frm-register #price').val();
    var furnituretype = furnitureText.options[furnitureText.selectedIndex].text;
    var notes = $('#page-create #frm-register #notes').val();
    var reporter = $('#page-create #frm-register #reporter').val();

    checkAccommodation(propertyname, propertytype, city, district, ward, bedroom,date, price, furnituretype, notes, reporter);
}

function checkAccommodation(propertyname, propertytype, city, district, ward, bedroom,date, price, furnituretype, notes, reporter) {
    db.transaction(function (tx) {
        var query = 'SELECT * FROM Accommodation WHERE Propertyname = ?';
        tx.executeSql(query, [propertyname], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            if (result.rows[0] == null) {
                log('Open the confirmation popup.');

                $('#page-create #error').empty();
                
                $('#page-create #frm-confirm #propertyname').val(propertyname);
                $('#page-create #frm-confirm #propertytype').val(propertytype);
                $('#page-create #frm-confirm #city').val(city);
                $('#page-create #frm-confirm #district').val(district);
                $('#page-create #frm-confirm #ward').val(ward);
                $('#page-create #frm-confirm #bedroom').val(bedroom);
                $('#page-create #frm-confirm #date').val(date);
                $('#page-create #frm-confirm #price').val(price);
                $('#page-create #frm-confirm #furnituretype').val(furnituretype);
                $('#page-create #frm-confirm #notes').val(notes);
                $('#page-create #frm-confirm #reporter').val(reporter);

                $('#page-create #frm-confirm').popup('open');
            }
            else {
                var error = 'Accommodation exists.';
                $('#page-create #error').empty().append(error);
                log(error, ERROR);
            }
        }
    });
}

function registerAccommodation(e) {
    e.preventDefault();

    var propertyname = $('#page-create #frm-confirm #propertyname').val();
    var propertytype = $('#page-create #frm-confirm #propertytype').val();
    var city = $('#page-create #frm-confirm #city').val();
    var district = $('#page-create #frm-confirm #district').val();
    var ward = $('#page-create #frm-confirm #ward').val();
    var bedroom = $('#page-create #frm-confirm #bedroom').val();
    var date = $('#page-create #frm-confirm #date').val();
    var price = $('#page-create #frm-confirm #price').val();
    var furnituretype = $('#page-create #frm-confirm #furnituretype').val();
    var notes = $('#page-create #frm-confirm #notes').val();
    var reporter = $('#page-create #frm-confirm #reporter').val();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Accommodation (Propertyname, Propertytype, City, District, Ward, Bedroom, Date, Price, Furnituretype, Notes, Reporter) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        tx.executeSql(query, [propertyname, propertytype, city, district, ward, bedroom,date, price, furnituretype, notes, reporter], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Create a property name '${propertyname}' successfully.`);

            // Reset the form.
            $('#frm-register').trigger('reset');
            $('#page-create #error').empty();
            $('#propertyname').focus();

            $('#page-create #frm-confirm').popup('close');
        }
    });
}



// Display Account List.
$(document).on('pagebeforeshow', '#page-list', showList);

function showList() {
    db.transaction(function (tx) {
        var query = 'SELECT Id, Propertyname FROM Accommodation';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accounts successfully.`);

            // Prepare the list of accounts.
            var listAccommodation = `<ul id='list-accommodation' data-role='listview' data-filter='true' data-filter-placeholder='Search accounts...'
                                                     data-corners='false' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let accommodation of result.rows) {
                listAccommodation += `<li><a data-details='{"Id" : ${accommodation.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Username: ${accommodation.Propertyname}</h3>
                                    <p>ID: ${accommodation.Id}</p>
                                </a></li>`;
            }
            listAccommodation += `</ul>`;

            // Add list to UI.
            $('#list-accommodation').empty().append(listAccommodation).listview('refresh').trigger('create');

            log(`Show list of accounts successfully.`);
        }
    });
}

// Save Account Id.
$(document).on('vclick', '#list-accommodation li a', function (e) {
    e.preventDefault();

    var id = $(this).data('details').Id;
    localStorage.setItem('currentAccountId', id);

    $.mobile.navigate('#page-detail', { transition:'' });
});

// Show Account Details.
$(document).on('pagebeforeshow', '#page-detail', showDetail);

function showDetail() {
    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Accommodation WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Acc not found.';
            var propertyname = errorMessage;
            var propertytype = errorMessage;
            var city = errorMessage;
            var district = errorMessage;
            var ward = errorMessage;
            var bedroom = errorMessage;
            var date = errorMessage;
            var price = errorMessage;
            var furnituretype = errorMessage;
            var notes = errorMessage;
            var reporter =errorMessage;
            // var password = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of account '${id}' successfully.`);
                
                propertyname = result.rows[0].Propertyname;
                propertytype = result.rows[0].Propertytype;
                city = result.rows[0].City;
                district = result.rows[0].District;
                ward = result.rows[0].Ward;
                bedroom = result.rows[0].Bedroom;
                date = result.rows[0].Date;
                price = result.rows[0].Price;
                furnituretype = result.rows[0].Furnituretype;
                notes = result.rows[0].Notes;
                reporter =result.rows[0].Reporter;
                // password = result.rows[0].Password;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }

            $('#page-detail #id').val(id);
            
            $('#page-detail #propertyname').val(propertyname);
            $('#page-detail #propertytype').val(propertytype);
            $('#page-detail #city').val(city);
            $('#page-detail #district').val(district);
            $('#page-detail #ward').val(ward);
            $('#page-detail #bedroom').val(bedroom);
            $('#page-detail #date').val(date);
            $('#page-detail #price').val(price);
            $('#page-detail #furnituretype').val(furnituretype);
            $('#page-detail #notes').val(notes);
            $('#page-detail #reporter').val(reporter);

            // $('#page-detail #password').val(password);
            
            showComment();
            
        }
    });
}



// Delete Account.
$(document).on('submit', '#page-detail #frm-delete', deleteAccommodation);
$(document).on('keyup', '#page-detail #frm-delete #txt-delete', confirmDeleteAccommodation);

function confirmDeleteAccommodation() {
    var text = $('#page-detail #frm-delete #txt-delete').val();

    if (text == 'confirm delete') {
        $('#page-detail #frm-delete #btn-delete').removeClass('ui-disabled');
    }
    else {
        $('#page-detail #frm-delete #btn-delete').addClass('ui-disabled');
    }
}

function deleteAccommodation(e) {
    e.preventDefault();

    var id = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'DELETE FROM Accommodation WHERE Id = ?';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Delete account '${id}' successfully.`);

            $('#page-detail #frm-delete').trigger('reset');

            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

//Update
$(document).on('vclick', '#page-detail #frm-update #btn-update', updateAccommodation);

function updateAccommodation(e){
    e.preventDefault();

    // var propertytypeText=$('#page-detail #propertytype').val();
    // var cityText = $('#page-detail #frm-update #city').val();
    // var districtText = document.getElementById("district");
    // var wardText = document.getElementById("ward");
    // var bedroomText = document.getElementById("bedroom");
    // var furnitureText = document.getElementById("furnituretype");

    var id = localStorage.getItem('currentAccountId');
    var propertyname = $('#page-detail #frm-update #propertyname').val();
    var propertytype = $('#page-detail #frm-update #propertytype').val();
    var city = $('#page-detail #frm-update #city').val();
    var district = $('#page-detail #frm-update #district').val();
    var ward = $('#page-detail #frm-update #ward').val();
    var bedroom = $('#page-detail #frm-update #bedroom').val();
    var date = $('#page-detail #frm-update #date').val();
    var price = $('#page-detail #frm-update #price').val();
    var furnituretype = $('#page-detail #frm-update #furnituretype').val();
    var notes = $('#page-detail #frm-update #notes').val();
    var reporter = $('#page-detail #frm-update #reporter').val();

    //document.getElementById("furnituretype").value = $('#page-detail #furnituretype').val(furnituretype);
    db.transaction(function (tx) {
        var query = 'UPDATE Accommodation SET Propertyname = ?, Propertytype=?, City=?, District=?, Ward=?, Bedroom=?, Date=?, Price=?, Furnituretype=?, Notes=?, Reporter=? WHERE Id = ?';
        
        tx.executeSql(query, [propertyname, propertytype, city, district, ward, bedroom, date, price, furnituretype, notes, reporter, id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Update accommodation '${id}' successfully.`);
            $('#page-detail #frm-update').trigger('reset');
            $.mobile.navigate('#page-list', { transition: 'none' });
        }
    });
}

$(document).on('change', '#page-detail #frm-update #propertytype', function(){
    updatePropertyType('#page-detail #frm-update');
});

function updatePropertyType(form, selectedId=-1){
    var id = localStorage.getItem('currentAccountId');
    db.transaction(function (tx) {
        var propertytype = 'SELECT Propertytype FROM Accommodation WHERE Id = ?';
        tx.executeSql(propertytype, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Acc not found.';
            var propertytype = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of accommodation '${id}' successfully.`);
                propertytype = result.rows[0].Propertytype;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }  
            var optionList=`<option value='-1'>${prop}</option>`;
            
            optionList+= `<option value='${item.Id}' ${item.Name==prop ? 'selected':''} >${item.Name}</option>`;
            
           
            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
        var prop=$('#page-detail #propertytype').val();
        console.log('property type la'+prop);

    });
}

//Search
$(document).on('submit', '#page-search #frm-search', search);
function search(e){
    e.preventDefault();

    var propertyname = $('#page-search #frm-search #propertyname').val();
    var price = $('#page-search #frm-search #price').val();

    db.transaction(function (tx) {
        var query = `SELECT Id, Propertyname, Price FROM Accommodation WHERE`;
        
        if (propertyname){
            query+=` Propertyname LIKE "%${propertyname}%"   AND`;
        }

        if(price){
            query += ` Price >= ${price}   AND`;
        }
        
        query= query.substring(0, query.length -6);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of accommodation successfully.`);

            // Prepare the list of accounts.
            var listAccommodation = `<ul id='list-accomm' data-role='listview' class='ui-nodisc-icon ui-alt-icon'>`;
            for (let accommodation of result.rows) {
                listAccommodation += `<li><a data-details='{"Id" : ${accommodation.Id}}'>
                                    <img src='img/boyscout_logo.jpg'>
                                    <h3>Property Name: ${accommodation.Propertyname}</h3>
                                    <p>Price: ${accommodation.Price}</p>
                                </a></li>`;
            }
            listAccommodation += `</ul>`;

            // Add list to UI.
            $('#page-search #list-accomm').empty().append(listAccommodation).listview('refresh').trigger('create');
        }
    });
}

// Add Comment.
$(document).on('submit', '#page-detail #frm-comment', addComment);

function addComment(e) {
    e.preventDefault();

    var accountId = localStorage.getItem('currentAccountId');
    var comment = $('#page-detail #frm-comment #txt-comment').val();
    var dateTime = new Date();

    db.transaction(function (tx) {
        var query = 'INSERT INTO Comment (AccountId, Comment, Datetime) VALUES (?, ?, ?)';
        tx.executeSql(query, [accountId, comment, dateTime], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Add new comment to account '${accountId}' successfully.`);

            $('#page-detail #frm-comment').trigger('reset');

            showComment();
        }
    });
}

// Show Comment.
function showComment() {
    var accountId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Comment WHERE AccountId = ?';
        tx.executeSql(query, [accountId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            log(`Get list of comments successfully.`);

            // Prepare the list of comments.
            var listComment = '';
            for (let comment of result.rows) {
                listComment += `<div class = 'list'>
                                    <small>${comment.Datetime}</small>
                                    <h3>${comment.Comment}</h3>
                                </div>`;
            }
            
            // Add list to UI.
            $('#list-comment').empty().append(listComment);

            log(`Show list of comments successfully.`);
        }
    });
}

//Select address
$(document).on('pagebeforeshow', '#page-create', function(){
    importCity('#page-create #frm-register');
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #city', function(){
    importDistrict('#page-create #frm-register');
    importWard('#page-create #frm-register');
});

$(document).on('change', '#page-create #frm-register #district', function(){
    importWard('#page-create #frm-register');
});

function importCity(form, selectedId=-1){
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>Select City</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Id==selectedId ? 'selected':''}>${item.Name}</option>`;
            }

            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}

function importDistrict(form, selectedId=-1){
    var name = $(`${form} #city option:selected`).text();
    var id = $(`${form} #city`).val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>Select District</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Id==selectedId ? 'selected':''}>${item.Name}</option>`;
            }

            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWard(form, selectedId=-1){
    var id = $(`${form} #district`).val();

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>Select Ward</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Id==selectedId ? 'selected':''}>${item.Name}</option>`;
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}

// var cityId = document.getElementById("city");
// var districtId = document.getElementById("district");
// var wardId = document.getElementById("ward");

// function show(){
//     var strCity = cityId.selectedIndex;
//     var strDistrict = districtId.selectedIndex;
//     var strWard = wardId.selectedIndex;
//     console.log( strCity);
// //   console.log( strDistrict);
// //   console.log( strWard);

// }
// cityId.onchange=show;
// districtId.onchange=show;
// wardId.onchange=show;
// show();




// import address update
$(document).on('pagebeforeshow', '#page-detail', function(){
    importCityupdate('#page-detail #frm-update');
    importDistrictupdate('#page-detail #frm-update');
    importWardupdate('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #city', function(){
    importDistrictupdate('#page-detail #frm-update');
    importWardupdate('#page-detail #frm-update');
});

$(document).on('change', '#page-detail #frm-update #district', function(){
    importWardupdate('#page-detail #frm-update');
});



function importCityupdate(form){
    var id = localStorage.getItem('currentAccountId');
    db.transaction(function (tx) {
        var query = 'SELECT * FROM City ORDER BY Name';
        var city = 'SELECT City FROM Accommodation WHERE Id = ?';
        //var citySelected = $
        tx.executeSql(city, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Acc not found.';
            var city = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of accommodation '${id}' successfully.`);
                city = result.rows[0].City;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }  
        }
        var val=$('#page-detail #city').val();
        console.log('value la'+val);

        tx.executeSql(query, [], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>Select City</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Name==val ? 'selected':''} >${item.Name}</option>`;
            }
           
            $(`${form} #city`).html(optionList);
            $(`${form} #city`).selectmenu('refresh', true);
        }
    });
}
//em vua xoa selectedId cho nay selectedId=-1 co van de j voi cai nay 0
// neu maf update thi
//Thi saoa
function importDistrictupdate(form){
    var name = $(`${form} #city option:selected`).text();
    var id = $(`${form} #city`).val();
    var AcommodationId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM District WHERE CityId = ? ORDER BY Name';

        var district = 'SELECT District FROM Accommodation WHERE Id = ?';

        tx.executeSql(district, [AcommodationId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Acc not found.';
            var district = errorMessage;
            console.log('nay thi sao'+district);
            if (result.rows[0] != null) {
                log(`Get details of accommodation '${id}' successfully.`);
                district = result.rows[0].District;
                console.log('nay thi sao'+district);
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
                console.log('nay thi sao'+district);
            }  
        }
        var districtSelected = $('#page-detail #district').val();
        console.log('value la'+districtSelected);

        tx.executeSql(query, [id], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>${districtSelected}</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Name==districtSelected ? 'selected':''}>${item.Name}</option>`;

            }
          
            $(`${form} #district`).html(optionList);
            $(`${form} #district`).selectmenu('refresh', true);
        }
    });
}

function importWardupdate(form, selectedId=-1){
    var id = $(`${form} #district`).val();
    var AcommodationId = localStorage.getItem('currentAccountId');

    db.transaction(function (tx) {
        var query = 'SELECT * FROM Ward WHERE DistrictId = ? ORDER BY Name';
        var ward = 'SELECT Ward FROM Accommodation WHERE Id = ?';
        //var citySelected = $
        tx.executeSql(ward, [AcommodationId], transactionSuccess, transactionError);

        function transactionSuccess(tx, result) {
            var errorMessage = 'Acc not found.';
            var ward = errorMessage;

            if (result.rows[0] != null) {
                log(`Get details of accommodation '${id}' successfully.`);
                ward = result.rows[0].Ward;
            }
            else {
                log(errorMessage, ERROR);

                $('#page-detail #btn-update').addClass('ui-disabled');
                $('#page-detail #btn-delete-confirm').addClass('ui-disabled');
            }  
        }
        var wardSelected=$('#page-detail #ward').val();
        console.log('value la'+wardSelected);

        tx.executeSql(query, [id], transactionSuccess, transactionError);
        
        function transactionSuccess(tx, result) {
            var optionList=`<option value='-1'>${wardSelected}</option>`;
            
            for (let item of result.rows){
                    optionList+= `<option value='${item.Id}' ${item.Name==wardSelected ? 'selected':''}>${item.Name}</option>`;
                    console.log(item)
            }

            $(`${form} #ward`).html(optionList);
            $(`${form} #ward`).selectmenu('refresh', true);
        }
    });
}