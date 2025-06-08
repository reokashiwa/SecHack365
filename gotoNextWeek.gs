function gotoNextWeek() {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadSheet_Id = spreadSheet.getId();
  const spreadSheet_file = DriveApp.getFileById(spreadSheet_Id);

  const col_min = 2; //ぬりぬり最初の列数 (B列なら2)
  const row_min = 3; //ぬりぬり最初の行数
  const col_max = spreadSheet.getSheets()[0].getMaxColumns();
  const row_max = spreadSheet.getSheets()[0].getMaxRows();
  const col_num = col_max - col_min + 1;
  const row_num = row_max - row_min + 1;

  // 複製先の作成
  const parents = spreadSheet_file.getParents();
  var parent;
  if (parents.hasNext()) {
    parent = parents.next();
  } else {
    return null;
  }
  const parent_FolderName = parent.getName();
  const nextFolderName = parent_FolderName.split(" ")[0] + " " + String(Number(parent_FolderName.split(" ")[1]) + 1);
  var grandParents = parent.getParents();
  var grandParent;
  if (grandParents.hasNext()) {
    grandParent = grandParents.next();
  } else {
    return null;
  }
  const existingFolders = grandParent.getFoldersByName(nextFolderName);
  var newFolder;
  if (existingFolders.hasNext()) {
    Logger.log("すでにフォルダが存在しています: " + existingFolders.next().getUrl());
    return null;
  } else {
    newFolder = grandParent.createFolder(nextFolderName);
    Logger.log("新規作成しました: " + newFolder.getUrl());
  }

  const copied_File = spreadSheet_file.makeCopy(spreadSheet_file.getName());
  copied_File.moveTo(newFolder);
  const copied_Spreadsheet = SpreadsheetApp.openById(copied_File.getId());
  Logger.log(copied_Spreadsheet.getUrl());

  var copied_Spreadsheet_sheets = copied_Spreadsheet.getSheets();
  for (var i = copied_Spreadsheet_sheets.length - 1; i > 0 ; i--) {
    if (copied_Spreadsheet_sheets[i]) {
      copied_Spreadsheet.deleteSheet(copied_Spreadsheet_sheets[i]);
    } else {
      Logger.log(`シート "${copied_Spreadsheet_sheets[i]}" は存在しません。`)
    }
  }

  // 複製の初期化
  const original_Firstday = copied_Spreadsheet_sheets[0].getRange(1,col_min).getValue();
  var new_Firstday;
  if (original_Firstday instanceof Date) {
    new_Firstday = new Date(original_Firstday);
    new_Firstday.setDate(new_Firstday.getDate() + 7);
  } else {
    Logger.log("B1には日付が入力されていません。");
    return null;
  }
  copied_Spreadsheet_sheets[0].getRange(1,col_min).setValue(new_Firstday);

  for (let row = 0; row < row_num; row++) {
    for (let col = 0; col < col_num; col++) {
      copied_Spreadsheet_sheets[0].getRange(row_min + row, col_min + col).setValue("");
      copied_Spreadsheet_sheets[0].getRange(row_min + row, col_min + col).setBackground('#ffffff')
    }
  }

  // シートの複製と権限の設定
  const id_Spreadsheet = SpreadsheetApp.openById("1tbckHu9qBfhXR8fNDY3ZH5zNXQ1soQV9FWgjhJV1NZY");
  const id_Sheet = id_Spreadsheet.getSheetByName("trainee");
  for (let row = 2; row <= id_Sheet.getMaxRows(); row++ ) {
    const name = id_Sheet.getRange(row, 3).getValue();
    const email = id_Sheet.getRange(row, 12).getValue();
    const copiedSheet = copied_Spreadsheet_sheets[0].copyTo(copied_Spreadsheet);
    copiedSheet.setName(name);
    copiedSheet.protect().setDescription(name);
    copiedSheet.protect().addEditor(email);
    const currentEditors = copiedSheet.protect().getEditors();
    currentEditors.forEach(user => {
      if (user.getEmail() !== email) {
        copiedSheet.protect().removeEditor(user);
      }
    });
    const me = Session.getEffectiveUser();
    copiedSheet.protect().addEditor(me);
  }
}
