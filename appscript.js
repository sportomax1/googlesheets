/**
 * Google Sheets CRUD API - CORS-Free Version
 * Handles all operations via GET requests with JSONP to avoid CORS issues
 * 
 * Setup Instructions:
 * 1. Replace this file's content in your Apps Script project
 * 2. Deploy as Web App with "Anyone" access
 * 3. Use the Web App URL in your HTML file
 */

// Your Google Sheet ID
var SHEET_ID = '1bmQFvpZyVMvGkUA-M8rTlw1xsYxE1orX3_et9n_Dul0';

/**
 * Handle GET requests (includes JSONP support)
 */
function doGet(e) {
  try {
    // Handle JSONP callback
    var callback = e.parameter.callback;
    var action = e.parameter.action || 'getSheets';
    
    var result;
    
    // Route based on action
    switch(action) {
      case 'getSheets':
        result = getSheets();
        break;
        
      case 'getData':
        var sheetName = e.parameter.sheet;
        if (!sheetName) {
          throw new Error('Sheet name is required');
        }
        result = getData(sheetName);
        break;
        
      case 'create':
        var sheetName = e.parameter.sheet;
        var recordData = e.parameter.record;
        if (!sheetName || !recordData) {
          throw new Error('Sheet name and record data are required');
        }
        // Parse JSON if it's a string
        if (typeof recordData === 'string') {
          recordData = JSON.parse(recordData);
        }
        result = createRecord(sheetName, recordData);
        break;
        
      case 'update':
        var sheetName = e.parameter.sheet;
        var rowIndex = parseInt(e.parameter.rowIndex);
        var recordData = e.parameter.record;
        if (!sheetName || !rowIndex || !recordData) {
          throw new Error('Sheet name, row index, and record data are required');
        }
        // Parse JSON if it's a string
        if (typeof recordData === 'string') {
          recordData = JSON.parse(recordData);
        }
        result = updateRecord(sheetName, rowIndex, recordData);
        break;
        
      case 'delete':
        var sheetName = e.parameter.sheet;
        var rowIndex = parseInt(e.parameter.rowIndex);
        if (!sheetName || !rowIndex) {
          throw new Error('Sheet name and row index are required');
        }
        result = deleteRecord(sheetName, rowIndex);
        break;
        
      case 'createSheet':
        var sheetName = e.parameter.sheetName;
        var headers = e.parameter.headers;
        if (!sheetName || !headers) {
          throw new Error('Sheet name and headers are required');
        }
        // Parse JSON if it's a string
        if (typeof headers === 'string') {
          headers = JSON.parse(headers);
        }
        result = createSheet(sheetName, headers);
        break;
        
      case 'addColumn':
        var sheetName = e.parameter.sheet;
        var columnName = e.parameter.columnName;
        var position = e.parameter.position || 'end';
        if (!sheetName || !columnName) {
          throw new Error('Sheet name and column name are required');
        }
        result = addColumn(sheetName, columnName, position);
        break;
        
      default:
        throw new Error('Invalid action: ' + action);
    }
    
    var response = {
      status: 200,
      data: result
    };
    
    // Return JSONP response if callback provided
    if (callback) {
      var jsonpResponse = callback + '(' + JSON.stringify(response) + ');';
      return ContentService.createTextOutput(jsonpResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Return regular JSON
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    
    var errorResponse = {
      status: 500,
      data: {
        error: error.toString()
      }
    };
    
    // Return JSONP error response if callback provided
    if (callback) {
      var jsonpErrorResponse = callback + '(' + JSON.stringify(errorResponse) + ');';
      return ContentService.createTextOutput(jsonpErrorResponse)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Return regular JSON error
    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get list of all sheets in the spreadsheet
 */
function getSheets() {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheets = spreadsheet.getSheets();
    
    var sheetList = [];
    for (var i = 0; i < sheets.length; i++) {
      var sheet = sheets[i];
      sheetList.push({
        name: sheet.getName(),
        index: sheet.getIndex()
      });
    }
    
    return sheetList;
  } catch (error) {
    Logger.log('Error getting sheets: ' + error.toString());
    throw new Error('Failed to get sheets: ' + error.toString());
  }
}

/**
 * Get all data from a specific sheet
 */
function getData(sheetName) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    var range = sheet.getDataRange();
    if (range.getNumRows() === 0) {
      return {
        headers: [],
        data: [],
        totalRows: 0
      };
    }
    
    var values = range.getValues();
    var headers = values[0];
    var dataRows = values.slice(1);
    
    var formattedData = [];
    for (var i = 0; i < dataRows.length; i++) {
      var row = dataRows[i];
      var record = {};
      
      for (var j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j] || '';
      }
      
      formattedData.push({
        rowIndex: i + 2, // +2 because of 1-based indexing and header row
        values: row,
        record: record
      });
    }
    
    return {
      headers: headers,
      data: formattedData,
      totalRows: dataRows.length
    };
    
  } catch (error) {
    Logger.log('Error getting data from sheet ' + sheetName + ': ' + error.toString());
    throw new Error('Failed to get data: ' + error.toString());
  }
}

/**
 * Create a new record in the specified sheet
 */
function createRecord(sheetName, record) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    // Get headers
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headers = headerRange.getValues()[0];
    
    if (headers.length === 0) {
      throw new Error('No headers found in sheet');
    }
    
    // Build row data based on headers
    var rowData = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      rowData.push(record[header] || '');
    }
    
    // Add the new row
    sheet.appendRow(rowData);
    
    return {
      success: true,
      message: 'Record created successfully',
      rowIndex: sheet.getLastRow()
    };
    
  } catch (error) {
    Logger.log('Error creating record in sheet ' + sheetName + ': ' + error.toString());
    throw new Error('Failed to create record: ' + error.toString());
  }
}

/**
 * Update an existing record in the specified sheet
 */
function updateRecord(sheetName, rowIndex, record) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    // Validate row index
    if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
      throw new Error('Invalid row index: ' + rowIndex);
    }
    
    // Get headers
    var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    var headers = headerRange.getValues()[0];
    
    // Build row data based on headers
    var rowData = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      rowData.push(record[header] || '');
    }
    
    // Update the row
    var range = sheet.getRange(rowIndex, 1, 1, headers.length);
    range.setValues([rowData]);
    
    return {
      success: true,
      message: 'Record updated successfully',
      rowIndex: rowIndex
    };
    
  } catch (error) {
    Logger.log('Error updating record in sheet ' + sheetName + ' at row ' + rowIndex + ': ' + error.toString());
    throw new Error('Failed to update record: ' + error.toString());
  }
}

/**
 * Delete a record from the specified sheet
 */
function deleteRecord(sheetName, rowIndex) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    // Validate row index
    if (rowIndex < 2 || rowIndex > sheet.getLastRow()) {
      throw new Error('Invalid row index: ' + rowIndex);
    }
    
    // Delete the row
    sheet.deleteRow(rowIndex);
    
    return {
      success: true,
      message: 'Record deleted successfully',
      deletedRowIndex: rowIndex
    };
    
  } catch (error) {
    Logger.log('Error deleting record in sheet ' + sheetName + ' at row ' + rowIndex + ': ' + error.toString());
    throw new Error('Failed to delete record: ' + error.toString());
  }
}

/**
 * Create a new sheet with specified headers
 */
function createSheet(sheetName, headers) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // Check if sheet already exists
    var existingSheet = spreadsheet.getSheetByName(sheetName);
    if (existingSheet) {
      throw new Error('Sheet with name "' + sheetName + '" already exists');
    }
    
    // Create new sheet
    var newSheet = spreadsheet.insertSheet(sheetName);
    
    // Add headers to the first row
    if (headers && headers.length > 0) {
      var headerRange = newSheet.getRange(1, 1, 1, headers.length);
      headerRange.setValues([headers]);
      
      // Format headers
      headerRange.setBackground('#4CAF50');
      headerRange.setFontColor('white');
      headerRange.setFontWeight('bold');
    }
    
    return {
      success: true,
      message: 'Sheet "' + sheetName + '" created successfully',
      sheetName: sheetName,
      headers: headers
    };
    
  } catch (error) {
    Logger.log('Error creating sheet ' + sheetName + ': ' + error.toString());
    throw new Error('Failed to create sheet: ' + error.toString());
  }
}

/**
 * Add a new column to an existing sheet
 */
function addColumn(sheetName, columnName, position) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    
    var lastColumn = sheet.getLastColumn();
    var insertColumn;
    
    if (position === 'start') {
      // Insert at the beginning
      insertColumn = 1;
      sheet.insertColumnBefore(1);
    } else {
      // Insert at the end (default)
      insertColumn = lastColumn + 1;
      sheet.insertColumnAfter(lastColumn);
    }
    
    // Set the header for the new column
    var headerCell = sheet.getRange(1, insertColumn);
    headerCell.setValue(columnName);
    
    // Format the header
    headerCell.setBackground('#4CAF50');
    headerCell.setFontColor('white');
    headerCell.setFontWeight('bold');
    
    return {
      success: true,
      message: 'Column "' + columnName + '" added successfully',
      columnName: columnName,
      position: position,
      columnIndex: insertColumn
    };
    
  } catch (error) {
    Logger.log('Error adding column to sheet ' + sheetName + ': ' + error.toString());
    throw new Error('Failed to add column: ' + error.toString());
  }
}