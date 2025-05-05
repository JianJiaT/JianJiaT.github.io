let csvArray = []
let txtArray = []
const serverUrl = "https://jjt.pythonanywhere.com"

$(document).ready(function() {
    addInfoHandlers();
    addSelectorHandlers();
})

function hideInputForm(inputform) {
    inputform.style.display = "none";
}

function showInputForm(inputform) {
    inputform.style.display = "block";
}

function addInfoHandlers() {
    let infoicons = document.querySelectorAll(".info");
    for (infoicon of infoicons) {
        infoicon.addEventListener("mouseenter", (event) => showRelatedBox(event.target));
        infoicon.addEventListener("mouseleave", (event) => hideRelatedBox(event.target));
        infoicon.addEventListener("click", (event) => toggleRelatedBox(event.target));
    }
}

function showRelatedBox(infoicon) {
    let infobox = findRelatedBox(infoicon);
    if (!infobox.classList.contains("fixed")) {
        let currXOffset = window.pageXOffset;
        let currYOffset = window.pageYOffset;
        infobox.style.display = "inline-block";
        window.scrollTo(currXOffset, currYOffset);
    }
}

function hideRelatedBox(infoicon) {
    let infobox = findRelatedBox(infoicon);
    if (!infobox.classList.contains("fixed")) {
        infobox.style.display = "none";
    }
}

function toggleRelatedBox(infoicon) {
    let infobox = findRelatedBox(infoicon);
    if (infobox.classList.contains("fixed")) {
        infobox.style.display = "none";
        infobox.classList.remove("fixed");
    } else {
        infobox.style.display = "inline-block";
        infobox.classList.add("fixed");
    }
}

function findRelatedBox(infoicon) {
    let id = infoicon.id;
    let infoboxId = `${id}box`;
    let infobox = document.querySelector(`#${infoboxId}`);
    return infobox
}

function addSelectorHandlers() {
    let selectors = document.querySelectorAll("select");
    for (selector of selectors) {
        selector.addEventListener("input", (event) => removeErrorMessage(event.target));
    }
}

function placeErrorMessage(message, anchor) {
    removeErrorMessage(anchor);
    let errorMessageBox = document.createElement("div");
    errorMessageBox.classList.add("errormessagebox");
    errorMessageBox.id = `${anchor.id}errormessagebox`;
    errorMessageBox.textContent = "Failed: " + message;
    anchor.after(errorMessageBox);
}

function removeErrorMessage(anchor) {
    let errorMessageBox = document.querySelector(`#${anchor.id}errormessagebox`);
    if (errorMessageBox !== null) {
        errorMessageBox.remove();
    }
}

function appendOptionToSelector(option, selector) {
    let newop = document.createElement("option");
    newop.value = option;
    newop.textContent = option;
    selector.appendChild(newop);
}

function checkIsCsvOrExcel(fn) {
    const csvOrExcelExtensions = [".csv", ".xlsx"];
    for (extension of csvOrExcelExtensions) {
        if (fn.includes(extension)) {
            return true;
        }
    }
    return false;
}

function loadCsvFile(input) {
    let file = input.files[0]; // get first file in multi-select
    let anchor = document.querySelector("#csvfileloader");

    let fn = file.name;
    if (!checkIsCsvOrExcel) {
        placeErrorMessage("Please load a CSV file", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }

    if (getFile(fn, csvArray, "csvfile")) {
        placeErrorMessage("This CSV file is already loaded", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    
    let form_data = new FormData($('#csvfileloaderform')[0]);

    let csvselectors = document.querySelectorAll(".csvselector")
    for (csvselector of csvselectors) {
        appendOptionToSelector(fn, csvselector)
    }
    let csvObj = {name: fn, data: form_data}
    csvArray.push(csvObj);
}

function loadTxtFile(input) {
    let file = input.files[0]; // get first file in multi-select
    let anchor = document.querySelector("#txtfileloader");
    if (file.type != "text/plain") {
        placeErrorMessage("Please load a TXT file", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }

    let fn = file.name;
    if (getFile(fn, txtArray, "txtfile")) {
        placeErrorMessage("This TXT file is already loaded", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    
    var form_data = new FormData($('#txtfileloaderform')[0]);

    let txtselectors = document.querySelectorAll(".txtselector")
    for (txtselector of txtselectors) {
        appendOptionToSelector(fn, txtselector)
    }
    let txtObj = {name: fn, data: form_data}
    txtArray.push(txtObj);
}

function getFile(fn, fileArray, fileType) {
    if (fileArray.find(({name}) => name === fn)) {
        return fileArray.find(({name}) => name === fn).data.get(fileType);
    }
    return null;
}

$("#viewformloader").on("click", function() {
    toggleInputForm(viewform);
})

$("#viewer").on("click", function(event) {
    event.preventDefault();
    let fn = $("#csvs").val();
    let anchor = document.querySelector("#viewedcsvtoggler");
    if (fn === null || !checkIsCsvOrExcel(fn)) {
        placeErrorMessage("Please select a CSV file to view", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }

    let formData = new FormData($('#viewform')[0]);
    let viewedCsv = getFile(fn, csvArray, "csvfile");
    formData.set("viewedcsv", viewedCsv);

    $.ajax({
        type: 'POST',
        url: `${serverUrl}/view`,
        data: formData,
        contentType: false,
        cache: false,
        processData: false,
        success: function(response) {
            let table = document.querySelector("#viewedcsv");
            table.innerHTML = response;
            setupShadowedTable(table);
            let anchor = document.querySelector("#viewedcsvtoggler");
            removeErrorMessage(anchor);
        },
        error: function(jqxhr) {
            let anchor = document.querySelector("#viewedcsvtoggler");
            placeErrorMessage(jqxhr.responseText, anchor);
        },
    });
    viewedcsv.style.display = "table";
    hideInputForm(viewform);
})

$("#viewedcsvtoggler").on("click", function() {
    if (viewedcsv.style.display == "none") {
        viewedcsv.style.display = "table";
    } else {
        viewedcsv.style.display = "none";
    }
})

$("#saver").on("click", async function() {
    let fn = $("#csvs").val();
    let anchor = document.querySelector("#saver");
    if (fn === null || !checkIsCsvOrExcel(fn)) {
        placeErrorMessage("Please select a CSV file to save", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }

    let data = getFile(fn, csvArray, "csvfile");
    let downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', URL.createObjectURL(data));
    downloadLink.setAttribute('download', fn);
    
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
})

$("#deleter").on("click", function() {
    let fn = $("#csvs").val();
    let selectors = document.querySelectorAll("select");
    for (selector of selectors) {
        if (selector.value == fn) {
            selector.value = "csvplaceholder";
        }
    }
    let options = document.querySelectorAll(`option[value="${fn}"]`);
    for (option of options) {
        option.remove();
    }
    let csvIndex = csvArray.findIndex(({name}) => name === fn);
    csvArray.splice(csvIndex, 1);
    let csvLoader = document.querySelector("#csvfileloader");
    let loaderFn = csvLoader.value.split("\\")[2]; // 2 since file name is prepended with "C:\fakepath\"
    if (loaderFn == fn) {
        csvLoader.value = null;
    }
})

$("#customformloader").on("click", function() {
    toggleInputForm(customform);
})

$("#emailformloader").on("click", function() {
    toggleInputForm(emailform);
})

$("#phoneformloader").on("click", function() {
    toggleInputForm(phoneform);
})

$("#postalformloader").on("click", function() {
    toggleInputForm(postalform);
})

function toggleInputForm(inputform) {
    if (inputform.style.display == "block") {
        hideInputForm(inputform);
    } else {
        showInputForm(inputform);
    }
}

function postUpdateForm(route, formData, csvFn, anchor) {
    $.ajax({
        type: "POST",
        url: `${serverUrl}/${route}`,
        data: formData,
        contentType: false,
        cache: false,
        processData: false,
        xhr: function() {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 2) { // received response headers
                    if (xhr.status == 200) {
                        xhr.responseType = "blob"; // read response as file
                    } else {
                        xhr.responseType = "text"; // read response error message
                    }
                }
            };
            return xhr;
        },
        success: function(response) {
            updateCsv(response, csvFn, csvArray);
            removeErrorMessage(anchor);
        },
        error: function(jqxhr) {
            placeErrorMessage(jqxhr.responseText, anchor);
        },
    });
}

$("#emailform").on("submit", function(event) {
    event.preventDefault();
    let formData = new FormData($('#emailform')[0]);
    let emailCsvFn = formData.get("emaildatacsv");
    let anchor = document.querySelector("#emaildatacsv");
    if (emailCsvFn === null || !checkIsCsvOrExcel(emailCsvFn)) {
        placeErrorMessage("Please select an email CSV", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let emailCsv = getFile(emailCsvFn, csvArray, "csvfile");
    formData.set("emaildatacsv", emailCsv);
    let domainTxtFn = formData.get("domaintxt");
    anchor = document.querySelector("#domaintxt");
    if (domainTxtFn === null || !domainTxtFn.includes(".txt")) {
        placeErrorMessage("Please select a domain TXT", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let domainTxt = getFile(domainTxtFn, txtArray, "txtfile");
    formData.set("domaintxt", domainTxt);
    let separatorTxtFn = formData.get("separatortxt");
    anchor = document.querySelector("#separatortxt");
    if (separatorTxtFn === null || !separatorTxtFn.includes(".txt")) {
        placeErrorMessage("Please select a separator TXT", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let separatorTxt = getFile(separatorTxtFn, txtArray, "txtfile");
    formData.set("separatortxt", separatorTxt);

    anchor = document.querySelector("#emailformloader");
    postUpdateForm("email", formData, emailCsvFn, anchor);

    resetInputForm(emailform);
})

$("#phoneform").on("submit", function(event) {
    event.preventDefault();
    let formData = new FormData($('#phoneform')[0]);
    let phoneCsvFn = formData.get("phonedatacsv");
    let anchor = document.querySelector("#phonedatacsv");
    if (phoneCsvFn === null || !checkIsCsvOrExcel(phoneCsvFn)) {
        placeErrorMessage("Please select a phone CSV", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let phoneCsv = getFile(phoneCsvFn, csvArray, "csvfile");
    formData.set("phonedatacsv", phoneCsv);
    let areaTxtFn = formData.get("areatxt");
    anchor = document.querySelector("#areatxt");
    if (areaTxtFn === null || !areaTxtFn.includes(".txt")) {
        placeErrorMessage("Please select an area code TXT", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let areaTxt = getFile(areaTxtFn, txtArray, "txtfile");
    formData.set("areatxt", areaTxt);

    anchor = document.querySelector("#phoneformloader");
    postUpdateForm("phone", formData, phoneCsvFn, anchor);

    resetInputForm(phoneform);
})

$("#postalform").on("submit", function(event) {
    event.preventDefault();
    let formData = new FormData($('#postalform')[0]);
    let postalCsvFn = formData.get("postaldatacsv");
    let anchor = document.querySelector("#postaldatacsv");
    if (postalCsvFn === null || !checkIsCsvOrExcel(postalCsvFn)) {
        placeErrorMessage("Please select a postal CSV", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let postalCsv = getFile(postalCsvFn, csvArray, "csvfile");
    formData.set("postaldatacsv", postalCsv);

    anchor = document.querySelector("#postalformloader");
    postUpdateForm("postal", formData, postalCsvFn, anchor);

    resetInputForm(postalform);
})

$("#customform").on("submit", function(event) {
    event.preventDefault();
    let formData = new FormData($('#customform')[0]);
    let dataCsvFn = formData.get("datacsv");
    let anchor = document.querySelector("#datacsv");
    if (dataCsvFn === null || !dataCsvFn.includes(".csv")) {
        placeErrorMessage("Please select a data CSV", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let dataCsv = getFile(dataCsvFn, csvArray, "csvfile");
    formData.set("datacsv", dataCsv);
    let ruleCsvFn = formData.get("rulecsv");
    anchor = document.querySelector("#rulecsv");
    if (ruleCsvFn === null || !ruleCsvFn.includes(".csv")) {
        placeErrorMessage("Please select a rule CSV", anchor);
        return;
    } else {
        removeErrorMessage(anchor);
    }
    let ruleCsv = getFile(ruleCsvFn,csvArray, "csvfile");
    formData.set("rulecsv", ruleCsv);

    anchor = document.querySelector("#customformloader");
    postUpdateForm("apply", formData, dataCsvFn, anchor);

    resetInputForm(customform);
})

function updateCsv(responseData, csvFn, csvArray) {
    let fileType = "";
    if (csvFn.includes(".csv")) {
        fileType = "text/csv"
    } else {
        fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    }
    let newCsv = new File([responseData], csvFn, {type: fileType});
    let dataCsvIndex = csvArray.findIndex(({name}) => name === csvFn);
    let newFormData = new FormData();
    newFormData.append("csvfile", newCsv);
    let newCsvObj = {name: csvFn, data: newFormData};
    csvArray.splice(dataCsvIndex, 1, newCsvObj);
    if ($("#csvs").val() == csvFn) { // if user currently looking at updated csv...
        $("#viewer").trigger("click"); // ..refresh view by triggering click event
    }
}

function resetInputForm(inputform) {
    let csvselectors = inputform.querySelectorAll(".csvselector");
    for (csvselector of csvselectors) {
        csvselector.value = "csvplaceholder";
    }
    let textselectors = inputform.querySelectorAll(".txtselector");
    for (txtselector of textselectors) {
        txtselector.value = "txtplaceholder"
    }
    let inputs = inputform.querySelectorAll("input");
    for (input of inputs) {
        if (input.type == "submit") {
            continue;
        }
        input.value = null;
    }
    inputform.style.display = "none";
}

$("#clearer").on("click", function() {
    if (window.confirm("Clear current session? (Unsaved data will be lost!)")) {
        location.reload()
    }
})