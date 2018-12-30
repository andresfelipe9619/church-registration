var ROOT_FOLDER = "IGLESIA";
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

function validatePerson(email) {
  var inscritos = getPeopleRegistered();
  // var res = ""
  var result = {
    isRegistered: false,
    index: -1,
    data: null
  };

  for (var person in inscritos) {
    if (String(inscritos[person].email) === String(email)) {
      result.isRegistered = true;
      result.index = person;
      result.data = inscritos[person];
    }
  }

  logFunctionOutput(validatePerson.name, result);
  if (result.index < 0) {
    result.isRegistered = false;
  }
  return JSON.stringify(result)
}

function objectToSheetValues(object, headers) {
  var arrayValues = new Array(headers.length);
  var lowerHeaders = headers.map(function (item) {
    return item.toLowerCase();
  });

  for (var property in object) {
    for (var header in lowerHeaders) {
      if (String(property) == String(lowerHeaders[header])) {
        if (
          property == "nombres" ||
          property == "apellidos"
        ) {
          arrayValues[header] = object[property].toUpperCase();
        } else {
          arrayValues[header] = object[property];
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
  visitant["register_date"] = new Date();
  logFunctionOutput('person', visitant)

  var folder = createPersonFolder(visitant.email, visitant.photo)
  visitant.photo = folder.url
  visitant.firstname = visitant.firstname.toUpperCase()
  visitant.lastname = visitant.lastname.toUpperCase()
  var visitantValues = objectToSheetValues(visitant, headers)

  var finalValues = visitantValues.map(function (value) {
    return String(value)
  })
  // finalValues.pop()
  Logger.log('FINAL VALUES===>', finalValues);
  visitantsSheet.appendRow(finalValues);
  // var imageCell = visitantsSheet.insertImage(
  //   visitant.photo,
  //   visitantsSheet.getLastColumn(),
  //   visitantsSheet.getLastRow()
  // )
   
  // resizeImg(imageCell, 60)

  var result = { data: finalValues, ok: true }
  Logger.log('FINAL VALUES===>', result);

  // logFunctionOutput(registerVisitant.name, result)
  return result;
}

function sheetValuesToObject(sheetValues) {
  var headings = sheetValues[0].map(String.toLowerCase);
  var people = sheetValues.slice(1);
  var peopleWithHeadings = addHeadings(people, headings);

  function addHeadings(people, headings) {
    return people.map(function (personAsArray) {
      var personAsObj = {};

      headings.forEach(function (heading, i) {
        personAsObj[heading] = personAsArray[i];
      });

      return personAsObj;
    });
  }
  // logFunctionOutput(sheetValuesToObject.name, peopleWithHeadings)
  return peopleWithHeadings;
}

function getPersonFolder(mainFolder) {
  //se crea la carpeta que va conener todos los docmuentos
  var nameFolder = "fotos";
  var FolderFiles,
    folders = mainFolder.getFoldersByName(nameFolder);
  if (folders.hasNext()) {
    FolderFiles = folders.next();
  } else {
    FolderFiles = mainFolder.createFolder(nameFolder);
  }
  return FolderFiles;
}

function getMainFolder() {
  var dropbox = ROOT_FOLDER;
  var mainFolder,
    folders = DriveApp.getFoldersByName(dropbox);

  if (folders.hasNext()) {
    mainFolder = folders.next();
  } else {
    mainFolder = DriveApp.createFolder(dropbox);
  }
  return mainFolder;
}

function createPersonFolder(numdoc, data) {
  //se crea la carpeta que va contener los arhivos actuales
  var result = {
    url: "",
    file: ""
  };
  var mainFolder = getMainFolder();
  var currentFolder = getPersonFolder(mainFolder);

  var file = currentFolder.createFile(data);
  file.setDescription("Subido Por " + numdoc);
  file.setName(numdoc);
  result.url = file.getUrl();
  result.file = file.getName();
  return result;
}

function resizeImg(img, targetHeight) {
  var height = img.getHeight();
  var width = img.getWidth();
  var factor = height / targetHeight;
  img.setHeight(height / factor);
  img.setWidth(width / factor);
};

function logFunctionOutput(functionName, returnValue) {
  Logger.log("Function-------->" + functionName);
  Logger.log("Value------------>");
  Logger.log(returnValue);
  Logger.log("----------------------------------");
}
