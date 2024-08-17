function setAccessForTeams() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('General');
  var emailRange = sheet.getRange('B4:H');
  var emailValues = emailRange.getValues();
  var emails = emailValues.flat().filter(function(email) {
    return email.trim() !== '';
  });
  var lastRow = sheet.getLastRow();
  var presEmails = sheet.getRange('A4:A' + lastRow).getValues().flat();
  presEmails = presEmails.filter(email => email.trim() !== '');
  var advisoryBoardEmails = sheet.getRange('I4:I' + lastRow).getValues().flat();
  advisoryBoardEmails = advisoryBoardEmails.filter(email => email.trim() !== '');
  var currentEditors = ss.getEditors();
  var currentViewers = ss.getViewers();
  currentEditors.forEach(function(editor) {
    ss.removeEditor(editor);
  });
  currentViewers.forEach(function(viewer) {
    ss.removeViewer(viewer);
  });
  emails.forEach(function(email) {
    ss.addViewer(email);
  });
  presEmails.forEach(function(email) {
    ss.addEditor(email);
  });
  advisoryBoardEmails.forEach(function(email){
    ss.addEditor(email);
  });
}
function onFormSubmit(event) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var form = FormApp.openById('form_id');
  var responses = form.getResponses();
  var formCount = responses.length;
  var response = responses[formCount-1];
  var itemResponses = response.getItemResponses();
  var email = responses[0].getRespondentEmail();
  if(!checkValidEmail(ss,email)) return;
  var assignorTeams = getAssignorTeams(ss,email);
  var assignorPres = getAssignorPres(ss,assignorTeams);
  record = [];
  for(var j=0;j<itemResponses.length;j++){
    var itemResponse = itemResponses[j];
    var filled = itemResponse.getResponse();
    record.push(filled);
  }
  updateBoard(ss,assignorPres,assignorTeams,record);
}

function getAssignorPres(ss, assignorTeams) {
  var sheet = ss.getSheetByName('General');
  var presEmails = sheet.getRange('A4:A').getValues().flat();
  var headers = sheet.getRange('B3:I3').getValues().flat();
  var teamColumns = {};
  for (var i = 0; i < headers.length; i++) {
    if (assignorTeams.includes(headers[i])) {
      teamColumns[headers[i]] = sheet.getRange(4, i + 3, sheet.getLastRow() - 3, 1).getValues().flat();
    }
  }
  var presInTeams = new Set();
  
  presEmails.forEach(email => {
    for (var team in teamColumns) {
      if (teamColumns[team].includes(email)) {
        presInTeams.add(email);
        break;
      }
    }
  });
  
  var result = Array.from(presInTeams).filter(email => email.trim() !== '');
  return result;
}


function checkValidEmail(ss, email) {
  var sheet = ss.getSheetByName('General');
  var allEmails = sheet.getRange('A4:I').getValues().flat();
  return allEmails.includes(email);
}

function getAssignorTeams(ss, email) {
  var sheet = ss.getSheetByName('General');
  var headers = sheet.getRange('A3:I3').getValues().flat();
  var teams = [];
  for (var i = 0; i < headers.length; i++) {
    var column = sheet.getRange(4, i + 1, sheet.getLastRow() - 3, 1).getValues().flat();
    if (column.includes(email)) {
      teams.push(headers[i]);
    }
  }
  return teams;
}
function formatDate(dateString, format) {
  var date = new Date(dateString);
  return Utilities.formatDate(date, 'GMT+05:30', format);
}
function updateBoard(ss,assignorPres,assignorTeams,record){
  var boardSheet = ss.getSheetByName('Board');
  var generalSheet = ss.getSheetByName('General');
  //step 1 - send mail
  var assignedTeam = record[0][0];
  var assignorTeam = assignorTeams[0];
  var headers = generalSheet.getRange('A3:H3').getValues().flat();
  var teamIndex = headers.indexOf(assignedTeam)+1;
  assignedTeamEmails = [];
  if (teamIndex >= 1 && teamIndex <= 8) {
    var columnLetter = String.fromCharCode(65 + teamIndex - 1);
    assignedTeamEmails = generalSheet.getRange(columnLetter + '4:' + columnLetter + generalSheet.getLastRow()).getValues().flat();
    assignedTeamEmails = assignedTeamEmails.filter(email => email.trim() !== '');
  }

  var teamSubject = 'New Work Assignment Request';
  var teamBody = 'You have a new work assignment request for your team. Please discuss it and attend to it ASAP. Please check the board for details. Board Link: '+ ss.getUrl() + '\n\nRegards,\nGeeksforGeeks RGIPT Student Chapter';
  assignedTeamEmails.forEach(function(email) {
    MailApp.sendEmail(email, teamSubject, teamBody);
  });
  var isAdvisoryBoard = assignorPres.length === 0;
  var presSubject = 'Approval Required for Work Assignment Request';
  var presBody = 'A work assignment request requires your approval. Please check the board for details and approve the request as soon as possible. Board Link: '+ ss.getUrl() + '\n\nRegards,\nGeeksforGeeks RGIPT Student Chapter';
  if (!isAdvisoryBoard) {
    assignorPres.forEach(function(email) {
      MailApp.sendEmail(email, presSubject, presBody);
    });
  }
  //step 2 - update board sheet
  var description = record[1];
  var approvedByAssignorHead = isAdvisoryBoard ? 'TRUE' : '';
  var deadline = formatDate(record[2], 'dd/MM/yyyy');;
  var priority = record[3];
  var status = 'Waiting';
  var formattedDate = Utilities.formatDate(new Date(), 'GMT+05:30', 'dd/MM/yyyy');
  var lastRow = boardSheet.getLastRow()+1;
  var range1 = boardSheet.getRange('C'+lastRow);
  var range2 = boardSheet.getRange('F'+lastRow);
  var range3 = boardSheet.getRange('G'+lastRow);
  var pList = ['Low','Medium','High'];
  var sList = ['Waiting','Working','Review','Done','Backlog'];
  var rule1 = SpreadsheetApp.newDataValidation().requireValueInList(pList).setAllowInvalid(false).setHelpText("Choose from the list.").build();
  var rule2 = SpreadsheetApp.newDataValidation().requireValueInList(sList).setAllowInvalid(false).setHelpText("Choose from the list.").build();
  var row = [
    assignorTeam,
    description,
    approvedByAssignorHead,
    assignedTeam,
    deadline,
    priority,
    status,
    formattedDate,
  ];
  boardSheet.appendRow(row);
  range1.insertCheckboxes();
  range1.setValue(approvedByAssignorHead);
  range2.setDataValidation(rule1);
  range3.setDataValidation(rule2);
  var deadlineDate = new Date(record[2]);
  var reminderDate = new Date(deadlineDate);
  reminderDate.setDate(deadlineDate.getDate() - 1);
  ScriptApp.newTrigger('sendReminderEmail')
    .timeBased()
    .at(reminderDate)
    .create();
}
function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;
  var editedValue = range.getValue();
  var column = range.getColumn();
  var row = range.getRow();
  if (sheet.getName() === 'Board') {
    if (column === 7 || column === 3) { 
      if (column === 7) {
        handleStatusChange(sheet, row, editedValue);
      }
      if (column === 3) {
        handleApprovalChange(sheet, row, editedValue);
      }
    }
  }
}


function handleStatusChange(sheet, row, status) {
  var color;
  switch (status) {
    case 'Done':
      color = '#D0F0C0'; // Light Green
      scheduleRowDeletion(sheet, row);
      break;
    case 'Backlog':
      color = '#F4B6C2'; // Light Red
      break;
    case 'Working':
      color = '#FFFFE0'; // Light Yellow
      break;
    case 'Review':
      color = '#D0E0F0'; // Light Blue
      break;
    default:
      color = '#FFFFFF'; // White
  }
  sheet.getRange('A' + row + ':H' + row).setBackground(color);
}
function handleApprovalChange(sheet, row, approved) {
  if (approved === true) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var assignedTeam = sheet.getRange('A' + row).getValue();
    var generalSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('General');
    var headers = generalSheet.getRange('A3:H3').getValues().flat();
    var teamIndex = headers.indexOf(assignedTeam) + 1;
    var assignedTeamEmails = [];
    if (teamIndex >= 1 && teamIndex <= 8) {
      var columnLetter = String.fromCharCode(65 + teamIndex - 1);
      assignedTeamEmails = generalSheet.getRange(columnLetter + '4:' + columnLetter + generalSheet.getLastRow()).getValues().flat();
      assignedTeamEmails = assignedTeamEmails.filter(email => email.trim() !== '');
    }
    var teamSubject = 'Approval Granted for Work Assignment Request';
    var teamBody = 'Your work assignment request has been approved. Please proceed with the task. Check the board for details. Board Link: ' + ss.getUrl() + '\n\nRegards,\nGeeksforGeeks RGIPT Student Chapter';
    assignedTeamEmails.forEach(function(email) {
      MailApp.sendEmail(email, teamSubject, teamBody);
    });
  }
}
function scheduleRowDeletion(sheet, row) {
  var statusCell = sheet.getRange('G' + row);
  var status = statusCell.getValue();
  
  if (status === 'Done') {
    var deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 3);
    
    ScriptApp.newTrigger('deleteRow')
      .timeBased()
      .at(deletionDate)
      .create();
    PropertiesService.getScriptProperties().setProperty('rowToDelete', row);
  }
}
function deleteRow() {
  var row = parseInt(PropertiesService.getScriptProperties().getProperty('rowToDelete'));
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Board');
  
  if (row) {
    sheet.deleteRow(row);
    PropertiesService.getScriptProperties().deleteProperty('rowToDelete');
  }
}
function checkDeadlines() {
  var boardSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Board');
  var lastRow = boardSheet.getLastRow();
  var range = boardSheet.getRange(2, 1, lastRow - 1, 8);
  var values = range.getValues();
  var today = new Date();
  var shouldNotify = false;

  for (var i = 0; i < values.length; i++) {
    var deadlineStr = values[i][4];
    var status = values[i][6];
    var deadline = new Date(deadlineStr.split("/").reverse().join("/"));

    if (today > deadline && status !== 'Done') {
      boardSheet.getRange(i + 2, 7).setValue('Backlog');
      boardSheet.getRange(i + 2, 1, 1, 8).setBackground('#F4B6C2');
      shouldNotify = true;
    }
  }
  if (shouldNotify) {
    notifyPresidents();
  }
}

function notifyPresidents() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('General');
  var lastRow = sheet.getLastRow();
  var presEmails = sheet.getRange('A4:A' + lastRow).getValues().flat();
  presEmails = presEmails.filter(email => email.trim() !== '');
  var presSubject = 'Assignment Status Update';
  var presBody = 'A work assignment has been updated to backlog due to missed deadline. Please check the board for details. Board Link: '+ ss.getUrl() + '\n\nRegards,\nGeeksforGeeks RGIPT Student Chapter';
  presEmails.forEach(function(email) {
    MailApp.sendEmail(email, presSubject, presBody);
  });
}
