function setupShadowedTable(table) {
    addColumns(table);
    addShadowColumns(table);
    addShadowRows(table);
    attachShadowedTableClickHandler(table);
  }
  
  function addColumns(table) {
    // consider remove existing columns
    let thead = table.querySelector("thead");
    let numOfCols = thead.querySelectorAll("th").length;
    let colgroup = document.createElement("colgroup");
    for (let i = 0; i < numOfCols; i++) {
      let col = document.createElement("col");
      colgroup.append(col);
    }
    table.prepend(colgroup);
  }
  
  function addShadowColumns(table) {
    let columns = table.querySelectorAll("col");
    [...columns].forEach((column) => {
      addShadowColumn(column, table)
    })
  }
  
  function addShadowColumn(targetColumn, table) {
    let newColumn = document.createElement("col");
    newColumn.classList.add("shadowcol");
    newColumn.style.visibility = "collapse";
    targetColumn.after(newColumn);
    
    let columns = table.querySelectorAll("col");
    let targetColIndex = [...columns].indexOf(targetColumn);
    if (targetColIndex == 0) {
        [...table.querySelectorAll("tr")].forEach((row, i) => {
            let targetCell = row.querySelector("th")
            let newCell = document.createElement("th") 
            newCell.textContent = i ? "Hidden" : "Show"
            targetCell.after(newCell)
          });
    } else {
        [...table.querySelectorAll("tr")].forEach((row, i) => {
            let targetCell, newCell;
            if (i == 0) {
                targetCell = row.querySelectorAll("th")[targetColIndex]
                newCell = document.createElement("th")
                newCell.textContent = "Show"
            } else {
                targetCell = row.querySelectorAll("td")[targetColIndex - 2]
                newCell = document.createElement("td")
                newCell.textContent = "Hidden"
            }
            targetCell.after(newCell)
          });
    }
  }
  
  function addShadowRows(table) {
    let rows = table.querySelectorAll("tr");
    [...rows].forEach((row) => {
      addShadowRow(row, table)
    })
  }
  
  function addShadowRow(targetRow, table) {
    let newRow = document.createElement("tr");
    newRow.classList.add("shadowrow");
    newRow.style.visibility = "collapse";
  
    let colCount = table.querySelectorAll("col").length;
    for (let i = 0; i < colCount; i++) {
      let cellType = i ? "td" : "th";
      let newCell = document.createElement(cellType)
      newCell.textContent = i ? "Hidden" : "Show"
      newRow.append(newCell)
    }
    
    targetRow.after(newRow);
  }
  
  function attachShadowedTableClickHandler(table) {
    table.onclick = function(event) {
      let target = event.target
      let rowInd = target.closest("tr").rowIndex
      let colInd = target.cellIndex
      if (rowInd == 0) {
        let columns = table.querySelectorAll("col");
        let column = columns[colInd]
        let colClass = (column.classList.length == 0) ? "" : column.classList[0];
        if (colClass == "shadowcol") {
          showColumn(colInd-1, columns)
          hideColumn(colInd, columns)
        } else {
          showColumn(colInd+1, columns)
          hideColumn(colInd, columns)
        }
      } else if (colInd == 0) {
        let rows = table.querySelectorAll("tr");
        let row = rows[rowInd]
        let rowClass = (row.classList.length == 0) ? "" : row.classList[0]
        if (rowClass == "shadowrow") {
          showRow(rowInd - 1, rows)
          hideRow(rowInd, rows)
        } else {
          showRow(rowInd + 1, rows)
          hideRow(rowInd, rows)
        }
      }
    }
  }
  
  function hideColumn(colIndex, columns) {
    let column = columns[colIndex]
    if (column) {
       column.style.visibility = "collapse";
    }
  }
  
  function showColumn(colIndex, columns) {
    let column = columns[colIndex]
    if (column) {
       column.style.visibility = "";
    }
  }
  
  function hideRow(rowIndex, rows) {
    let row = rows[rowIndex]
    if (row) {
      row.style.visibility = "collapse";
    }
  }
  
  function showRow(rowIndex, rows) {
    let row = rows[rowIndex]
    if (row) {
      row.style.visibility = "";
    }
  }