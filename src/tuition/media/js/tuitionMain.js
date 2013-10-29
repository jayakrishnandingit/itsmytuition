/**
All the custom javascript functions utilising jQuery library should reside here. 
TODO : In future we need to implement this using MVC architecture for js.
*/

function serialize(formObj) {
	// write a custom form serializer due to unique behaviour of jQuery form serialize methods.
	// why do we need to write a custom serializer.
	// see here http://api.jquery.com/serializeArray/
	return false
}

function getFormattedDate(jsDateObj) {
	var day = jsDateObj.getDate();
	var month = jsDateObj.getMonth() + 1;
	var year = jsDateObj.getFullYear();
	return (day < 10 ? '0' + day : day) + '/' + (month < 10 ? '0' + month : month) + '/' + year;
}

function getDateFromString(dateString) {
	var dateSplit = dateString.split('/');
	var day = parseInt(dateSplit[0]);
	var month = parseInt(dateSplit[1]);
	var year = parseInt(dateSplit[2]);
	return new Date(year, month, day);
}

function formatCurrencies () {
	$.each($('.amount'), function (index, elem) {
		if ($(elem).hasClass('formatme')) {
			var value = parseFloat($(elem).html());
			if (value != NaN) {
				$(elem).html(formatCurrency(value));
				$(elem).removeClass('formatme');
				$(elem).addClass('formatted');
			}
		}
	});
}

function formatCurrency(value) {
	var formattedValue = value.toString();
	if (value >= 1000) {
		value = value.toString();
		var valueSplit = value.split('.');
		var integral = valueSplit[0];
		formattedValue = valueSplit.length > 1 ? '.' + valueSplit[1] : '';
		var generalRegex = /(\d+)(\d{3})/;
		if (generalRegex.test(integral)) {
			integral = integral.replace(generalRegex, '$1' + ',' + '$2');
		}
		var rupeeRegex = /(\d+)(\d{2})/;
		var integralSplit = integral.split(',');
		if (integralSplit.length > 1) {
			var integralPartToFormat = integralSplit[0];
			formattedValue = integralSplit[1] + formattedValue;
			while (rupeeRegex.test(integralPartToFormat)) {
				integralPartToFormat = integralPartToFormat.replace(rupeeRegex, '$1' + ',' + '$2');
			}
			formattedValue = integralPartToFormat + ',' + formattedValue;
		} else {
			formattedValue = integral + formattedValue;
		}
	}
	return 'Rs. ' + formattedValue;
}

function clearFormFieldValues(formElement) {
	$.each($('#' + formElement + ' :input').not(':input[type=button], :input[type=submit], :input[type=reset]'), function(index, element) {
		$(element).val('');
	});
}

function showFormErrors(jsonObj, formId) {
	$.each($('#' + formId + ' span.showError'), function (index, element) {
		if (jsonObj[$(element).attr('name')]) {
			$(element).text(jsonObj[$(element).attr('name')][0]);
		}
	});
}

function setFormFieldValues(jsonObj, formId) {
	console.log(jsonObj);
	$.each($('#' + formId + ' :input').not(':input[type=button], :input[type=submit], :input[type=reset]'), function(index, element) {
		console.log($(element).attr('name'));
		console.log(jsonObj[$(element).attr('name')]);
		$(element).val(jsonObj[$(element).attr('name')]);
	});
}

function clearFormErrors(formId) {
	$.each($('#' + formId + ' span.showError'), function (index, element) {
		$(element).text('');
	});
}

function showSaveSuccess(id) {
	$.each($('.content'), function (index, elem) {
		$(elem).hide();
	});
	$('#' + id).show();
	$('#alertSuccess').fadeIn(1000);
	setTimeout(function () {$("#alertSuccess").fadeOut(1000);}, 5000);
}

function showSaveError(id) {
	$.each($('.content'), function (index, elem) {
		$(elem).hide();
	});
	$('#' + id).show();
	$('#alertError').fadeIn(1000);
	setTimeout(function () {$("#alertError").fadeOut(1000);}, 4000);
}

function saveUser() {
	// uncomment the below line once we implement a custom form serializer.
	// var formValues = serialize($('form #addAUser'));
	var formValues = {
		'keyHidden' : $('#id_keyHidden').val(),
		'firstName' : $('#id_firstName').val(),
		'lastName' : $('#id_lastName').val(),
		'alternateEmail' : $('#id_alternateEmail').val(),
		'dob' : $('#id_dob').val(),
		'about' : $('#id_about').val(),
	}
	var ajaxRequest = $.ajax({
		'url' : "/ajaxCall/saveUser",
		'data' : {arg : JSON.stringify([formValues])},
		'type' : 'POST',
		'dataType' : 'json',
		// by default async is true, this is FYI
		'async' : true

	});
	// callback handler that will be called on success
    ajaxRequest.done(function (response){
    	clearFormErrors('addAUser');
    	$('#alertInfo').fadeOut(1000);
    	if (response.isSaved) {
	    	$('#alertSuccess').fadeIn(1000);
	    	setTimeout(function () {
    			$("#alertSuccess").fadeOut(1000);
    		}, 6000);
    		if (response.isEdit) {
    			response.savedValues['name'] = response.savedValues['firstName'] + ' ' + response.savedValues['lastName'];
    			for (var key in response.savedValues) {
    				$('#' + key).html(response.savedValues[key]);
    			}
    			closePopUpForm();
    			setFormFieldValues(response.savedValues, 'addAUser');
    		} else {
    			var redirectUri = '/user/profile';
	    		clearFormFieldValues('addAUser');
	    		$('#addUserSuccessAlert').append('<a href="' + redirectUri + '">Click here.</a>')
	    		setTimeout(function () {window.location.href = redirectUri;}, 5000);
	    		setTimeout(function () {
	    			$("#alertSuccess").fadeOut(1000);
	    			$('#alertInfo').fadeIn(1000);
	    		}, 6000);
	            $('#id_dob').val(getFormattedDate(new Date()));
    		}
    	} else {
    		$('#alertError').fadeIn(1000);
    		setTimeout(function () {
    			$("#alertError").fadeOut(1000);
    			$('#alertInfo').fadeIn(1000);
    		}, 4000);
    		showFormErrors(response.errors, 'addAUser');
    	}
    	$('#saveUser').prop('disabled', false);
		$('#saveUser').val('Save');
    });
    // callback handler that will be called on failure
    ajaxRequest.fail(function (error){
        // log the error to the console
        console.error("The following error occured: "+ error);
        $('#showException').slideDown(1000);
    });
}

function showPopUpForm() {
	$('#transparentDiv').fadeIn(800);
	$('.formContainer').fadeIn(800);
}

function closePopUpForm() {
	$('.formContainer').fadeOut(800);
    $('#transparentDiv').fadeOut(800);
}

function saveAnExpense(hideFormAfterSave) {
	// uncomment the below line once we implement a custom form serializer.
	// var formValues = serialize($('form #addAnExpense'));
	var formValues = {
		'name' : $('#id_name').val(),
		'type' : $('#id_type').val(),
		'amount' : $('#id_amount').val(),
		'dateOfExpense' : $('#id_dateOfExpense').val(),
		'comments' : $('#id_comments').val(),
	}
	var ajaxRequest = $.ajax({
		'url' : "/ajaxCall/saveAnExpense",
		'data' : {arg : JSON.stringify([formValues])},
		'type' : 'POST',
		'dataType' : 'json',
		// by default async is true, this is FYI
		'async' : true

	});
	// callback handler that will be called on success
    ajaxRequest.done(function (response){
    	clearFormErrors('addAnExpense');
    	if (response.isSaved) {
    		clearFormFieldValues('addAnExpense');
    		showSaveSuccess('expenseSuccessAlert');
            $('#id_dateOfExpense').val(getFormattedDate(new Date()));
            if (hideFormAfterSave) {
            	closePopUpForm();
            }
    	} else {
    		showSaveError('expenseErrorAlert');
    		showFormErrors(response.errors, 'addAnExpense');
    	}
    	$('#saveAnExpenseButton').prop('disabled', false);
		$('#saveAnExpenseButton').val('Save');
    });

    // callback handler that will be called on failure
    ajaxRequest.fail(function (error){
        // log the error to the console
        console.error("The following error occured: "+ error);
        $('#showException').slideDown(1000);
    });
}

function deleteAnExpense(clickedImageElem) {
	var confirmed = confirm('Are you sure you want to delete this expense?');
	if (confirmed) {
		var td = clickedImageElem.parent('td');
		var tr = td.parent('tr.hoverBlue');
		var key = tr.attr('id');
		var ajaxRequest = $.ajax({
			'url' : "/ajaxCall/deleteAnExpense",
			'data' : {arg : JSON.stringify([key])},
			'type' : 'POST',
			'dataType' : 'json',
			// by default async is true, this is FYI
			'async' : true

		});
		// callback handler that will be called on success
	    ajaxRequest.done(function (response){
	    	if (response.isSaved) {
	    		showSaveSuccess('deleteExpenseSuccessAlert');
	    		$('#' + response.key).remove();
	    		if ($('#expenseListContainer').has('tr.hoverBlue').length == 0) {
	    			/**** If the deleted expense is the last one, then introduce no records row. ****/
	    			$('#expenseListContainer').loadTemplate($('#expenseNoRecordsTemplate'), {});
	    			$('#exportToSpreadsheet').hide(800);
	    		} else {
	    			var totalExpense = parseFloat($('#totalValue').attr('value'));
		    		if (totalExpense != NaN || totalExpense > 0) {
		    			totalExpense = totalExpense - response.amount;
		    			$('#totalValue').attr('value', totalExpense);
		    			$('#totalValue').html(totalExpense);
		    			$('#totalValue').removeClass('formatted');
		    			$('#totalValue').addClass('formatme');
		    			formatCurrencies();
		    		}
	    		}
	    	} else {
	    		showSaveError('deleteExpenseErrorAlert');
	    	}
	    });
	    // callback handler that will be called on failure
	    ajaxRequest.fail(function (error){
	        // log the error to the console
	        console.error("The following error occured: "+ error);
	        $('#showException').slideDown(1000);
	    });
	}	
}

var EXPENSE_BY_DATE = null;
var EXPENSE_BY_WEEK = null;
var EXPENSE_BY_MONTH = null;
var EXPENSE_BY_YEAR = null;
var LOADING_DIV = '<div class="loadingDiv"></div>';
var LOADING_COLSPAN = 5;
var LOADING_TR = '<tr><td colspan="' + LOADING_COLSPAN + '"><img src="/images/loading.gif" alt="Loading" /></td></tr>'

function filterByDate() {
	$('#exportToSpreadsheet').hide(800);
	$('#filterExpenseByToday').addClass('current');
	$.each($('#filterExpenseByToday').siblings(), function (index, element) {
		$(element).removeClass('current');
	});

	var ajaxRequest = $.ajax({
		'url' : "/ajaxCall/getTodaysExpense",
		'data' : {arg : JSON.stringify([])},
		'type' : 'POST',
		'dataType' : 'json',
		// by default async is true, this is FYI
		'async' : true
	});
	// callback handler that will be called on success
    ajaxRequest.done(function(expenses) {
    	EXPENSE_BY_DATE = expenses;
    	EXPENSE_BY_WEEK = null;
    	EXPENSE_BY_MONTH = null;
    	var expenseList = expenses.expenses;
    	if (expenseList.length > 0) {
    		$('#expenseListContainer').loadTemplate($('#expenseListTemplate'), expenseList);
    		bindOnClickForExpenseList();
    		// calculate and insert the total expenses.
    		$('#expenseListContainer').append($('#expenseTotalTemplate').html());
    		findAndInsertTotal(expenseList, 'totalValue', 'amount');
    		formatCurrencies();
    	} else {
    		$('#expenseListContainer').loadTemplate($('#expenseNoRecordsTemplate'), {});
    	}
    });
    // callback handler that will be called on failure
    ajaxRequest.fail(function (error){
        // log the error to the console
        console.error("The following error occured: "+ error);
        $('#showException').slideDown(1000);
    });
}

function filterByWeek() {
	$('#exportToSpreadsheet').hide(800);
	$('#filterExpenseByWeek').addClass('current');
	$.each($('#filterExpenseByWeek').siblings(), function (index, element) {
		$(element).removeClass('current');
	});

	var ajaxRequest = $.ajax({
		'url' : "/ajaxCall/getExpenseThisWeek",
		'data' : {arg : JSON.stringify([])},
		'type' : 'POST',
		'dataType' : 'json',
		// by default async is true, this is FYI
		'async' : true
	});
	// callback handler that will be called on success
    ajaxRequest.done(function(expenses) {
    	EXPENSE_BY_WEEK = expenses;
    	EXPENSE_BY_DATE = null;
    	EXPENSE_BY_MONTH = null;
    	var expenseList = expenses.expenses;
    	if (expenseList.length > 0) {
    		$('#expenseListContainer').loadTemplate($('#expenseListTemplate'), expenseList);
    		bindOnClickForExpenseList();
    		// calculate and insert the total expenses.
    		$('#expenseListContainer').append($('#expenseTotalTemplate').html());
    		findAndInsertTotal(expenseList, 'totalValue', 'amount');
    		formatCurrencies();
    	} else {
    		$('#expenseListContainer').loadTemplate($('#expenseNoRecordsTemplate'), {});
    	}
    });
    // callback handler that will be called on failure
    ajaxRequest.fail(function (error){
        // log the error to the console
        console.error("The following error occured: "+ error);
        $('#showException').slideDown(1000);
    });
}

function filterByMonth() {
	$('#filterExpenseByMonth').addClass('current');
	$.each($('#filterExpenseByMonth').siblings(), function (index, element) {
		$(element).removeClass('current');
	});

	var values = {
		'year' : $('#id_yearSelect').val(),
		'month' : $('input.radioButton:checked').val()
	}
	var ajaxRequest = $.ajax({
		'url' : "/ajaxCall/getExpenseThisMonth",
		'data' : {arg : JSON.stringify([values])},
		'type' : 'POST',
		'dataType' : 'json',
		// by default async is true, this is FYI
		'async' : true
	});
	// callback handler that will be called on success
    ajaxRequest.done(function(expenses) {
    	EXPENSE_BY_MONTH = expenses;
    	EXPENSE_BY_WEEK = null;
    	EXPENSE_BY_DATE = null;
    	expenseList = expenses.expenses;
    	if (expenseList.length > 0) {
    		$('#expenseListContainer').loadTemplate($('#expenseListTemplate'), expenseList);
    		bindOnClickForExpenseList();
    		// calculate and insert the total expenses.
    		$('#expenseListContainer').append($('#expenseTotalTemplate').html());
    		findAndInsertTotal(expenseList, 'totalValue', 'amount');
    		formatCurrencies();
    		$('#exportToSpreadsheet').show(800);
    	} else {
    		$('#expenseListContainer').loadTemplate($('#expenseNoRecordsTemplate'), {});
    		$('#exportToSpreadsheet').hide(800);
    	}
    });
    // callback handler that will be called on failure
    ajaxRequest.fail(function (error){
        // log the error to the console
        console.error("The following error occured: "+ error);
        $('#showException').slideDown(1000);
    });
}

function findAndInsertTotal(listOfValues, idToInsert, paramToAdd) {
	var total = 0;
	var isDict = false;
	if (paramToAdd) {
		isDict = true;
	}
	if (isDict) {
		$.each(listOfValues, function (index, value) {
			total = parseFloat(value[paramToAdd]) + parseFloat(total);
		});
	}
	$('#' + idToInsert).html(total.toFixed(2));
	$('#' + idToInsert).attr('value', total);
}

function bindOnClickForExpenseList() {
	$.each($('.delete'), function (index, elem) {
		$(elem).bind('click', function () {
			deleteAnExpense($(this));
		});
	});
}

function setStyleToGlossaryRadioButtons(elem) {
	$(elem).attr('checked', 'checked');
	$('label.current').removeClass('current');
	$(elem).next('label.contentLabel').addClass('current');
	$('#exportToSpreadsheet').bind('click', setExportURI);
}

function bindOnClicksForExpenseMonthFilter(isOnLoad) {
	var currentMonth = new Date().getMonth()+1;
	var currentYear = new Date().getFullYear();
	$.each($('input.radioButton'), function (index, elem) {
		$(elem).off('click');
		if (parseInt($(elem).val()) == currentMonth && parseInt($('#id_yearSelect').val()) == currentYear) {
			$(elem).on('click', function () {
				setStyleToGlossaryRadioButtons(this);
				$('div.filterMain').find('div.filterLeft').show(800);
				filterByDate();
			});
			if (isOnLoad) {
				$(elem).trigger('click');
			}
			
		} else {
			$(elem).on('click', function () {
				setStyleToGlossaryRadioButtons(this);
				$('div.filterMain').find('div.filterLeft').hide(800);
				filterByMonth();
			});
		}
	});
}

function binOnChangeForExpenseYearFilter() {
	bindOnClicksForExpenseMonthFilter();
	$('input.radioButton:checked').trigger('click');
}

function setExportURI() {
	var month = $('label.current').prev('input.radioButton').val();
	month = parseInt(month) < 10 ? '0' + month : month;
	var newExportURI = exportURI + '?handle=' + exportHandle.SPREADSHEET + '&date=01_' + month + '_' + $('#id_yearSelect').val();
	window.location.href = newExportURI;
}

function DrawGoogleChart(data) {
	this.data = data;
	this.totalList = new Array();
}

DrawGoogleChart.prototype.prepareExpense = function prepareExpenseData() {
	var monthTotal = {
		1 : 0,
		2 : 0,
		3 : 0,
		4 : 0,
		5 : 0,
		6 : 0,
		7 : 0,
		8 : 0,
		9 : 0,
		10 : 0,
		11 : 0,
		12 : 0,
	};
	var monthNameDict = {
		1 : 'Jan',
		2 : 'Feb',
		3 : 'Mar',
		4 : 'Apr',
		5 : 'May',
		6 : 'Jun',
		7 : 'Jul',
		8 : 'Aug',
		9 : 'Sep',
		10 : 'Oct',
		11 : 'Nov',
		12 : 'Dec'
	};
	var totalList = new Array();
	$.each(this.data, function (index, expense) {
		var date = getDateFromString(expense.dateOfExpense);
		monthTotal[date.getMonth()] = monthTotal[date.getMonth()] + parseFloat(expense.amount);
	});
	for (var key in monthTotal) {
		totalList.push([monthNameDict[key], monthTotal[key]]);
	}
	return totalList;
}

DrawGoogleChart.prototype.expense = function expenseChart() {
	var totalList = this.prepareExpense();
	var googleDataTable = new google.visualization.DataTable();
	googleDataTable.addColumn('string', 'Month');
	googleDataTable.addColumn('number', 'Total Expense in Rs.');
	$.each(totalList, function (index, elem) {
		googleDataTable.addRow(elem);
	});
	var options = {
		'title':'Statistical comparison of monthly expenses for the current year.',
		'width':850,
		'height':300
	};
	var chart = new google.visualization.ColumnChart(document.getElementById('statsContainer'));
	chart.draw(googleDataTable, options);
}

function showStatistics(tabNumber, elem) {
	$('#statsContainer').html(LOADING_DIV);
	$('.tabContainer .firstLevel .current').removeClass('current');
	switch (tabNumber) {
		case 0: $(elem).addClass('current');
				getExpenseStats();
				break;
		case 1: $(elem).addClass('current');
				getDebtStats();
				break;
	}
}

function getExpenseStats() {
	var values = {
		'year' : 2013,
	}
	if (EXPENSE_BY_YEAR == null || EXPENSE_BY_YEAR.length == 0) {
		var ajaxRequest = $.ajax({
			'url' : "/ajaxCall/getExpenseOfYear",
			'data' : {arg : JSON.stringify([values])},
			'type' : 'POST',
			'dataType' : 'json',
			// by default async is true, this is FYI
			'async' : true
		});
		// callback handler that will be called on success
	    ajaxRequest.done(function(expenses) {
	    	var expenseList = expenses.expenses;
	    	EXPENSE_BY_YEAR = expenseList;
	    	showExpenseChart(expenseList);
	    });
	    // callback handler that will be called on failure
	    ajaxRequest.fail(function (error){
	        // log the error to the console
	        console.error("The following error occured: "+ error);
	        $('#showException').slideDown(1000);
	    });
	} else {
		// This is to avoid multiple server hits.
		showExpenseChart(EXPENSE_BY_YEAR);
	}
	
}

function showExpenseChart(expenseList) {
	if (expenseList.length > 0) {
		var drawChart = new DrawGoogleChart(expenseList);
		google.setOnLoadCallback(drawChart.expense());
	} else {
		$('#statsContainer').html('<span class="noValue">No statistics available.</span>');
	}
}

function getDebtStats () {
	$('#statsContainer').html('<span class="noValue">No statistics available.</span>');
}