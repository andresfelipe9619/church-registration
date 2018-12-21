var GENERAL_DB =
  "https://docs.google.com/spreadsheets/d/1Mryv_mGfzTjm0eEvAx1QI0-54CelC7PuBNAq6zSicms/edit?usp=sharing";

function doGet(request) {
  return HtmlService.createTemplateFromFile("index.html")
    .evaluate() // evaluate MUST come before setting the Sandbox mode
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetFromSpreadSheet(url, sheet) {
  var Spreedsheet = SpreadsheetApp.openByUrl(url);
  if (url && sheet) return Spreedsheet.getSheetByName(sheet);
}

function getRawDataFromSheet(url, sheet) {
  var mSheet = getSheetFromSpreadSheet(url, sheet);
  if (mSheet)
    return mSheet.getSheetValues(
      1,
      1,
      mSheet.getLastRow(),
      mSheet.getLastColumn()
    );
}

function getPeopleRegistered() {
  var peopleSheet = getRawDataFromSheet(GENERAL_DB, "VISITANTES");
  var peopleObjects = sheetValuesToObject(peopleSheet);
  // logFunctionOutput(getPeopleRegistered.name, peopleObjects)
  return peopleObjects;
}

function searchPerson(cedula) {
  var person = validatePerson(cedula);
  logFunctionOutput(searchPerson.name, person);
  return person;
}

function validatePerson(cedula) {
  var inscritos = getPeopleRegistered();
  // var res = ""
  var result = {
    isRegistered: false,
    index: -1,
    data: null
  };

  for (var person in inscritos) {
    if (String(inscritos[person].cedula) === String(cedula)) {
      result.isRegistered = true;
      result.index = person;
      result.data = inscritos[person];
    }
  }

  logFunctionOutput(validatePerson.name, result);

  if (result.index > -1) {
    return result;
  } else {
    result.isRegistered = false;
    return result;
  }
}

function objectToSheetValues(object, headers) {
  var arrayValues = new Array(headers.length);
  var lowerHeaders = headers.map(function(item) {
    return item.toLowerCase();
  });

  Logger.log("HEADERS");
  Logger.log(lowerHeaders);
  Logger.log("OBJECT");
  Logger.log(object);
  for (var property in object) {
    for (var header in lowerHeaders) {
      if (String(property) == String(lowerHeaders[header])) {
        if (
          property == "nombres" ||
          property == "apellidos"
        ) {
          arrayValues[header] = object[property].toUpperCase();
          Logger.log(arrayValues);
        } else {
          arrayValues[header] = object[property];
          Logger.log(arrayValues);
        }
      }
    }
  }
  //logFunctionOutput(objectToSheetValues.name, arrayValues)
  return arrayValues;
}

function registerVisitant(visitant) {
  var visitantsSheet = getSheetFromSpreadSheet(GENERAL_DB, "VISITANTES");
  var headers = visitantsSheet.getSheetValues(1, 1, 1, visitantsSheet.getLastColumn())[0];
  visitant["register_date"] =  new Date(); 
  logFunctionOutput('person', visitant)

  var visitantValues = objectToSheetValues(visitant, headers)
  var finalValues = visitantValues.map(function (value) {
    return String(value)
  })
  createStudentFolder(visitant.photo)
  visitantsSheet.appendRow(finalValues)
  visitantsSheet.insertImage(visitant.photo, visitantsSheet.getLastRow(), getLastColumn())
  var result = { data: finalValues, ok: true }
  logFunctionOutput(registerVisitant.name, result)
  return result;
}

function sheetValuesToObject(sheetValues) {
  var headings = sheetValues[0].map(String.toLowerCase);
  var people = sheetValues.slice(1);
  var peopleWithHeadings = addHeadings(people, headings);

  function addHeadings(people, headings) {
    return people.map(function(personAsArray) {
      var personAsObj = {};

      headings.forEach(function(heading, i) {
        personAsObj[heading] = personAsArray[i];
      });

      return personAsObj;
    });
  }
  // logFunctionOutput(sheetValuesToObject.name, peopleWithHeadings)
  return peopleWithHeadings;
}

function getMainFolder() {
  var dropbox = "iglesia";
  var mainFolder,
    folders = DriveApp.getFoldersByName(dropbox);

  if (folders.hasNext()) {
    mainFolder = folders.next();
  } else {
    mainFolder = DriveApp.createFolder(dropbox);
  }
  return mainFolder;
}

function createStudentFolder(numdoc, data) {
  //se crea la carpeta que va contener los arhivos actuales
  var result = {
    url: '',
    file: ''
  }
  var mainFolder = getMainFolder();
  var currentFolder = getCurrentFolder(numdoc, mainFolder);
  result.url = currentFolder.getUrl();

  // var contentType = data.substring(5, data.indexOf(';')),
  //   bytes = Utilities.base64Decode(data.substr(data.indexOf('base64,') + 7)),
  //   blob = Utilities.newBlob(bytes, contentType, file);

  var file = currentFolder.createFile(data);
  file.setDescription("Subido Por " + numdoc);
  file.setName(numdoc + "_photo");
  result.file = file.getName();
  return result;
}


function logFunctionOutput(functionName, returnValue) {
  Logger.log("Function-------->" + functionName);
  Logger.log("Value------------>");
  Logger.log(returnValue);
  Logger.log("----------------------------------");
}
